# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

High Count — a local-only personal finance tracker (no backend). Tracks expenses/income per card/account, credit-card billing cycles (Mexican-style cut date + payment due date), MSI/MCI installment plans, manually-logged savings movements, and risk indicators (months of runway). Data persists in IndexedDB.

Domain logic and persistence are complete and tested. The UI follows a glassmorphism + Revolut-inspired dark design — **all UI work must follow `docs/DESIGN.md`** (tokens, glass recipe, motion language, route-shell composition rules, chart specs; it also describes the reference screenshots the design was distilled from).

## Commands

Package manager is pnpm.

- `pnpm dev` — start the Vite dev server
- `pnpm test` — run vitest (domain unit tests); `pnpm exec vitest run src/domain/services/billingCycle.test.ts` for a single file
- `pnpm build` — type-check via `tsc -b` then production build
- `pnpm lint` — ESLint over the whole repo (React Compiler rules are on — don't mutate/reassign variables during render)

## Architecture (layered / clean — strict dependency rule)

Outer layers depend inward, never the reverse. The point is portability: a future React Native or Electron/Tauri shell should reuse `domain/` and `application/` unchanged, replacing only `infrastructure/` and `ui/`.

- `src/domain/` — pure TypeScript, **zero framework imports** (no React, Zustand, Tanstack Query, or IndexedDB). Entities (`Transaction`, `Card`, `Category`, `SavingsEntry`, `MSIPlan`), value objects (`Money`, `calendar.ts` date helpers), business-rule services, and repository **interfaces** (ports).
- `src/application/` — use cases built as factories (`makeAddTransaction(deps)`) that take repository interfaces; DTOs crossing into the UI. Use cases: addTransaction, registerMSIPurchase, logSavingsGrowth, getDashboardSummary, getMonthDetail, getAnnualSummary, getExpensesFeed, getSavingsOverview, addCard.
- `src/infrastructure/` — adapters. `persistence/indexedDb/db.ts` is a small hand-rolled promise wrapper over native IndexedDB (no Dexie/idb); one repository implementation per store. `di/container.ts` is the composition root — it wires interfaces to implementations, builds the use cases, and seeds first-run data (default categories + a "Cash" account) via `initializeApp()`, which `main.tsx` awaits before rendering.
- `src/state/uiStore.ts` — the only Zustand store; holds **view state only**: the open month-detail selection and `activeModal` (`"addTransaction" | "manageCards" | "registerMsi" | "logSavings"`). All persisted data flows through Tanstack Query.
- `src/ui/` — React-only. `hooks/useDashboardData.ts` wraps every use case in Tanstack Query hooks (mutations invalidate all queries — local data is cheap to refetch); components/pages never touch repositories or IndexedDB directly. React Hook Form for all data entry; Motion (`motion/react`) stays UI-layer only.

## Routes & UI shell

Routes (`src/App.tsx`): `/` (HomePage), `/expenses` (ExpensesPage), `/savings` (SavingsPage), `/summary/:year` (AnnualSummaryPage).

- Every route renders through `ui/components/layout/PageShell.tsx`: animated backdrop, **static header** (wordmark / nav pills / profile avatar — must never animate on navigation), a hero slot, the floating bottom **ActionDock** (Add + MSI buttons, visible everywhere), and the globally-available modals. Home passes `lockDesktop` → viewport-locked no-scroll shell at `xl` (lists scroll inside their GlassCards); other routes scroll in a capped column while the header/hero zone is always full-bleed.
- `ui/components/layout/RouteHero.tsx`: shared hero (label + big number + sub-lines). The number renders via `ui/components/shared/RollingNumber.tsx` — slot-machine digit reels; `roll` prop per route: home `"pachinko"`, expenses `"down"`, savings `"up"`.
- Hero figures per route — Home: current balance (income − expenses to date) + total income/expenses + **Real total** (subtracts ALL committed MSI installments, paid or not, via `domain/services/balances.ts`) + runway chip. Expenses: current month spent/income/net + filterable transaction list (type/category/card/month) of the current month and any month still open for logging. Savings: net balance + total saved / total returns + hand-rolled SVG charts (`ui/components/savings/SavingsCharts.tsx` — no chart library; follow the chart spec in DESIGN.md).
- Cards & accounts are managed only in `CardsManagerModal`, opened from the profile dropdown (`ProfileMenu`: Cards & accounts, Log savings, Year in Review).

## Key invariants

- **All money math goes through `domain/value-objects/Money.ts`** (wraps decimal.js). Never native floats for currency (chart geometry may use `toNumber()` for display only). Persistence stores amounts as exact decimal strings via `toStorage()` / `Money.from()`.
- Dates are local ISO strings (`"YYYY-MM-DD"`); month indexes are 0-based (JS Date convention) throughout the domain. Helpers live in `domain/value-objects/calendar.ts` — note `toISODate` builds from local date parts deliberately (no `toISOString`, which shifts timezone).
- tsconfig has `erasableSyntaxOnly` (no enums, no constructor parameter properties) and `verbatimModuleSyntax` (use `import type` for type-only imports).
- ESLint's react-refresh rule forbids mixing component and non-component exports in one file (shared constants live in e.g. `motionPresets.ts`, `formStyles.ts`).

## Core business rules (all unit-tested in `src/domain/**/*.test.ts`)

- **Month statuses** (`billingCycle.ts`): each month has two independent flags. `isViewable` — every past and current month can be clicked to view its detail (even with no transactions); future months cannot. `isOpenForLogging` — the current month is always open; the previous month stays open only while some credit card's payment due date for the previous month's statement hasn't passed (due day ≤ cut day rolls the due date into the next month; days clamp for short months); all other months are closed.
- **MSI/MCI schedules** (`msiSchedule.ts`): total ÷ months rounded to cents; the **last** installment absorbs the rounding remainder so the sum is exact. Registering a plan (`registerMSIPurchase`) creates the plan plus one expense transaction per installment tagged with plan id + installment number; credit cards only. `totalAmount` is the full amount to be paid (interest included when `withInterest`).
- **Balances** (`balances.ts`): `currentBalance` = income ≤ today − expenses ≤ today; `realBalance` = income ≤ today − ALL expenses including future-dated MSI installments. Future income doesn't count.
- **Savings** (`savingsSummary.ts`): entries are manual **movements**, each a positive amount of kind `"deposit"` (money put in) or `"returns"` (interest produced); balance/total saved/total returns are cumulative sums. Legacy balance-snapshot records are migrated on read in `SavingsRepositoryIndexedDb` (a `balance` field maps to a deposit) — don't remove that mapping.
- **Risk indicator** (`riskIndicator.ts`): runway = current savings balance ÷ average monthly income (averaged over distinct months that have income); warning below 3 months; "unknown" when data is missing.
- **Annual summary** (`annualSummary.ts`): the current year is always available as a running summary, and past years always unlocked; only future years are locked. Year savings figures derive from the delta entries (start = cumulative before Jan 1).
