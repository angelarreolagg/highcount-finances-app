/**
 * Framework-agnostic calendar helpers. Dates are stored as local ISO strings
 * ("YYYY-MM-DD") and month indexes follow JS Date convention (0 = January).
 */

export interface YearMonth {
  year: number;
  monthIndex: number;
}

export interface CalendarDate extends YearMonth {
  day: number;
}

export function daysInMonth(year: number, monthIndex: number): number {
  return new Date(year, monthIndex + 1, 0).getDate();
}

/** Clamp a nominal day-of-month (e.g. cut day 31) into a real date for that month. */
export function clampDay(year: number, monthIndex: number, day: number): number {
  return Math.min(day, daysInMonth(year, monthIndex));
}

export function addMonths(year: number, monthIndex: number, delta: number): YearMonth {
  const total = year * 12 + monthIndex + delta;
  return { year: Math.floor(total / 12), monthIndex: ((total % 12) + 12) % 12 };
}

export function makeLocalDate(year: number, monthIndex: number, day: number): Date {
  return new Date(year, monthIndex, day);
}

export function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function toISODate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function parseISODate(iso: string): CalendarDate {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) throw new Error(`Invalid ISO date: ${iso}`);
  return { year: y, monthIndex: m - 1, day: d };
}

/** "YYYY-MM" prefix used to group transactions by month. */
export function monthPrefix(year: number, monthIndex: number): string {
  return `${year}-${String(monthIndex + 1).padStart(2, "0")}`;
}

export function isoToDate(iso: string): Date {
  const { year, monthIndex, day } = parseISODate(iso);
  return makeLocalDate(year, monthIndex, day);
}
