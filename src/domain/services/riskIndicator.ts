import type Decimal from "decimal.js";
import type { Transaction } from "../entities/Transaction";
import { Money } from "../value-objects/Money";

export const RUNWAY_WARNING_THRESHOLD_MONTHS = 3;

export type RiskLevel = "ok" | "warning" | "unknown";

export interface RunwayAssessment {
  /** total savings ÷ average monthly income; null when it can't be computed. */
  monthsOfRunway: Decimal | null;
  level: RiskLevel;
}

/**
 * Average monthly income across the distinct months that have at least one
 * income transaction. Null when there is no income data at all.
 */
export function averageMonthlyIncome(transactions: Transaction[]): Money | null {
  const incomes = transactions.filter((t) => t.type === "income");
  if (incomes.length === 0) return null;
  const distinctMonths = new Set(incomes.map((t) => t.date.slice(0, 7)));
  const total = incomes.reduce((acc, t) => acc.add(t.amount), Money.zero());
  return total.dividedBy(distinctMonths.size);
}

export function assessRunway(
  totalSavings: Money | null,
  monthlyIncome: Money | null,
): RunwayAssessment {
  if (totalSavings === null || monthlyIncome === null || !monthlyIncome.isPositive()) {
    return { monthsOfRunway: null, level: "unknown" };
  }
  const runway = totalSavings.ratio(monthlyIncome);
  if (runway === null) return { monthsOfRunway: null, level: "unknown" };
  return {
    monthsOfRunway: runway,
    level: runway.lessThan(RUNWAY_WARNING_THRESHOLD_MONTHS) ? "warning" : "ok",
  };
}
