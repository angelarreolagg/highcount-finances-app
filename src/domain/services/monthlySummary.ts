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
