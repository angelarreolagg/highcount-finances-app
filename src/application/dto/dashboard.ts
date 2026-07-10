import type { Money } from "../../domain/value-objects/Money";
import type { MonthStatus } from "../../domain/services/billingCycle";
import type { RiskLevel } from "../../domain/services/riskIndicator";

export interface OverviewDTO {
  /** Income received up to today. */
  totalIncome: Money;
  /** Expenses dated up to today. */
  totalExpensesToDate: Money;
  /** totalIncome − totalExpensesToDate. */
  currentBalance: Money;
  /** totalIncome − ALL committed expenses (future MSI/MCI installments included). */
  realBalance: Money;
}

export interface MonthTotalsDTO {
  income: Money;
  expenses: Money;
  net: Money;
}

export interface LargestExpenseDTO {
  amount: Money;
  categoryName: string;
  description: string;
  date: string;
}

export interface DashboardSummaryDTO {
  year: number;
  monthIndex: number;
  /** All-time money position (home hero). */
  overview: OverviewDTO;
  /** Viewable / open-for-logging state for the 12 months of `year` (0 = January). */
  monthStatuses: MonthStatus[];
  /** Income / spent / net for the 12 months of `year` (0 = January). */
  monthTotals: MonthTotalsDTO[];
  totalIncome: Money;
  totalExpenses: Money;
  net: Money;
  largestExpense: LargestExpenseDTO | null;
  /** Latest manually-logged savings balance, if any. */
  currentSavings: Money | null;
  /** total savings ÷ average monthly income, as a display string (1 decimal). */
  monthsOfRunway: string | null;
  riskLevel: RiskLevel;
}
