import type { CardRepository } from "../../domain/repositories/CardRepository";
import type { TransactionRepository } from "../../domain/repositories/TransactionRepository";
import { getYearMonthStatuses } from "../../domain/services/billingCycle";
import { summarizeYearByMonth } from "../../domain/services/monthlySummary";
import type { MonthStatus } from "../../domain/services/billingCycle";
import type { MonthTotalsDTO } from "../dto/dashboard";

export interface GetYearMonthGridDeps {
  transactionRepository: TransactionRepository;
  cardRepository: CardRepository;
}

export interface YearMonthGridDTO {
  year: number;
  /** Viewable / open-for-logging state for the 12 months of `year` (0 = January). */
  monthStatuses: MonthStatus[];
  /** Income / spent / net for the 12 months of `year` (0 = January). */
  monthTotals: MonthTotalsDTO[];
}

/**
 * The calendar grid for an arbitrary year — lets the dashboard browse past/current
 * years without recomputing the today-scoped dashboard summary. Reuses the same
 * year-agnostic services `getDashboardSummary` already uses for the current year.
 */
export function makeGetYearMonthGrid(deps: GetYearMonthGridDeps) {
  return async function getYearMonthGrid(
    year: number,
    today: Date = new Date(),
  ): Promise<YearMonthGridDTO> {
    const [yearTransactions, cards] = await Promise.all([
      deps.transactionRepository.getByYear(year),
      deps.cardRepository.getAll(),
    ]);

    return {
      year,
      monthStatuses: getYearMonthStatuses(year, cards, today),
      monthTotals: summarizeYearByMonth(yearTransactions).map((m) => ({
        income: m.income,
        expenses: m.expenses,
        net: m.income.subtract(m.expenses),
      })),
    };
  };
}
