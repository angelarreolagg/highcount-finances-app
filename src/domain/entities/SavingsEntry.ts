import type { Money } from "../value-objects/Money";

export type SavingsEntryKind = "deposit" | "returns";

/**
 * A manual savings movement: money the user put in ("deposit") or interest
 * the account produced ("returns"). Returns are logged by hand — bank
 * interest rates change too often to automate.
 */
export interface SavingsEntry {
  id: string;
  /** Local ISO date, "YYYY-MM-DD". */
  date: string;
  amount: Money;
  kind: SavingsEntryKind;
  note?: string;
}
