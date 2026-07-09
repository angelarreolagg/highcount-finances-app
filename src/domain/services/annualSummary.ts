import type { Card } from "../entities/Card";
import type { Category } from "../entities/Category";
import type { SavingsEntry } from "../entities/SavingsEntry";
import type { Transaction } from "../entities/Transaction";
import { Money } from "../value-objects/Money";
import { makeLocalDate, startOfDay } from "../value-objects/calendar";
import { summarizeTransactions } from "./monthlySummary";

export const ANNUAL_SUMMARY_UNLOCK_MONTH_INDEX = 11; // December
export const ANNUAL_SUMMARY_UNLOCK_DAY = 15;

export interface CategoryBreakdown {
  categoryId: string;
  categoryName: string;
  total: Money;
}

export interface CardBreakdown {
  cardId: string;
  cardName: string;
  total: Money;
}

export interface MonthBreakdown {
  monthIndex: number;
  income: Money;
  expenses: Money;
}

export interface AnnualSummary {
  year: number;
  totalIncome: Money;
  totalExpenses: Money;
  net: Money;
  largestExpense: Transaction | null;
  transactionCount: number;
  expensesByCategory: CategoryBreakdown[];
  expensesByCard: CardBreakdown[];
  byMonth: MonthBreakdown[];
  savingsStart: Money | null;
  savingsEnd: Money | null;
  savingsChange: Money | null;
}

/**
 * The Year in Review for year Y unlocks on December 15th of Y.
 * Past years are always unlocked, future years never are.
 */
export function isAnnualSummaryUnlocked(year: number, today: Date): boolean {
  const currentYear = today.getFullYear();
  if (year < currentYear) return true;
  if (year > currentYear) return false;
  const unlockDate = makeLocalDate(
    year,
    ANNUAL_SUMMARY_UNLOCK_MONTH_INDEX,
    ANNUAL_SUMMARY_UNLOCK_DAY,
  );
  return startOfDay(today).getTime() >= unlockDate.getTime();
}

export function buildAnnualSummary(
  year: number,
  transactions: Transaction[],
  savingsEntries: SavingsEntry[],
  categories: Category[],
  cards: Card[],
): AnnualSummary {
  const totals = summarizeTransactions(transactions);

  const byCategory = new Map<string, Money>();
  const byCard = new Map<string, Money>();
  const byMonth: MonthBreakdown[] = Array.from({ length: 12 }, (_, monthIndex) => ({
    monthIndex,
    income: Money.zero(),
    expenses: Money.zero(),
  }));

  for (const t of transactions) {
    const monthIndex = Number(t.date.slice(5, 7)) - 1;
    if (t.type === "income") {
      byMonth[monthIndex].income = byMonth[monthIndex].income.add(t.amount);
    } else {
      byMonth[monthIndex].expenses = byMonth[monthIndex].expenses.add(t.amount);
      byCategory.set(t.categoryId, (byCategory.get(t.categoryId) ?? Money.zero()).add(t.amount));
      byCard.set(t.cardId, (byCard.get(t.cardId) ?? Money.zero()).add(t.amount));
    }
  }

  const categoryName = (id: string) =>
    categories.find((c) => c.id === id)?.name ?? "Unknown category";
  const cardName = (id: string) => cards.find((c) => c.id === id)?.name ?? "Unknown account";

  const expensesByCategory = [...byCategory.entries()]
    .map(([categoryId, total]) => ({ categoryId, categoryName: categoryName(categoryId), total }))
    .sort((a, b) => b.total.toNumber() - a.total.toNumber());

  const expensesByCard = [...byCard.entries()]
    .map(([cardId, total]) => ({ cardId, cardName: cardName(cardId), total }))
    .sort((a, b) => b.total.toNumber() - a.total.toNumber());

  const yearEntries = savingsEntries
    .filter((e) => e.date.startsWith(`${year}-`))
    .sort((a, b) => a.date.localeCompare(b.date));
  const savingsStart = yearEntries.length > 0 ? yearEntries[0].balance : null;
  const savingsEnd = yearEntries.length > 0 ? yearEntries[yearEntries.length - 1].balance : null;

  return {
    year,
    totalIncome: totals.totalIncome,
    totalExpenses: totals.totalExpenses,
    net: totals.net,
    largestExpense: totals.largestExpense,
    transactionCount: transactions.length,
    expensesByCategory,
    expensesByCard,
    byMonth,
    savingsStart,
    savingsEnd,
    savingsChange:
      savingsStart !== null && savingsEnd !== null ? savingsEnd.subtract(savingsStart) : null,
  };
}
