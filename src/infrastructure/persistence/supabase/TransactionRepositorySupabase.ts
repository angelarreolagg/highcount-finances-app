import type { SupabaseClient } from "@supabase/supabase-js";
import type { Transaction } from "../../../domain/entities/Transaction";
import type { TransactionRepository } from "../../../domain/repositories/TransactionRepository";
import { monthPrefix } from "../../../domain/value-objects/calendar";
import { transactionFromRecord, transactionToRecord } from "../records";
import type { TransactionRow } from "./rows";
import { transactionFromRow, transactionToRow } from "./rows";

const TABLE = "transactions";

/** Supabase-backed transactions. RLS scopes every row to the signed-in user. */
export class TransactionRepositorySupabase implements TransactionRepository {
  private readonly client: SupabaseClient;
  private readonly userId: string;

  constructor(client: SupabaseClient, userId: string) {
    this.client = client;
    this.userId = userId;
  }

  private toRow(t: Transaction) {
    return { ...transactionToRow(transactionToRecord(t)), user_id: this.userId };
  }

  private toEntities(rows: TransactionRow[]): Transaction[] {
    return rows.map(transactionFromRow).map(transactionFromRecord);
  }

  async add(transaction: Transaction): Promise<void> {
    const { error } = await this.client.from(TABLE).upsert(this.toRow(transaction));
    if (error) throw new Error(error.message);
  }

  async addMany(transactions: Transaction[]): Promise<void> {
    if (transactions.length === 0) return;
    const { error } = await this.client.from(TABLE).upsert(transactions.map((t) => this.toRow(t)));
    if (error) throw new Error(error.message);
  }

  async getAll(): Promise<Transaction[]> {
    const { data, error } = await this.client.from(TABLE).select("*");
    if (error) throw new Error(error.message);
    return this.toEntities((data ?? []) as TransactionRow[]);
  }

  async getByMonth(year: number, monthIndex: number): Promise<Transaction[]> {
    const prefix = monthPrefix(year, monthIndex);
    const { data, error } = await this.client
      .from(TABLE)
      .select("*")
      .gte("date", `${prefix}-01`)
      .lte("date", `${prefix}-31`);
    if (error) throw new Error(error.message);
    return this.toEntities((data ?? []) as TransactionRow[]);
  }

  async getByYear(year: number): Promise<Transaction[]> {
    const { data, error } = await this.client
      .from(TABLE)
      .select("*")
      .gte("date", `${year}-01-01`)
      .lte("date", `${year}-12-31`);
    if (error) throw new Error(error.message);
    return this.toEntities((data ?? []) as TransactionRow[]);
  }

  async update(transaction: Transaction): Promise<void> {
    await this.add(transaction);
  }

  async remove(id: string): Promise<void> {
    const { error } = await this.client.from(TABLE).delete().eq("id", id);
    if (error) throw new Error(error.message);
  }

  async removeMany(ids: string[]): Promise<void> {
    if (ids.length === 0) return;
    const { error } = await this.client.from(TABLE).delete().in("id", ids);
    if (error) throw new Error(error.message);
  }
}
