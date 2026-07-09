import type { SavingsEntry } from "../../domain/entities/SavingsEntry";
import type { SavingsRepository } from "../../domain/repositories/SavingsRepository";
import { Money } from "../../domain/value-objects/Money";
import { parseISODate } from "../../domain/value-objects/calendar";

export interface LogSavingsGrowthInput {
  date: string;
  /** Total savings balance on that date, as a decimal string. */
  balance: string;
  note?: string;
}

export interface LogSavingsGrowthDeps {
  savingsRepository: SavingsRepository;
}

export function makeLogSavingsGrowth(deps: LogSavingsGrowthDeps) {
  return async function logSavingsGrowth(input: LogSavingsGrowthInput): Promise<SavingsEntry> {
    const balance = Money.from(input.balance);
    if (balance.isNegative()) {
      throw new Error("Savings balance cannot be negative");
    }
    parseISODate(input.date);

    const entry: SavingsEntry = {
      id: crypto.randomUUID(),
      date: input.date,
      balance,
      note: input.note?.trim() || undefined,
    };
    await deps.savingsRepository.add(entry);
    return entry;
  };
}
