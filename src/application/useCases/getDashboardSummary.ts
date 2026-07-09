import type { CardRepository } from "../../domain/repositories/CardRepository";
import type { CategoryRepository } from "../../domain/repositories/CategoryRepository";
import type { SavingsRepository } from "../../domain/repositories/SavingsRepository";
import type { TransactionRepository } from "../../domain/repositories/TransactionRepository";
import { getYearAvailability } from "../../domain/services/billingCycle";
import { summarizeTransactions } from "../../domain/services/monthlySummary";
import { assessRunway, averageMonthlyIncome } from "../../domain/services/riskIndicator";
import type { DashboardSummaryDTO } from "../dto/dashboard";

export interface GetDashboardSummaryDeps {
  transactionRepository: TransactionRepository;
  cardRepository: CardRepository;
  categoryRepository: CategoryRepository;
  savingsRepository: SavingsRepository;
}

export function makeGetDashboardSummary(deps: GetDashboardSummaryDeps) {
  return async function getDashboardSummary(
    year: number,
    monthIndex: number,
    today: Date = new Date(),
  ): Promise<DashboardSummaryDTO> {
    const [monthTransactions, allTransactions, cards, categories, savingsEntries] =
      await Promise.all([
        deps.transactionRepository.getByMonth(year, monthIndex),
        deps.transactionRepository.getAll(),
        deps.cardRepository.getAll(),
        deps.categoryRepository.getAll(),
        deps.savingsRepository.getAll(),
      ]);

    const totals = summarizeTransactions(monthTransactions);
    const latestSavings =
      savingsEntries.length > 0 ? savingsEntries[savingsEntries.length - 1].balance : null;
    const runway = assessRunway(latestSavings, averageMonthlyIncome(allTransactions));

    const largest = totals.largestExpense;
    return {
      year,
      monthIndex,
      monthAvailability: getYearAvailability(year, cards, today),
      totalIncome: totals.totalIncome,
      totalExpenses: totals.totalExpenses,
      net: totals.net,
      largestExpense: largest
        ? {
            amount: largest.amount,
            categoryName:
              categories.find((c) => c.id === largest.categoryId)?.name ?? "Unknown category",
            description: largest.description,
            date: largest.date,
          }
        : null,
      currentSavings: latestSavings,
      monthsOfRunway: runway.monthsOfRunway?.toFixed(1) ?? null,
      riskLevel: runway.level,
    };
  };
}
