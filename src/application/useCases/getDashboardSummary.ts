import type { CardRepository } from "../../domain/repositories/CardRepository";
import type { CategoryRepository } from "../../domain/repositories/CategoryRepository";
import type { SavingsRepository } from "../../domain/repositories/SavingsRepository";
import type { TransactionRepository } from "../../domain/repositories/TransactionRepository";
import { computeBalances } from "../../domain/services/balances";
import { getYearMonthStatuses } from "../../domain/services/billingCycle";
import { summarizeTransactions, summarizeYearByMonth } from "../../domain/services/monthlySummary";
import { assessRunway } from "../../domain/services/riskIndicator";
import { buildSavingsSummary } from "../../domain/services/savingsSummary";
import type { Money } from "../../domain/value-objects/Money";
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
    /** Runway denominator: the user-set average monthly salary; null → runway is "unknown". */
    averageMonthlySalary: Money | null,
    today: Date = new Date(),
  ): Promise<DashboardSummaryDTO> {
    const [monthTransactions, yearTransactions, allTransactions, cards, categories, savingsEntries] =
      await Promise.all([
        deps.transactionRepository.getByMonth(year, monthIndex),
        deps.transactionRepository.getByYear(year),
        deps.transactionRepository.getAll(),
        deps.cardRepository.getAll(),
        deps.categoryRepository.getAll(),
        deps.savingsRepository.getAll(),
      ]);

    const totals = summarizeTransactions(monthTransactions);
    const savings = buildSavingsSummary(savingsEntries);
    const savingsBalance = savingsEntries.length > 0 ? savings.currentBalance : null;
    // Income logged to a credit card is a card payment, not cash income — exclude it.
    const creditCardIds = new Set(cards.filter((c) => c.type === "credit").map((c) => c.id));
    const balances = computeBalances(allTransactions, today, creditCardIds);
    // Runway = real balance (money after ALL committed MSI) ÷ the user's average monthly salary
    // (sole basis; a null salary → "unknown").
    const runway = assessRunway(balances.realBalance, averageMonthlySalary);

    const largest = totals.largestExpense;
    return {
      year,
      monthIndex,
      overview: {
        totalIncome: balances.totalIncome,
        totalExpensesToDate: balances.totalExpensesToDate,
        currentBalance: balances.currentBalance,
        realBalance: balances.realBalance,
      },
      monthStatuses: getYearMonthStatuses(year, cards, today),
      monthTotals: summarizeYearByMonth(yearTransactions).map((m) => ({
        income: m.income,
        expenses: m.expenses,
        net: m.income.subtract(m.expenses),
      })),
      totalIncome: totals.totalIncome,
      totalExpenses: totals.totalExpenses,
      net: totals.net,
      largestExpense: largest
        ? {
            amount: largest.amount,
            categoryId: largest.categoryId,
            categoryName:
              categories.find((c) => c.id === largest.categoryId)?.name ?? "Unknown category",
            description: largest.description,
            date: largest.date,
          }
        : null,
      currentSavings: savingsBalance,
      monthsOfRunway: runway.monthsOfRunway?.toFixed(1) ?? null,
      riskLevel: runway.level,
    };
  };
}
