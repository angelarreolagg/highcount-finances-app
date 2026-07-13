import type { ChipColor } from "../../../domain/entities/ChipColor";
import type { SavingsEntry, SavingsEntryKind } from "../../../domain/entities/SavingsEntry";
import type { SavingsRepository } from "../../../domain/repositories/SavingsRepository";
import { Money } from "../../../domain/value-objects/Money";
import { STORES, idbDelete, idbGetAll, idbPut } from "./db";

interface SavingsRecord {
  id: string;
  date: string;
  amount?: string;
  kind?: SavingsEntryKind;
  note?: string;
  color?: ChipColor;
  /** Legacy field from the balance-snapshot era; read as a deposit of that amount. */
  balance?: string;
}

function toEntity(record: SavingsRecord): SavingsEntry {
  return {
    id: record.id,
    date: record.date,
    amount: Money.from(record.amount ?? record.balance ?? "0"),
    kind: record.kind ?? "deposit",
    note: record.note,
    color: record.color,
  };
}

export class SavingsRepositoryIndexedDb implements SavingsRepository {
  async add(entry: SavingsEntry): Promise<void> {
    const record: SavingsRecord = {
      id: entry.id,
      date: entry.date,
      amount: entry.amount.toStorage(),
      kind: entry.kind,
      note: entry.note,
      color: entry.color,
    };
    await idbPut(STORES.savings, record);
  }

  async getAll(): Promise<SavingsEntry[]> {
    const records = await idbGetAll<SavingsRecord>(STORES.savings);
    return records.map(toEntity).sort((a, b) => a.date.localeCompare(b.date));
  }

  async update(entry: SavingsEntry): Promise<void> {
    const record: SavingsRecord = {
      id: entry.id,
      date: entry.date,
      amount: entry.amount.toStorage(),
      kind: entry.kind,
      note: entry.note,
      color: entry.color,
    };
    await idbPut(STORES.savings, record);
  }

  async remove(id: string): Promise<void> {
    await idbDelete(STORES.savings, id);
  }
}
