/**
 * Localized month + weekday names via `Intl`, keyed on the active i18n language
 * (callers pass `i18n.language`). Replaces the old hardcoded English MONTH_NAMES
 * array so month/weekday display switches with the UI language. Storage format
 * (calendar.ts `toISODate`) stays locale-independent and is unaffected.
 */

function cap(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

/** Full (or short) month name for a 0-based month index, in the given locale. */
export function monthName(index: number, locale: string, opts: { short?: boolean } = {}): string {
  const fmt = new Intl.DateTimeFormat(locale, { month: opts.short ? "short" : "long" });
  // Day 1 of an arbitrary non-DST-edge year — only the month matters.
  return cap(fmt.format(new Date(2000, index, 1)));
}

/** Narrow weekday initials, Sunday-first (matches the DatePicker grid), in the given locale. */
export function weekdayNarrow(locale: string): string[] {
  const fmt = new Intl.DateTimeFormat(locale, { weekday: "narrow" });
  // Jan 2 2000 is a Sunday; step through the week.
  return Array.from({ length: 7 }, (_, i) => cap(fmt.format(new Date(2000, 0, 2 + i))));
}
