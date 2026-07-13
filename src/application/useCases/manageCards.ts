import type { Card, CardType } from "../../domain/entities/Card";
import type { CardRepository } from "../../domain/repositories/CardRepository";
import type { MSIPlanRepository } from "../../domain/repositories/MSIPlanRepository";
import type { TransactionRepository } from "../../domain/repositories/TransactionRepository";

export interface AddCardInput {
  name: string;
  type: CardType;
  cutDay?: number;
  paymentDueDay?: number;
  /** Free hex color (e.g. "#2536E8"). */
  color?: string;
  /** Last four digits (optional display hint). */
  last4?: string;
}

/** Keep only digits, capped at four. */
function normalizeLast4(value: string | undefined): string | undefined {
  return value?.replace(/\D/g, "").slice(0, 4) || undefined;
}

export interface UpdateCardInput extends AddCardInput {
  id: string;
}

export interface ManageCardsDeps {
  cardRepository: CardRepository;
}

export interface RemoveCardDeps {
  cardRepository: CardRepository;
  transactionRepository: TransactionRepository;
  msiPlanRepository: MSIPlanRepository;
}

function assertValidDay(label: string, day: number | undefined): asserts day is number {
  if (day == null || !Number.isInteger(day) || day < 1 || day > 31) {
    throw new Error(`${label} must be a day of month between 1 and 31`);
  }
}

export function makeAddCard(deps: ManageCardsDeps) {
  return async function addCard(input: AddCardInput): Promise<Card> {
    const name = input.name.trim();
    if (!name) throw new Error("Card name is required");

    const card: Card = {
      id: crypto.randomUUID(),
      name,
      type: input.type,
      color: input.color,
      last4: normalizeLast4(input.last4),
    };
    if (input.type === "credit") {
      assertValidDay("Cut day", input.cutDay);
      assertValidDay("Payment due day", input.paymentDueDay);
      card.cutDay = input.cutDay;
      card.paymentDueDay = input.paymentDueDay;
    }
    await deps.cardRepository.add(card);
    return card;
  };
}

export function makeUpdateCard(deps: ManageCardsDeps) {
  return async function updateCard(input: UpdateCardInput): Promise<Card> {
    const name = input.name.trim();
    if (!name) throw new Error("Card name is required");

    const cards = await deps.cardRepository.getAll();
    if (!cards.some((c) => c.id === input.id)) {
      throw new Error("Card not found");
    }

    const card: Card = {
      id: input.id,
      name,
      type: input.type,
      color: input.color,
      last4: normalizeLast4(input.last4),
    };
    if (input.type === "credit") {
      assertValidDay("Cut day", input.cutDay);
      assertValidDay("Payment due day", input.paymentDueDay);
      card.cutDay = input.cutDay;
      card.paymentDueDay = input.paymentDueDay;
    }
    await deps.cardRepository.update(card);
    return card;
  };
}

/** Deletion is blocked while transactions or MSI plans still reference the card. */
export function makeRemoveCard(deps: RemoveCardDeps) {
  return async function removeCard(id: string): Promise<void> {
    const [transactions, plans] = await Promise.all([
      deps.transactionRepository.getAll(),
      deps.msiPlanRepository.getAll(),
    ]);
    const txCount = transactions.filter((t) => t.cardId === id).length;
    const planCount = plans.filter((p) => p.cardId === id).length;
    if (txCount > 0 || planCount > 0) {
      throw new Error(
        `This card still has ${txCount} transaction${txCount === 1 ? "" : "s"}` +
          (planCount > 0 ? ` and ${planCount} MSI plan${planCount === 1 ? "" : "s"}` : "") +
          " — delete or move them first",
      );
    }
    await deps.cardRepository.remove(id);
  };
}
