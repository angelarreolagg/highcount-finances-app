import type { Card, CardType } from "../../domain/entities/Card";
import type { Category } from "../../domain/entities/Category";
import type { ChipColor } from "../../domain/entities/ChipColor";
import type { MSIPlan } from "../../domain/entities/MSIPlan";
import type { SavingsEntry, SavingsEntryKind } from "../../domain/entities/SavingsEntry";
import type { Transaction, TransactionType } from "../../domain/entities/Transaction";
import { Money } from "../../domain/value-objects/Money";

/**
 * The canonical persisted record shapes — the single serialization contract shared by BOTH
 * the IndexedDB and Supabase adapters and the JSON backup format. `Money` is stored as its
 * exact decimal string (`Money.toStorage()`); dates stay local ISO `"YYYY-MM-DD"` strings.
 * Keeping one set of mappers guarantees a local export and a cloud row are byte-identical.
 */

export interface TransactionRecord {
  id: string;
  type: TransactionType;
  amount: string;
  categoryId: string;
  cardId: string;
  date: string;
  description: string;
  msiPlanId?: string;
  installmentNumber?: number;
  installmentCount?: number;
  color?: ChipColor;
}

export interface CardRecord {
  id: string;
  name: string;
  type: CardType;
  cutDay?: number;
  paymentDueDay?: number;
  color?: string;
  last4?: string;
  creditLimit?: string;
}

/** Categories carry no Money or dates — the record is the entity. */
export type CategoryRecord = Category;

export interface SavingsRecord {
  id: string;
  date: string;
  amount?: string;
  kind?: SavingsEntryKind;
  note?: string;
  color?: ChipColor;
  cardId?: string;
  /** Legacy balance-snapshot field; read as a deposit of that amount. */
  balance?: string;
}

export interface MSIPlanRecord {
  id: string;
  cardId: string;
  categoryId: string;
  description: string;
  totalAmount: string;
  months: number;
  monthlyAmount: string;
  withInterest: boolean;
  startDate: string;
  color?: ChipColor;
}

// ── Transaction ──────────────────────────────────────────────────────────────
export function transactionToRecord(t: Transaction): TransactionRecord {
  return { ...t, amount: t.amount.toStorage() };
}
export function transactionFromRecord(r: TransactionRecord): Transaction {
  return { ...r, amount: Money.from(r.amount) };
}

// ── Card ─────────────────────────────────────────────────────────────────────
export function cardToRecord(card: Card): CardRecord {
  return { ...card, creditLimit: card.creditLimit?.toStorage() };
}
export function cardFromRecord(r: CardRecord): Card {
  return { ...r, creditLimit: r.creditLimit != null ? Money.from(r.creditLimit) : undefined };
}

// ── Savings ──────────────────────────────────────────────────────────────────
export function savingsToRecord(entry: SavingsEntry): SavingsRecord {
  return {
    id: entry.id,
    date: entry.date,
    amount: entry.amount.toStorage(),
    kind: entry.kind,
    note: entry.note,
    color: entry.color,
    cardId: entry.cardId,
  };
}
export function savingsFromRecord(r: SavingsRecord): SavingsEntry {
  return {
    id: r.id,
    date: r.date,
    amount: Money.from(r.amount ?? r.balance ?? "0"),
    kind: r.kind ?? "deposit",
    note: r.note,
    color: r.color,
    cardId: r.cardId,
  };
}

// ── MSI plan ─────────────────────────────────────────────────────────────────
export function msiPlanToRecord(plan: MSIPlan): MSIPlanRecord {
  return {
    ...plan,
    totalAmount: plan.totalAmount.toStorage(),
    monthlyAmount: plan.monthlyAmount.toStorage(),
  };
}
export function msiPlanFromRecord(r: MSIPlanRecord): MSIPlan {
  return {
    ...r,
    totalAmount: Money.from(r.totalAmount),
    monthlyAmount: Money.from(r.monthlyAmount),
  };
}
