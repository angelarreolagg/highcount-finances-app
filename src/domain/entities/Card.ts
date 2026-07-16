import type { Money } from "../value-objects/Money";

export type CardType = "credit" | "debit" | "cash";

export interface Card {
  id: string;
  name: string;
  type: CardType;
  /** Day of month the statement closes. Credit cards only. */
  cutDay?: number;
  /** Day of month the payment is due. Credit cards only. */
  paymentDueDay?: number;
  /** User-assigned free color as a hex string (e.g. "#2536E8"); undefined = default gradient. */
  color?: string;
  /** Optional last four digits, shown as a hint on the card face. */
  last4?: string;
  /** Spending limit. Credit cards only (required going forward; legacy cards may lack it). */
  creditLimit?: Money;
}

export function isBillableCreditCard(
  card: Card,
): card is Card & { cutDay: number; paymentDueDay: number } {
  return card.type === "credit" && card.cutDay != null && card.paymentDueDay != null;
}
