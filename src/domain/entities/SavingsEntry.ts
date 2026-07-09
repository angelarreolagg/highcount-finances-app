import type { Money } from "../value-objects/Money";

/**
 * A manual snapshot of the user's total savings balance on a given date.
 * Growth is logged by hand — interest rates change too often to automate.
 */
export interface SavingsEntry {
  id: string;
  /** Local ISO date, "YYYY-MM-DD". */
  date: string;
  balance: Money;
  note?: string;
}
