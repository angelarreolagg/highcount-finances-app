import type { ChipColor } from "../../domain/entities/ChipColor";
import type { MSIPlan } from "../../domain/entities/MSIPlan";
import type { Transaction } from "../../domain/entities/Transaction";
import type { CardRepository } from "../../domain/repositories/CardRepository";
import type { CategoryRepository } from "../../domain/repositories/CategoryRepository";
import type { MSIPlanRepository } from "../../domain/repositories/MSIPlanRepository";
import type { TransactionRepository } from "../../domain/repositories/TransactionRepository";
import { assertExpenseFitsCredit } from "../../domain/services/creditAvailability";
import { buildMsiSchedule } from "../../domain/services/msiSchedule";
import { Money } from "../../domain/value-objects/Money";

export interface RegisterMSIPurchaseInput {
  description: string;
  /** Full amount to be paid, interest included when withInterest is true. */
  totalAmount: string;
  months: number;
  cardId: string;
  categoryId: string;
  startDate: string;
  withInterest: boolean;
  color?: ChipColor;
}

export interface RegisterMSIPurchaseDeps {
  msiPlanRepository: MSIPlanRepository;
  transactionRepository: TransactionRepository;
  cardRepository: CardRepository;
  categoryRepository: CategoryRepository;
}

/**
 * Registers an MSI/MCI plan and automatically creates one expense
 * transaction per installment, tagged with the plan, card, and
 * installment number.
 */
export function makeRegisterMSIPurchase(deps: RegisterMSIPurchaseDeps) {
  return async function registerMSIPurchase(input: RegisterMSIPurchaseInput): Promise<MSIPlan> {
    const [transactions, cards, categories] = await Promise.all([
      deps.transactionRepository.getAll(),
      deps.cardRepository.getAll(),
      deps.categoryRepository.getAll(),
    ]);
    const card = cards.find((c) => c.id === input.cardId);
    if (!card) throw new Error("Unknown card");
    if (card.type !== "credit") {
      throw new Error("MSI/MCI plans can only be registered on credit cards");
    }
    const category = categories.find((c) => c.id === input.categoryId);
    if (!category || category.kind !== "expense") {
      throw new Error("MSI/MCI plans require an expense category");
    }

    const totalAmount = Money.from(input.totalAmount);
    // The whole plan commits its total up front, so it must fit the card's available credit.
    assertExpenseFitsCredit(card, totalAmount, transactions);
    const schedule = buildMsiSchedule(totalAmount, input.months, input.startDate);

    const plan: MSIPlan = {
      id: crypto.randomUUID(),
      cardId: input.cardId,
      categoryId: input.categoryId,
      description: input.description.trim(),
      totalAmount,
      months: input.months,
      monthlyAmount: schedule.monthlyAmount,
      withInterest: input.withInterest,
      startDate: input.startDate,
      color: input.color,
    };

    const installments: Transaction[] = schedule.installments.map((i) => ({
      id: crypto.randomUUID(),
      type: "expense",
      amount: i.amount,
      categoryId: input.categoryId,
      cardId: input.cardId,
      date: i.date,
      description: plan.description,
      msiPlanId: plan.id,
      installmentNumber: i.installmentNumber,
      installmentCount: input.months,
      // Installments inherit the plan's color so they read as one purchase.
      color: input.color,
    }));

    await deps.msiPlanRepository.add(plan);
    await deps.transactionRepository.addMany(installments);
    return plan;
  };
}
