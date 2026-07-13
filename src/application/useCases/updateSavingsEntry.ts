import type { SavingsEntry } from "../../domain/entities/SavingsEntry";
import type { SavingsRepository } from "../../domain/repositories/SavingsRepository";
import { Money } from "../../domain/value-objects/Money";
import { parseISODate } from "../../domain/value-objects/calendar";
import type { LogSavingsGrowthInput } from "./logSavingsGrowth";

export interface UpdateSavingsEntryInput extends LogSavingsGrowthInput {
  id: string;
}

export interface UpdateSavingsEntryDeps {
  savingsRepository: SavingsRepository;
}

export function makeUpdateSavingsEntry(deps: UpdateSavingsEntryDeps) {
  return async function updateSavingsEntry(input: UpdateSavingsEntryInput): Promise<SavingsEntry> {
    const amount = Money.from(input.amount);
    if (!amount.isPositive()) {
      throw new Error("Amount must be greater than zero");
    }
    parseISODate(input.date);

    const entries = await deps.savingsRepository.getAll();
    if (!entries.some((e) => e.id === input.id)) {
      throw new Error("Savings entry not found");
    }

    const entry: SavingsEntry = {
      id: input.id,
      date: input.date,
      amount,
      kind: input.kind,
      note: input.note?.trim() || undefined,
      color: input.color,
    };
    await deps.savingsRepository.update(entry);
    return entry;
  };
}
