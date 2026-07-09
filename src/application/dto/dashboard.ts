import type { Money } from "../../domain/value-objects/Money";
import type { RiskLevel } from "../../domain/services/riskIndicator";

export interface LargestExpenseDTO {
  amount: Money;
  categoryName: string;
  description: string;
  date: string;
}

export interface DashboardSummaryDTO {
  year: number;
  monthIndex: number;
  /** Enabled/disabled state for the 12 months of `year` (0 = January). */
  monthAvailability: boolean[];
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
