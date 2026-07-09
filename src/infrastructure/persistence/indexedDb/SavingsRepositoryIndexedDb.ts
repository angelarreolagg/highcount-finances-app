import type { SavingsEntry } from "../../../domain/entities/SavingsEntry";
import type { SavingsRepository } from "../../../domain/repositories/SavingsRepository";
import { Money } from "../../../domain/value-objects/Money";
import { STORES, idbGetAll, idbPut } from "./db";

interface SavingsRecord {
  id: string;
  date: string;
  balance: string;
  note?: string;
}

export class SavingsRepositoryIndexedDb implements SavingsRepository {
  async add(entry: SavingsEntry): Promise<void> {
    const record: SavingsRecord = { ...entry, balance: entry.balance.toStorage() };
    await idbPut(STORES.savings, record);
  }

  async getAll(): Promise<SavingsEntry[]> {
    const records = await idbGetAll<SavingsRecord>(STORES.savings);
    return records
      .map((r) => ({ ...r, balance: Money.from(r.balance) }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }
}
