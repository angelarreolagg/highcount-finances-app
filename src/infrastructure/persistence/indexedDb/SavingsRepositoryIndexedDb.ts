import type { SavingsEntry } from "../../../domain/entities/SavingsEntry";
import type { SavingsRepository } from "../../../domain/repositories/SavingsRepository";
import type { SavingsRecord } from "../records";
import { savingsFromRecord as toEntity, savingsToRecord as toRecord } from "../records";
import { STORES, idbDelete, idbGetAll, idbPut } from "./db";

export class SavingsRepositoryIndexedDb implements SavingsRepository {
  async add(entry: SavingsEntry): Promise<void> {
    await idbPut(STORES.savings, toRecord(entry));
  }

  async getAll(): Promise<SavingsEntry[]> {
    const records = await idbGetAll<SavingsRecord>(STORES.savings);
    return records.map(toEntity).sort((a, b) => a.date.localeCompare(b.date));
  }

  async update(entry: SavingsEntry): Promise<void> {
    await idbPut(STORES.savings, toRecord(entry));
  }

  async remove(id: string): Promise<void> {
    await idbDelete(STORES.savings, id);
  }
}
