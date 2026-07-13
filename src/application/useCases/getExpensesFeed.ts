import type { CardRepository } from "../../domain/repositories/CardRepository";
import type { CategoryRepository } from "../../domain/repositories/CategoryRepository";
import type { TransactionRepository } from "../../domain/repositories/TransactionRepository";
import { isPreviousMonthOpen } from "../../domain/services/billingCycle";
import { summarizeTransactions } from "../../domain/services/monthlySummary";
import { addMonths } from "../../domain/value-objects/calendar";
import type { ExpensesFeedDTO, FeedMonthDTO } from "../dto/expensesFeed";

export interface GetExpensesFeedDeps {
  transactionRepository: TransactionRepository;
  cardRepository: CardRepository;
  categoryRepository: CategoryRepository;
}

/**
 * The expenses route feed: transactions of the current month plus any month
 * still open for logging (the previous month while its billing cycle is open).
 */
export function makeGetExpensesFeed(deps: GetExpensesFeedDeps) {
  return async function getExpensesFeed(today: Date = new Date()): Promise<ExpensesFeedDTO> {
    const year = today.getFullYear();
    const monthIndex = today.getMonth();

    const [cards, categories] = await Promise.all([
      deps.cardRepository.getAll(),
      deps.categoryRepository.getAll(),
    ]);

    const months: FeedMonthDTO[] = [{ year, monthIndex, isCurrent: true }];
    if (isPreviousMonthOpen(cards, today)) {
      const prev = addMonths(year, monthIndex, -1);
      months.push({ year: prev.year, monthIndex: prev.monthIndex, isCurrent: false });
    }

    const perMonth = await Promise.all(
      months.map((m) => deps.transactionRepository.getByMonth(m.year, m.monthIndex)),
    );
    const currentMonthTotals = summarizeTransactions(perMonth[0]);

    const transactions = perMonth
      .flat()
      .sort((a, b) => b.date.localeCompare(a.date))
      .map((t) => ({
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
        color: t.color,
      }));

    return {
      year,
      monthIndex,
      totalIncome: currentMonthTotals.totalIncome,
      totalExpenses: currentMonthTotals.totalExpenses,
      net: currentMonthTotals.net,
      months,
      transactions,
    };
  };
}
