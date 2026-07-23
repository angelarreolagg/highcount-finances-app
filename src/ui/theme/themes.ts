/**
 * Theme catalog for the Premium Themes feature (UI layer — no domain/application ties).
 *
 * Each theme is realized purely in CSS: `useApplyTheme` sets `data-theme` on <html>, and the
 * matching `[data-theme="…"]` block in `index.css` overrides the Tailwind v4 `--color-*`
 * custom properties (which every `text-mint`/`bg-panel` utility reads live). Only "default" is
 * free; the rest are premium (unlocked by any signed-in account).
 */

export type ThemeId =
  | "default"
  | "orange"
  | "purple"
  | "green"
  | "darkred"
  | "yellow"
  | "excel"
  | "casino";

export interface ThemeMeta {
  id: ThemeId;
  premium: boolean;
  /** Three preview dots for the picker tile. Raw hex — preview chrome only, not app tokens. */
  swatch: [string, string, string];
}

export const THEMES: ThemeMeta[] = [
  { id: "default", premium: false, swatch: ["#818cf8", "#34d399", "#f87171"] },
  { id: "orange", premium: true, swatch: ["#fb923c", "#f59e0b", "#f87171"] },
  { id: "purple", premium: true, swatch: ["#a78bfa", "#8b5cf6", "#e879f9"] },
  { id: "green", premium: true, swatch: ["#22c55e", "#10b981", "#4ade80"] },
  { id: "darkred", premium: true, swatch: ["#dc2626", "#7f1d1d", "#fca5a5"] },
  { id: "yellow", premium: true, swatch: ["#fbbf24", "#f59e0b", "#eab308"] },
  { id: "excel", premium: true, swatch: ["#217346", "#34a853", "#e8f5e9"] },
  { id: "casino", premium: true, swatch: ["#0b6b3a", "#c81e1e", "#d4af37"] },
];

const PREMIUM_IDS = new Set<ThemeId>(
  THEMES.filter((t) => t.premium).map((t) => t.id),
);

export function isPremiumTheme(id: ThemeId): boolean {
  return PREMIUM_IDS.has(id);
}

export const DEFAULT_THEME: ThemeId = "default";

/** Narrows an arbitrary persisted value back to a known ThemeId (falls back to default). */
export function normalizeTheme(value: unknown): ThemeId {
  return THEMES.some((t) => t.id === value) ? (value as ThemeId) : DEFAULT_THEME;
}
