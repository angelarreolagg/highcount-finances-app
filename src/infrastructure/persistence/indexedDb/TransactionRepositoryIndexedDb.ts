import type { Transaction } from "../../../domain/entities/Transaction";
import type { TransactionRepository } from "../../../domain/repositories/TransactionRepository";
import { monthPrefix } from "../../../domain/value-objects/calendar";
import type { TransactionRecord } from "../records";
import { transactionFromRecord as toEntity, transactionToRecord as toRecord } from "../records";
import { STORES, idbBulkDelete, idbBulkPut, idbDelete, idbGetAll, idbPut } from "./db";

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

  async update(transaction: Transaction): Promise<void> {
    await idbPut(STORES.transactions, toRecord(transaction));
  }

  async remove(id: string): Promise<void> {
    await idbDelete(STORES.transactions, id);
  }

  async removeMany(ids: string[]): Promise<void> {
    await idbBulkDelete(STORES.transactions, ids);
  }
}
