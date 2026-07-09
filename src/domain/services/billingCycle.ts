import type { Card } from "../entities/Card";
import { isBillableCreditCard } from "../entities/Card";
import {
  addMonths,
  clampDay,
  makeLocalDate,
  startOfDay,
} from "../value-objects/calendar";

/**
 * Payment due date for the statement that CLOSED in (year, monthIndex).
 * If the due day falls after the cut day it lands in the same month,
 * otherwise it rolls into the next month. Returns null for cards without
 * a billing cycle (debit/cash or incomplete credit setup).
 */
export function statementPaymentDueDate(
  card: Card,
  year: number,
  monthIndex: number,
): Date | null {
  if (!isBillableCreditCard(card)) return null;
  if (card.paymentDueDay > card.cutDay) {
    return makeLocalDate(year, monthIndex, clampDay(year, monthIndex, card.paymentDueDay));
  }
  const next = addMonths(year, monthIndex, 1);
  return makeLocalDate(
    next.year,
    next.monthIndex,
    clampDay(next.year, next.monthIndex, card.paymentDueDay),
  );
}

/**
 * The previous month stays "open" (the user may still be logging expenses
 * that belong to that billing cycle) while at least one credit card's
 * payment due date for the previous month's statement hasn't passed.
 */
export function isPreviousMonthOpen(cards: Card[], today: Date): boolean {
  const prev = addMonths(today.getFullYear(), today.getMonth(), -1);
  const todayStart = startOfDay(today).getTime();
  return cards.some((card) => {
    const due = statementPaymentDueDate(card, prev.year, prev.monthIndex);
    return due !== null && todayStart <= due.getTime();
  });
}

/**
 * Month-grid locking rule:
 * - the current month is always enabled,
 * - the previous month is enabled only while it is still open (see above),
 * - every other month (future or older past) is disabled.
 */
export function isMonthEnabled(
  year: number,
  monthIndex: number,
  cards: Card[],
  today: Date,
): boolean {
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();
  if (year === currentYear && monthIndex === currentMonth) return true;
  const prev = addMonths(currentYear, currentMonth, -1);
  if (year === prev.year && monthIndex === prev.monthIndex) {
    return isPreviousMonthOpen(cards, today);
  }
  return false;
}

/** Availability of the 12 months of `year`, index 0 = January. */
export function getYearAvailability(year: number, cards: Card[], today: Date): boolean[] {
  return Array.from({ length: 12 }, (_, monthIndex) =>
    isMonthEnabled(year, monthIndex, cards, today),
  );
}
