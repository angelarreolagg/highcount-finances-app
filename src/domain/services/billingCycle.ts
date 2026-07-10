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

export interface MonthStatus {
  /** Past and current months can always be opened to view their detail. */
  isViewable: boolean;
  /**
   * Logging rule: the current month is always open; the previous month
   * stays open only while its billing cycle is (see isPreviousMonthOpen);
   * every other month is closed for logging.
   */
  isOpenForLogging: boolean;
}

export function getMonthStatus(
  year: number,
  monthIndex: number,
  cards: Card[],
  today: Date,
): MonthStatus {
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();
  const isViewable =
    year < currentYear || (year === currentYear && monthIndex <= currentMonth);

  let isOpenForLogging = false;
  if (year === currentYear && monthIndex === currentMonth) {
    isOpenForLogging = true;
  } else {
    const prev = addMonths(currentYear, currentMonth, -1);
    if (year === prev.year && monthIndex === prev.monthIndex) {
      isOpenForLogging = isPreviousMonthOpen(cards, today);
    }
  }
  return { isViewable, isOpenForLogging };
}

/** Status of the 12 months of `year`, index 0 = January. */
export function getYearMonthStatuses(year: number, cards: Card[], today: Date): MonthStatus[] {
  return Array.from({ length: 12 }, (_, monthIndex) =>
    getMonthStatus(year, monthIndex, cards, today),
  );
}
