import type { SavingsEntry, SavingsEntryKind } from "../../domain/entities/SavingsEntry";
import type { SavingsRepository } from "../../domain/repositories/SavingsRepository";
import { Money } from "../../domain/value-objects/Money";
import { parseISODate } from "../../domain/value-objects/calendar";

export interface LogSavingsGrowthInput {
  date: string;
  /** Positive amount of the movement, as a decimal string. */
  amount: string;
  /** "deposit" = money the user put in; "returns" = interest the account produced. */
  kind: SavingsEntryKind;
  note?: string;
}

export interface LogSavingsGrowthDeps {
  savingsRepository: SavingsRepository;
}

export function makeLogSavingsGrowth(deps: LogSavingsGrowthDeps) {
  return async function logSavingsGrowth(input: LogSavingsGrowthInput): Promise<SavingsEntry> {
    const amount = Money.from(input.amount);
    if (!amount.isPositive()) {
      throw new Error("Amount must be greater than zero");
    }
    parseISODate(input.date);

    const entry: SavingsEntry = {
      id: crypto.randomUUID(),
      date: input.date,
      amount,
      kind: input.kind,
      note: input.note?.trim() || undefined,
    };
    await deps.savingsRepository.add(entry);
    return entry;
  };
}
