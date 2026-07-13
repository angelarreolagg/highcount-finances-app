import type { MSIPlan } from "../../domain/entities/MSIPlan";
import type { Transaction } from "../../domain/entities/Transaction";
import type { CardRepository } from "../../domain/repositories/CardRepository";
import type { CategoryRepository } from "../../domain/repositories/CategoryRepository";
import type { MSIPlanRepository } from "../../domain/repositories/MSIPlanRepository";
import type { TransactionRepository } from "../../domain/repositories/TransactionRepository";
import { buildMsiSchedule } from "../../domain/services/msiSchedule";
import { Money } from "../../domain/value-objects/Money";
import type { RegisterMSIPurchaseInput } from "./registerMSIPurchase";

export interface UpdateMSIPlanInput extends RegisterMSIPurchaseInput {
  id: string;
}

export interface UpdateMSIPlanDeps {
  msiPlanRepository: MSIPlanRepository;
  transactionRepository: TransactionRepository;
  cardRepository: CardRepository;
  categoryRepository: CategoryRepository;
}

/**
 * Full plan edit: the old installment transactions are deleted and the schedule
 * is regenerated from the new values (same rounding rule — the last installment
 * absorbs the remainder). The plan keeps its id.
 */
export function makeUpdateMSIPlan(deps: UpdateMSIPlanDeps) {
  return async function updateMSIPlan(input: UpdateMSIPlanInput): Promise<MSIPlan> {
    const [plans, cards, categories] = await Promise.all([
      deps.msiPlanRepository.getAll(),
      deps.cardRepository.getAll(),
      deps.categoryRepository.getAll(),
    ]);
    if (!plans.some((p) => p.id === input.id)) {
      throw new Error("Plan not found");
    }
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
    const schedule = buildMsiSchedule(totalAmount, input.months, input.startDate);

    const plan: MSIPlan = {
      id: input.id,
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
      color: input.color,
    }));

    const transactions = await deps.transactionRepository.getAll();
    const oldInstallmentIds = transactions.filter((t) => t.msiPlanId === plan.id).map((t) => t.id);

    await deps.transactionRepository.removeMany(oldInstallmentIds);
    await deps.msiPlanRepository.update(plan);
    await deps.transactionRepository.addMany(installments);
    return plan;
  };
}
