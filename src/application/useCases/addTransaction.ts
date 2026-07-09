import type { Transaction, TransactionType } from "../../domain/entities/Transaction";
import type { CardRepository } from "../../domain/repositories/CardRepository";
import type { CategoryRepository } from "../../domain/repositories/CategoryRepository";
import type { TransactionRepository } from "../../domain/repositories/TransactionRepository";
import { Money } from "../../domain/value-objects/Money";
import { parseISODate } from "../../domain/value-objects/calendar";

export interface AddTransactionInput {
  type: TransactionType;
  /** Decimal string, e.g. "1234.56". */
  amount: string;
  categoryId: string;
  cardId: string;
  date: string;
  description: string;
}

export interface AddTransactionDeps {
  transactionRepository: TransactionRepository;
  cardRepository: CardRepository;
  categoryRepository: CategoryRepository;
}

export function makeAddTransaction(deps: AddTransactionDeps) {
  return async function addTransaction(input: AddTransactionInput): Promise<Transaction> {
    const amount = Money.from(input.amount);
    if (!amount.isPositive()) {
      throw new Error("Amount must be greater than zero");
    }
    parseISODate(input.date); // validates format

    const [cards, categories] = await Promise.all([
      deps.cardRepository.getAll(),
      deps.categoryRepository.getAll(),
    ]);
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
      id: crypto.randomUUID(),
      type: input.type,
      amount,
      categoryId: input.categoryId,
      cardId: input.cardId,
      date: input.date,
      description: input.description.trim(),
    };
    await deps.transactionRepository.add(transaction);
    return transaction;
  };
}
