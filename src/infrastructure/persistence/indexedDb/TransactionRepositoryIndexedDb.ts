import type { Transaction, TransactionType } from "../../../domain/entities/Transaction";
import type { TransactionRepository } from "../../../domain/repositories/TransactionRepository";
import { Money } from "../../../domain/value-objects/Money";
import { monthPrefix } from "../../../domain/value-objects/calendar";
import { STORES, idbBulkPut, idbDelete, idbGetAll, idbPut } from "./db";

/** Persistence shape: Money is stored as an exact decimal string. */
interface TransactionRecord {
  id: string;
  type: TransactionType;
  amount: string;
  categoryId: string;
  cardId: string;
  date: string;
  description: string;
  msiPlanId?: string;
  installmentNumber?: number;
  installmentCount?: number;
}

function toRecord(t: Transaction): TransactionRecord {
  return { ...t, amount: t.amount.toStorage() };
}

function toEntity(r: TransactionRecord): Transaction {
  return { ...r, amount: Money.from(r.amount) };
}

export class TransactionRepositoryIndexedDb implements TransactionRepository {
  async add(transaction: Transaction): Promise<void> {
    await idbPut(STORES.transactions, toRecord(transaction));
  }

  async addMany(transactions: Transaction[]): Promise<void> {
    await idbBulkPut(STORES.transactions, transactions.map(toRecord));
  }

  async getAll(): Promise<Transaction[]> {
    const records = await idbGetAll<TransactionRecord>(STORES.transactions);
    return records.map(toEntity);
  }

  async getByMonth(year: number, monthIndex: number): Promise<Transaction[]> {
    const prefix = monthPrefix(year, monthIndex);
    const records = await idbGetAll<TransactionRecord>(STORES.transactions);
    return records.filter((r) => r.date.startsWith(prefix)).map(toEntity);
  }

  async getByYear(year: number): Promise<Transaction[]> {
    const records = await idbGetAll<TransactionRecord>(STORES.transactions);
    return records.filter((r) => r.date.startsWith(`${year}-`)).map(toEntity);
  }

  async remove(id: string): Promise<void> {
    await idbDelete(STORES.transactions, id);
  }
}
