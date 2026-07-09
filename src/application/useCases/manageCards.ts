import type { Card, CardType } from "../../domain/entities/Card";
import type { CardRepository } from "../../domain/repositories/CardRepository";

export interface AddCardInput {
  name: string;
  type: CardType;
  cutDay?: number;
  paymentDueDay?: number;
}

export interface ManageCardsDeps {
  cardRepository: CardRepository;
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

    const card: Card = { id: crypto.randomUUID(), name, type: input.type };
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
