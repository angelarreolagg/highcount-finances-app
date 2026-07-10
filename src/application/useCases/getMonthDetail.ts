import type { CardRepository } from "../../domain/repositories/CardRepository";
import type { CategoryRepository } from "../../domain/repositories/CategoryRepository";
import type { TransactionRepository } from "../../domain/repositories/TransactionRepository";
import { summarizeTransactions } from "../../domain/services/monthlySummary";
import type { MonthDetailDTO } from "../dto/monthDetail";

export interface GetMonthDetailDeps {
  transactionRepository: TransactionRepository;
  cardRepository: CardRepository;
  categoryRepository: CategoryRepository;
}

export function makeGetMonthDetail(deps: GetMonthDetailDeps) {
  return async function getMonthDetail(year: number, monthIndex: number): Promise<MonthDetailDTO> {
    const [transactions, cards, categories] = await Promise.all([
      deps.transactionRepository.getByMonth(year, monthIndex),
      deps.cardRepository.getAll(),
      deps.categoryRepository.getAll(),
    ]);

    const totals = summarizeTransactions(transactions);
    const sorted = [...transactions].sort((a, b) => a.date.localeCompare(b.date));

    return {
      year,
      monthIndex,
      totalIncome: totals.totalIncome,
      totalExpenses: totals.totalExpenses,
      net: totals.net,
      transactions: sorted.map((t) => ({
        id: t.id,
        type: t.type,
        amount: t.amount,
        categoryId: t.categoryId,
        categoryName: categories.find((c) => c.id === t.categoryId)?.name ?? "Unknown category",
        cardId: t.cardId,
        cardName: cards.find((c) => c.id === t.cardId)?.name ?? "Unknown account",
        date: t.date,
        description: t.description,
        installmentLabel:
          t.installmentNumber != null && t.installmentCount != null
            ? `MSI ${t.installmentNumber}/${t.installmentCount}`
            : null,
      })),
    };
  };
}
