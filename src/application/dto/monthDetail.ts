import type { Money } from "../../domain/value-objects/Money";
import type { TransactionType } from "../../domain/entities/Transaction";

export interface TransactionLineDTO {
  id: string;
  type: TransactionType;
  amount: Money;
  categoryName: string;
  cardName: string;
  date: string;
  description: string;
  /** e.g. "MSI 3/12" when the transaction is an installment. */
  installmentLabel: string | null;
}

export interface MonthDetailDTO {
  year: number;
  monthIndex: number;
  totalIncome: Money;
  totalExpenses: Money;
  net: Money;
  transactions: TransactionLineDTO[];
}
