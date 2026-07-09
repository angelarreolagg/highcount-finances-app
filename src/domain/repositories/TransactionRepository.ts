import type { Transaction } from "../entities/Transaction";

export interface TransactionRepository {
  add(transaction: Transaction): Promise<void>;
  addMany(transactions: Transaction[]): Promise<void>;
  getAll(): Promise<Transaction[]>;
  getByMonth(year: number, monthIndex: number): Promise<Transaction[]>;
  getByYear(year: number): Promise<Transaction[]>;
  remove(id: string): Promise<void>;
}
