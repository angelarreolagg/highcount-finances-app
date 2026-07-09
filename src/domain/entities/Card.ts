export type CardType = "credit" | "debit" | "cash";

export interface Card {
  id: string;
  name: string;
  type: CardType;
  /** Day of month the statement closes. Credit cards only. */
  cutDay?: number;
  /** Day of month the payment is due. Credit cards only. */
  paymentDueDay?: number;
}

export function isBillableCreditCard(
  card: Card,
): card is Card & { cutDay: number; paymentDueDay: number } {
  return card.type === "credit" && card.cutDay != null && card.paymentDueDay != null;
}
