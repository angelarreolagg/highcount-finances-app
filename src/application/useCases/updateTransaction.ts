import type { Transaction } from "../../domain/entities/Transaction";
import type { CardRepository } from "../../domain/repositories/CardRepository";
import type { CategoryRepository } from "../../domain/repositories/CategoryRepository";
import type { TransactionRepository } from "../../domain/repositories/TransactionRepository";
import { Money } from "../../domain/value-objects/Money";
import { parseISODate } from "../../domain/value-objects/calendar";
import type { AddTransactionInput } from "./addTransaction";

export interface UpdateTransactionInput extends AddTransactionInput {
  id: string;
}

export interface UpdateTransactionDeps {
  transactionRepository: TransactionRepository;
  cardRepository: CardRepository;
  categoryRepository: CategoryRepository;
}

export function makeUpdateTransaction(deps: UpdateTransactionDeps) {
  return async function updateTransaction(input: UpdateTransactionInput): Promise<Transaction> {
    const amount = Money.from(input.amount);
    if (!amount.isPositive()) {
      throw new Error("Amount must be greater than zero");
    }
    parseISODate(input.date); // validates format

    const [transactions, cards, categories] = await Promise.all([
      deps.transactionRepository.getAll(),
      deps.cardRepository.getAll(),
      deps.categoryRepository.getAll(),
    ]);
    const existing = transactions.find((t) => t.id === input.id);
    if (!existing) {
      throw new Error("Transaction not found");
    }
    if (existing.msiPlanId != null) {
      throw new Error("MSI installments are managed through their plan");
    }
    if (!cards.some((c) => c.id === input.cardId)) {
      throw new Error("Unknown card/account");
    }
    const category = categories.find((c) => c.id === input.categoryId);
    if (!category) {
      throw new Error("Unknown category");
    }
    if (category.kind !== input.type) {
      throw new Error(`Category "${category.name}" is not a ${input.type} category`);
    }

    const transaction: Transaction = {
      id: existing.id,
      type: input.type,
      amount,
      categoryId: input.categoryId,
      cardId: input.cardId,
      date: input.date,
      description: input.description.trim(),
      color: input.color,
    };
    await deps.transactionRepository.update(transaction);
    return transaction;
  };
}
