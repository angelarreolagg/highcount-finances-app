import type { Card } from "../entities/Card";
import type { Category } from "../entities/Category";
import type { SavingsEntry } from "../entities/SavingsEntry";
import type { Transaction } from "../entities/Transaction";
import { Money } from "../value-objects/Money";
import { summarizeTransactions, summarizeYearByMonth } from "./monthlySummary";
import type { MonthBreakdown } from "./monthlySummary";

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
 * The Year in Review is available for the current year (as a running
 * summary) and every past year. Only future years are locked.
 */
export function isAnnualSummaryUnlocked(year: number, today: Date): boolean {
  return year <= today.getFullYear();
}

export function buildAnnualSummary(
  year: number,
  transactions: Transaction[],
  savingsEntries: SavingsEntry[],
  categories: Category[],
  cards: Card[],
): AnnualSummary {
  const totals = summarizeTransactions(transactions);

  const byMonth = summarizeYearByMonth(transactions);
  const byCategory = new Map<string, Money>();
  const byCard = new Map<string, Money>();

  for (const t of transactions) {
    if (t.type === "expense") {
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

  // Savings entries are deposit/returns deltas; derive the year's start balance
  // (cumulative before Jan 1) and the in-year change.
  const hasYearEntries = savingsEntries.some((e) => e.date.startsWith(`${year}-`));
  let savingsStart: Money | null = null;
  let savingsEnd: Money | null = null;
  if (hasYearEntries) {
    let before = Money.zero();
    let change = Money.zero();
    for (const e of savingsEntries) {
      const entryYear = Number(e.date.slice(0, 4));
      if (entryYear < year) before = before.add(e.amount);
      else if (entryYear === year) change = change.add(e.amount);
    }
    savingsStart = before;
    savingsEnd = before.add(change);
  }

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
