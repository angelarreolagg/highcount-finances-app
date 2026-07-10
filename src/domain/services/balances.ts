import type { Transaction } from "../entities/Transaction";
import { Money } from "../value-objects/Money";
import { toISODate } from "../value-objects/calendar";

export interface Balances {
  /** Income received up to and including today. */
  totalIncome: Money;
  /** Expenses dated up to and including today. */
  totalExpensesToDate: Money;
  /** ALL expenses, including future-dated MSI/MCI installments not yet paid. */
  totalCommittedExpenses: Money;
  /** totalIncome − totalExpensesToDate: money position as of today. */
  currentBalance: Money;
  /** totalIncome − totalCommittedExpenses: the "real" total once every committed installment is honored. */
  realBalance: Money;
}

export function computeBalances(transactions: Transaction[], today: Date): Balances {
  const todayIso = toISODate(today);

  let totalIncome = Money.zero();
  let totalExpensesToDate = Money.zero();
  let totalCommittedExpenses = Money.zero();

  for (const t of transactions) {
    if (t.type === "income") {
      if (t.date <= todayIso) totalIncome = totalIncome.add(t.amount);
    } else {
      totalCommittedExpenses = totalCommittedExpenses.add(t.amount);
      if (t.date <= todayIso) totalExpensesToDate = totalExpensesToDate.add(t.amount);
    }
  }

  return {
    totalIncome,
    totalExpensesToDate,
    totalCommittedExpenses,
    currentBalance: totalIncome.subtract(totalExpensesToDate),
    realBalance: totalIncome.subtract(totalCommittedExpenses),
  };
}
