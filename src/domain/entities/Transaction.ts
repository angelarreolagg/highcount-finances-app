import type { ChipColor } from "./ChipColor";
import type { Money } from "../value-objects/Money";

export type TransactionType = "expense" | "income";

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: Money;
  categoryId: string;
  cardId: string;
  /** Local ISO date, "YYYY-MM-DD". */
  date: string;
  description: string;
  /** Set when this transaction is one installment of an MSI/MCI plan. */
  msiPlanId?: string;
  installmentNumber?: number;
  installmentCount?: number;
  /** User-assigned chip color; undefined = automatic hue. */
  color?: ChipColor;
}
