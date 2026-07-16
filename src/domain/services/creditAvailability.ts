import type { Card } from "../entities/Card";
import type { Transaction } from "../entities/Transaction";
import { Money } from "../value-objects/Money";

export interface CreditUsage {
  /** The card's credit limit. */
  limit: Money;
  /** Σ expenses on the card − Σ income/payments on the card (committed, no date gate).
   *  Future-dated MSI installments are ordinary expense transactions, so they're included. */
  used: Money;
  /** limit − used. Can exceed the limit (over-paid) or go negative (over the limit). */
  available: Money;
}

/**
 * Available credit for a card, or `null` when the card isn't a credit card with a limit set.
 * Income on a credit card counts as a payment that frees credit back up.
 */
export function computeCreditUsage(card: Card, transactions: Transaction[]): CreditUsage | null {
  if (card.type !== "credit" || card.creditLimit == null) return null;

  let used = Money.zero();
  for (const t of transactions) {
    if (t.cardId !== card.id) continue;
    used = t.type === "expense" ? used.add(t.amount) : used.subtract(t.amount);
  }

  return { limit: card.creditLimit, used, available: card.creditLimit.subtract(used) };
}

/**
 * Throws when charging `amount` to a credit card would exceed its available credit (or the
 * card has no limit set). No-op for debit/cash cards. `transactions` should include every
 * existing transaction on the card *except* the one being edited, if any.
 */
export function assertExpenseFitsCredit(
  card: Card,
  amount: Money,
  transactions: Transaction[],
): void {
  if (card.type !== "credit") return;
  if (card.creditLimit == null) {
    throw new Error(`"${card.name}" has no credit limit set — edit the card to add one`);
  }
  const usage = computeCreditUsage(card, transactions);
  if (usage && amount.greaterThan(usage.available)) {
    throw new Error(
      `Not enough available credit on ${card.name} — ${usage.available.format()} available`,
    );
  }
}
