# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

High Count — a local-only personal finance tracker (no backend). Tracks expenses/income per card/account, credit-card billing cycles (Mexican-style cut date + payment due date), MSI/MCI installment plans, manually-logged savings growth, and risk indicators (months of runway). Data persists in IndexedDB.

The current state is a **foundation pass**: domain logic and persistence are complete and tested; the UI is intentionally plain (minimal Tailwind, no visual design). A follow-up styling pass will define the final look, animations, and modal choreography — don't pre-build visual polish unless asked.

## Commands

Package manager is pnpm.

- `pnpm dev` — start the Vite dev server
- `pnpm test` — run vitest (domain unit tests); `pnpm exec vitest run src/domain/services/billingCycle.test.ts` for a single file
- `pnpm build` — type-check via `tsc -b` then production build
- `pnpm lint` — ESLint over the whole repo

## Architecture (layered / clean — strict dependency rule)

Outer layers depend inward, never the reverse. The point is portability: a future React Native or Electron/Tauri shell should reuse `domain/` and `application/` unchanged, replacing only `infrastructure/` and `ui/`.

- `src/domain/` — pure TypeScript, **zero framework imports** (no React, Zustand, Tanstack Query, or IndexedDB). Entities (`Transaction`, `Card`, `Category`, `SavingsEntry`, `MSIPlan`), value objects (`Money`, `calendar.ts` date helpers), business-rule services, and repository **interfaces** (ports).
- `src/application/` — use cases built as factories (`makeAddTransaction(deps)`) that take repository interfaces; DTOs crossing into the UI.
- `src/infrastructure/` — adapters. `persistence/indexedDb/db.ts` is a small hand-rolled promise wrapper over native IndexedDB (no Dexie/idb); one repository implementation per store. `di/container.ts` is the composition root — it wires interfaces to implementations, builds the use cases, and seeds first-run data (default categories + a "Cash" account) via `initializeApp()`, which `main.tsx` awaits before rendering.
- `src/state/uiStore.ts` — the only Zustand store; holds **view state only** (e.g. which month-detail modal is open). All persisted data flows through Tanstack Query.
- `src/ui/` — React-only. `hooks/useDashboardData.ts` wraps every use case in Tanstack Query hooks (mutations invalidate all queries — local data is cheap to refetch); components/pages never touch repositories or IndexedDB directly. React Hook Form for all data entry; Framer Motion (`motion/react`) stays UI-layer only.

## Key invariants

- **All money math goes through `domain/value-objects/Money.ts`** (wraps decimal.js). Never native floats for currency. Persistence stores amounts as exact decimal strings via `toStorage()` / `Money.from()`.
- Dates are local ISO strings (`"YYYY-MM-DD"`); month indexes are 0-based (JS Date convention) throughout the domain. Helpers live in `domain/value-objects/calendar.ts` — note `toISODate` builds from local date parts deliberately (no `toISOString`, which shifts timezone).
- tsconfig has `erasableSyntaxOnly` (no enums, no constructor parameter properties) and `verbatimModuleSyntax` (use `import type` for type-only imports).

## Core business rules (all unit-tested in `src/domain/**/*.test.ts`)

- **Month locking** (`billingCycle.ts`): current month always enabled; previous month enabled only while some credit card's payment due date for the previous month's statement hasn't passed (due day ≤ cut day rolls the due date into the next month; days clamp for short months). All other months — future or older — are disabled. Per spec, older months are unclickable in the grid; history is viewed via the annual summary.
- **MSI/MCI schedules** (`msiSchedule.ts`): total ÷ months rounded to cents; the **last** installment absorbs the rounding remainder so the sum is exact. Registering a plan (`registerMSIPurchase`) creates the plan plus one expense transaction per installment tagged with plan id + installment number; credit cards only. `totalAmount` is the full amount to be paid (interest included when `withInterest`).
- **Risk indicator** (`riskIndicator.ts`): runway = latest manually-logged savings balance ÷ average monthly income (averaged over distinct months that have income); warning below 3 months; "unknown" when data is missing.
- **Annual summary** (`annualSummary.ts`): unlocks December 15 of its year; past years always unlocked, future never.
- Savings growth is **logged manually** by the user (a dated balance snapshot) — deliberately not automated.
