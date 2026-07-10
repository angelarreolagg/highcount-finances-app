import type { Money } from "../../domain/value-objects/Money";
import type { TransactionLineDTO } from "./monthDetail";

export interface FeedMonthDTO {
  year: number;
  monthIndex: number;
  isCurrent: boolean;
}

export interface ExpensesFeedDTO {
  /** Current month totals — the route's hero figures. */
  year: number;
  monthIndex: number;
  totalIncome: Money;
  totalExpenses: Money;
  net: Money;
  /** Months included in the feed: the current month plus any still open for logging. */
  months: FeedMonthDTO[];
  /** All transactions of those months, newest first. */
  transactions: TransactionLineDTO[];
}
