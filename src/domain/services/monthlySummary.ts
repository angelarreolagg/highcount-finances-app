import type { Transaction } from "../entities/Transaction";
import { Money } from "../value-objects/Money";

export interface MonthlySummary {
  totalIncome: Money;
  totalExpenses: Money;
  net: Money;
  largestExpense: Transaction | null;
}

export function summarizeTransactions(transactions: Transaction[]): MonthlySummary {
  let totalIncome = Money.zero();
  let totalExpenses = Money.zero();
  let largestExpense: Transaction | null = null;

  for (const t of transactions) {
    if (t.type === "income") {
      totalIncome = totalIncome.add(t.amount);
    } else {
      totalExpenses = totalExpenses.add(t.amount);
      if (largestExpense === null || t.amount.greaterThan(largestExpense.amount)) {
        largestExpense = t;
      }
    }
  }

  return {
    totalIncome,
    totalExpenses,
    net: totalIncome.subtract(totalExpenses),
    largestExpense,
  };
}

export interface MonthBreakdown {
  monthIndex: number;
  income: Money;
  expenses: Money;
}

/**
 * Bucket a year's transactions into 12 month slots (0 = January) with income
 * and expense totals. Months without activity stay at zero.
 */
export function summarizeYearByMonth(transactions: Transaction[]): MonthBreakdown[] {
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
    }
  }

  return byMonth;
}
