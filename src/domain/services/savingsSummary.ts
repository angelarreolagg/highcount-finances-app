import type { ChipColor } from "../entities/ChipColor";
import type { SavingsEntry, SavingsEntryKind } from "../entities/SavingsEntry";
import { Money } from "../value-objects/Money";

export interface SavingsTimelinePoint {
  id: string;
  date: string;
  amount: Money;
  kind: SavingsEntryKind;
  /** Cumulative balance after this entry. */
  balanceAfter: Money;
  note?: string;
  /** User-assigned chip color; undefined = automatic hue. */
  color?: ChipColor;
}

export interface SavingsSummary {
  /** Σ all entries — the money currently in savings. */
  currentBalance: Money;
  /** Σ deposits only. */
  totalDeposits: Money;
  /** Σ returns only. */
  totalReturns: Money;
  /** Entries in date order with the running balance, for charts and lists. */
  timeline: SavingsTimelinePoint[];
}

export function buildSavingsSummary(entries: SavingsEntry[]): SavingsSummary {
  const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date));

  let balance = Money.zero();
  let totalDeposits = Money.zero();
  let totalReturns = Money.zero();
  const timeline: SavingsTimelinePoint[] = [];

  for (const entry of sorted) {
    balance = balance.add(entry.amount);
    if (entry.kind === "deposit") {
      totalDeposits = totalDeposits.add(entry.amount);
    } else {
      totalReturns = totalReturns.add(entry.amount);
    }
    timeline.push({
      id: entry.id,
      date: entry.date,
      amount: entry.amount,
      kind: entry.kind,
      balanceAfter: balance,
      note: entry.note,
      color: entry.color,
    });
  }

  return { currentBalance: balance, totalDeposits, totalReturns, timeline };
}
