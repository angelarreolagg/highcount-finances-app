import type { CardType } from "../../../domain/entities/Card";
import type { CategoryKind } from "../../../domain/entities/Category";
import type { ChipColor } from "../../../domain/entities/ChipColor";
import type { SavingsEntryKind } from "../../../domain/entities/SavingsEntry";
import type { TransactionType } from "../../../domain/entities/Transaction";
import type {
  CardRecord,
  CategoryRecord,
  MSIPlanRecord,
  SavingsRecord,
  TransactionRecord,
} from "../records";

/**
 * Postgres row shapes (snake_case) ↔ the canonical camelCase records. Money columns are
 * `text` (the exact decimal string) and date columns come back as `"YYYY-MM-DD"` strings,
 * so the records round-trip losslessly. Enum columns are DB-CHECK-constrained, so casting
 * the incoming strings to their union types is safe.
 */

export interface CategoryRow {
  id: string;
  name: string;
  kind: string;
}
export interface CardRow {
  id: string;
  name: string;
  type: string;
  cut_day: number | null;
  payment_due_day: number | null;
  color: string | null;
  last4: string | null;
  credit_limit: string | null;
}
export interface MSIPlanRow {
  id: string;
  card_id: string;
  category_id: string;
  description: string;
  total_amount: string;
  months: number;
  monthly_amount: string;
  with_interest: boolean;
  start_date: string;
  color: string | null;
}
export interface TransactionRow {
  id: string;
  type: string;
  amount: string;
  category_id: string;
  card_id: string;
  date: string;
  description: string;
  msi_plan_id: string | null;
  installment_number: number | null;
  installment_count: number | null;
  color: string | null;
}
export interface SavingsRow {
  id: string;
  date: string;
  amount: string;
  kind: string;
  note: string | null;
  color: string | null;
  card_id: string | null;
}

// ── Category ─────────────────────────────────────────────────────────────────
export const categoryToRow = (r: CategoryRecord): CategoryRow => ({
  id: r.id,
  name: r.name,
  kind: r.kind,
});
export const categoryFromRow = (row: CategoryRow): CategoryRecord => ({
  id: row.id,
  name: row.name,
  kind: row.kind as CategoryKind,
});

// ── Card ─────────────────────────────────────────────────────────────────────
export const cardToRow = (r: CardRecord): CardRow => ({
  id: r.id,
  name: r.name,
  type: r.type,
  cut_day: r.cutDay ?? null,
  payment_due_day: r.paymentDueDay ?? null,
  color: r.color ?? null,
  last4: r.last4 ?? null,
  credit_limit: r.creditLimit ?? null,
});
export const cardFromRow = (row: CardRow): CardRecord => ({
  id: row.id,
  name: row.name,
  type: row.type as CardType,
  cutDay: row.cut_day ?? undefined,
  paymentDueDay: row.payment_due_day ?? undefined,
  color: row.color ?? undefined,
  last4: row.last4 ?? undefined,
  creditLimit: row.credit_limit ?? undefined,
});

// ── MSI plan ─────────────────────────────────────────────────────────────────
export const msiPlanToRow = (r: MSIPlanRecord): MSIPlanRow => ({
  id: r.id,
  card_id: r.cardId,
  category_id: r.categoryId,
  description: r.description,
  total_amount: r.totalAmount,
  months: r.months,
  monthly_amount: r.monthlyAmount,
  with_interest: r.withInterest,
  start_date: r.startDate,
  color: r.color ?? null,
});
export const msiPlanFromRow = (row: MSIPlanRow): MSIPlanRecord => ({
  id: row.id,
  cardId: row.card_id,
  categoryId: row.category_id,
  description: row.description,
  totalAmount: row.total_amount,
  months: row.months,
  monthlyAmount: row.monthly_amount,
  withInterest: row.with_interest,
  startDate: row.start_date,
  color: (row.color ?? undefined) as ChipColor | undefined,
});

// ── Transaction ──────────────────────────────────────────────────────────────
export const transactionToRow = (r: TransactionRecord): TransactionRow => ({
  id: r.id,
  type: r.type,
  amount: r.amount,
  category_id: r.categoryId,
  card_id: r.cardId,
  date: r.date,
  description: r.description,
  msi_plan_id: r.msiPlanId ?? null,
  installment_number: r.installmentNumber ?? null,
  installment_count: r.installmentCount ?? null,
  color: r.color ?? null,
});
export const transactionFromRow = (row: TransactionRow): TransactionRecord => ({
  id: row.id,
  type: row.type as TransactionType,
  amount: row.amount,
  categoryId: row.category_id,
  cardId: row.card_id,
  date: row.date,
  description: row.description,
  msiPlanId: row.msi_plan_id ?? undefined,
  installmentNumber: row.installment_number ?? undefined,
  installmentCount: row.installment_count ?? undefined,
  color: (row.color ?? undefined) as ChipColor | undefined,
});

// ── Savings ──────────────────────────────────────────────────────────────────
export const savingsToRow = (r: SavingsRecord): SavingsRow => ({
  id: r.id,
  date: r.date,
  amount: r.amount ?? "0",
  kind: r.kind ?? "deposit",
  note: r.note ?? null,
  color: r.color ?? null,
  card_id: r.cardId ?? null,
});
export const savingsFromRow = (row: SavingsRow): SavingsRecord => ({
  id: row.id,
  date: row.date,
  amount: row.amount,
  kind: row.kind as SavingsEntryKind,
  note: row.note ?? undefined,
  color: (row.color ?? undefined) as ChipColor | undefined,
  cardId: row.card_id ?? undefined,
});
