# High Count — Design Direction ("the moodboard")

This file is the single source of truth for High Count's visual language. All UI work
must follow it. It was distilled from 8 reference screenshots provided by the owner
(6 Revolut screens, 1 Revolut home = main inspiration, 1 Opal app screen); the images
are not stored in the repo, so they are described here well enough to stand alone.

## Mood, in one sentence

Dark, premium fintech: Revolut's deep-blue calm and confident numerals, fused with
Opal's luminous frosted glass. Dark-only — there is no light mode.

## The references, in words

**Revolut home (PRIMARY reference — the dashboard hero copies this).** A full-bleed
vertical gradient: light periwinkle at the very top → royal blue → deep navy →
near-black at the bottom. Centered composition: a small muted label ("Personal · All
accounts"), then a huge white balance where the cents render smaller than the integer
("$19" large, ".98" ~60% size), then a translucent white pill button. Below the fold:
a row of frosted circular action buttons (white/15, ~48px) with tiny labels under
them ("Add money", "Move", …), then near-opaque dark-navy cards (~#0B0D1F, ~24px
radius) holding transaction rows: circular icon on the left, title + muted time,
right-aligned amounts (positive amounts white, deltas muted).

**Revolut wealth/cards.** Near-black navy page. Large soft cards (roughly white at
5% opacity, 24px radius) with a muted card title + chevron. Rows inside: a colorful
filled circular icon chip (each row a different saturated hue), bold white label,
muted subtitle, right-aligned value or chevron.

**Revolut analytics.** Pure black. Big page header pattern: small muted "Spent",
giant white "$15", then a thin subtitle with a blue accent ("$3.69 avg. per month ·
Jan–Jun"). White bar chart on dotted hairline gridlines. A pill segmented control
(1W / 1M / 6M / 1Y) in white/10 with the active segment lighter. "By Category" rows
in a dark card: icon chip, name + "1 transaction", right-aligned −$amount and a muted
percentage.

**Revolut stock & crypto detail.** Black. Giant tabular price, semantic deltas
(mint green ▲ / red ▼) right under it. Charts glow: a mint line chart and red/green
candles with a soft neon bloom around the strokes. Primary CTA is a solid **white**
pill with black text ("Buy"). Pill segmented time ranges again.

**Opal (glassmorphism benchmark).** A luminous iridescent gem floats over a dark,
blurred green scene — the glow bleeds through everything. Cards are truly frosted:
visible backdrop blur, translucent fills, hairline light borders, soft colored
shadows. Accent text uses a gentle mint→blue gradient tint. This is the *texture*
target for High Count's cards and modals.

## Tokens

Implemented as Tailwind v4 `@theme` variables in `src/index.css`. Use the utility
names, never raw hexes in components.

| Token | Value | Use |
|---|---|---|
| `night` | `#05060E` | Page background (everything below the hero sits on this) |
| `panel` | `#0B0D1F` | Near-opaque card/modal base (used at /80–/90 opacity) |
| `peri` | `#818CF8` | Interactive accent: links, focus rings, current month |
| `peri-deep` | `#2536E8` | Hero gradient mid-stop |
| `mint` | `#34D399` | Income, positive deltas, "ok" risk state |
| `coral` | `#F87171` | Warnings, errors, "below runway" state |

- **App backdrop** (`.app-backdrop`): the gradient `#7C8CF8 → #2536E8 → #0A1180 →
  #05060E` is the dashboard's fixed full-viewport page background — drawn no-repeat
  at `100% 820px` so the blue covers the header zone and everything below it is pure
  `night`. It pans vertically (18s ease-in-out) and carries 2 blurred drifting radial
  blobs near the top. The hero is NOT a box — it's plain content floating on this
  backdrop (no rounded corners, no own background).
- **Glass surface recipe**: `bg-white/[0.06] + backdrop-blur-xl + border border-white/10 + rounded-3xl`.
  Glass is blur + translucency + hairline border — never a flat gray fill.
- **Text**: white primary, `white/60` secondary, `white/40` muted. Hairlines `white/10`.
- **Radius**: cards/modals 24px (`rounded-3xl`), controls and chips full (`rounded-full`),
  inputs `rounded-xl`.
- **Type**: system-ui stack. ALL monetary values use `tabular-nums`. Hero number is
  ~`text-5xl font-bold` with the cents rendered smaller (Revolut style). Section
  titles are small and muted (`text-sm text-white/60 font-semibold`), the data is
  what's big — never the labels.

## Motion language (Motion / `motion/react`)

- Springs everywhere: `{ type: "spring", bounce: 0.2 }`; no linear easings on UI.
- Section entrances: fade + 12px rise, staggered ~70ms via parent variants.
- **The header (wordmark / nav pills / avatar) NEVER animates on navigation** — it
  renders statically; only the hero info and content sections animate per route.
- **Hero numbers roll like slot reels** (`RollingNumber`): each digit is a 1em
  masked reel of 0–9 spun one full cycle on mount and re-rolled on data changes.
  Direction is themed per route — Home: "pachinko" (upward roll, bounce 0.3, reels
  settling left → right with increasing durations); Expenses: smooth downward roll;
  Savings: smooth upward roll. Non-digit characters stay static; reduced motion
  renders the plain number.
- Modals: AnimatePresence — backdrop fades, glass panel springs up (y 32→0,
  scale 0.96→1) and exits the same way.
- Buttons: `whileTap` scale 0.97 (0.94 for the dock's round buttons); subtle hover.
  The ActionDock magnifies macOS-style — item size springs with cursor distance.
- Ambient: the hero gradient pan (18s) and blob drift (26–34s) are CSS keyframes.
- **Reduced motion is respected**: `MotionConfig reducedMotion="user"` app-wide and a
  `prefers-reduced-motion` media query kills the ambient hero animation.

## Composition rules

1. Responsive, phone-first: a centered column (`max-w-md`, scrolls) that widens to a
   2-col grid at `md:max-w-3xl` (scrolls). At `xl` **every route goes full-bleed**
   (`xl:max-w-none` — no width cap); the difference is only vertical:
   Home also locks the viewport (`xl:h-dvh`, `lockDesktop`) so the page never scrolls,
   while Expenses / Savings / Summary keep scrolling. The content column carries the
   **same horizontal gutter as the header/hero** (`px-5 lg:px-8`, set once on PageShell's
   children wrapper — pages add only vertical padding) so cards align with the wordmark
   and avatar at the screen edge. Home's sections fill the freed
   height as a `4×2` grid — months span 2 columns × 2 rows on the left, This month /
   Cards on the top right, MSI / Savings below them. Lists that outgrow their card
   scroll INSIDE the card (GlassCard bodies are `overflow-y-auto`; global thin
   scrollbars) — the page itself never scrolls at `xl`. At `lg+` each month cell also
   shows tiny readable figures under the name: `+income` (mint), `−spent` (white/70),
   `net` (white/50), `text-[11px] tabular-nums`; inactive months show a muted `—`.
   The month calendar has prev/next **year navigation** (client state on Home); cells
   spring up slightly on hover.
2. The animated gradient exists only as the dashboard's app backdrop (see Tokens):
   blue over the header zone, pure `night` under the sections. Cards are frosted
   glass floating over that dark tail — the month grid's blur + tint diffuses
   whatever sits behind it, so it keeps its own surface color and never shows the
   animation sharply through it.
3. Actions split by frequency: everyday actions (Add transaction, MSI) live in the
   **ActionDock** — a floating bottom-centered glass panel (`fixed bottom-4`,
   `bg-panel/70 backdrop-blur-2xl rounded-3xl`) holding two rounded-square
   **liquid-glass** buttons (`rounded-2xl`) that magnify macOS-style as the cursor
   approaches (distance-based size spring, 48→68px; reduced motion keeps them
   static). Both share the same transparent frosted fill (`bg-white/[0.06]`) plus
   a specular top sheen — Add and MSI are distinguished only by their glow ring,
   not by color. Instead of static borders, each button wears an **animated glow
   ring** (`.dock-ring-*` in index.css): a conic-gradient light segment traveling
   around the rounded-square edge — Add in peri → sky with a warm amber spark
   opposite (4s), MSI a softer white/peri (6s); reduced motion freezes the ring as
   a static gradient border. Each action's name reveals as a small glass tooltip
   above the button on hover/focus (the buttons carry the full name as their
   `aria-label` for assistive tech). Visible on every route (pages reserve `pb-28`
   for it). Account-level
   actions (Cards & accounts manager, Log savings, Year in Review) live in the
   **profile dropdown** — a frosted avatar button at the header's top-right opening
   a small glass menu (`bg-panel/90`, `rounded-2xl`, springs in from the top-right,
   closes on outside click/Escape). Forms never sit inline on a page — always glass
   modals.
4. Money semantics: income mint with a `+`, expenses plain white with a `−`.
   Currency is MXN, `es-MX` locale (see `Money.format()`).
5. Icon chips: rows get a small filled circular chip (initial letter or icon) —
   colorful chips on dark cards, per the wealth screen. The hue is the row's
   **user-assigned color** when one was picked; otherwise it falls back to a hash
   of the row's id/name (`chipClassFor`). Transactions, MSI plans, and savings
   movements pick from a curated 8-swatch palette (`ChipColor`, Tailwind classes).
   **Cards/accounts** are different: they carry a **free hex color** and render as
   gradient card faces (no initial chip) — the Cards & accounts manager shows a
   grid of `CardVisual` mini-cards (2 cols on mobile, 3 from `sm`; gradient tinted
   by the card's color via `cardSurface`, inset hairline ring, optional `·last4`
   hint, type badge top-right), and the add/edit form shows the same `CardVisual`
   live above a **free color picker** (`ColorField`: a native OS color well only —
   no preset swatches). A brand-new card starts with a random color
   (`randomCardColor`); editing keeps the card's stored color. Card color persists
   as a hex string; cards without one fall back to the peri-deep blue gradient.
6. Copy is plain and directive: buttons say what they do ("Add expense", "Log
   balance"); empty states invite the action, they don't apologize.
   **Row actions**: every list row (transactions, cards, MSI plans, savings
   movements) exposes hover-reveal edit/delete icon buttons (`RowActions`) at its
   right edge — hidden until hover/focus on desktop, faintly visible on touch.
   Destructive actions always pass through the glass `DeleteConfirmModal` with a
   solid-coral `danger` button. Edits reuse the registration form in an "Edit"
   variant (prefilled, "Save changes"). MSI installments are managed only through
   their plan — installment rows show no actions, and editing a plan regenerates
   its schedule.
7. One bold thing per screen — the hero owns the drama; cards stay quiet. Before
   adding decoration, remove one.
8. **Route shell**: EVERY route renders through `PageShell` (backdrop + header with
   wordmark / nav pills / profile avatar + hero slot + ActionDock + global modals),
   Year in Review included — its back-arrow + year-pager + big spent figure sit in the
   `hero` slot (it doesn't use `RouteHero`, whose label+number contract doesn't fit).
   Most routes use `RouteHero` (muted label, big split number, route-specific
   sub-lines). The header + hero zone is ALWAYS full-bleed and identical across routes —
   the wordmark, nav, and avatar must not move when navigating.
   Home locks the desktop viewport (`lockDesktop`); Expenses, Savings, and Summary scroll.
   Hero numbers per route — Home: current balance (income − expenses to date), with
   total income, total expenses, REAL total (all MSI committed) and the runway chip;
   Expenses: current month spent, with income/net; Savings: net savings balance,
   with total saved (Σ deposits) and total returns (Σ returns).
   **Year in Review** lays its cards out as a desktop **bento** (`xl:grid-cols-4`):
   Highlights full-width on top, a tall By-category column (`col-span-2 row-span-2`)
   beside a stacked By-card / Month-by-month column — asymmetric sizing, not a uniform
   grid. Below `xl` it degrades to the standard 1-col → `md:grid-cols-2` stack.
9. **Savings model**: savings are logged as movements — `deposit` (money put in) or
   `returns` (interest produced), both positive amounts; balances are cumulative
   sums. Returns render in mint with a tiny kind tag; deposits in white.
10. **Charts** (savings route, hand-rolled SVG — no chart library): the two chart
   cards sit side by side from `md` up (`grid md:grid-cols-2`), History full-width
   below them. Single-series per chart, identity from the card title (no legend).
   Balance over time = 2px
   periwinkle line + 14%-opacity area + ≥8px markers ringed in `panel`; returns =
   thin mint bars with 4px rounded data-ends anchored to the baseline. Dotted
   `white/12` hairline gridlines with compact right-side axis labels; all values in
   text tokens (never the series color); hover tooltips on a glass panel; oversized
   hit targets. Colors validated against the dark card surface (contrast ≥ 3:1).
