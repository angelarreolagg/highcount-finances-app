import type { ChipColor } from "../../domain/entities/ChipColor";
import type { Money } from "../../domain/value-objects/Money";
import type { TransactionType } from "../../domain/entities/Transaction";

export interface TransactionLineDTO {
  id: string;
  type: TransactionType;
  amount: Money;
  categoryId: string;
  categoryName: string;
  cardId: string;
  cardName: string;
  date: string;
  description: string;
  /** e.g. "MSI 3/12" when the transaction is an installment. */
  installmentLabel: string | null;
  /** User-assigned chip color; undefined = automatic hue. */
  color?: ChipColor;
}

export interface MonthDetailDTO {
  year: number;
  monthIndex: number;
  totalIncome: Money;
  totalExpenses: Money;
  net: Money;
  transactions: TransactionLineDTO[];
}
