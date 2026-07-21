import type { SupabaseClient } from "@supabase/supabase-js";
import type { SavingsEntry } from "../../../domain/entities/SavingsEntry";
import type { SavingsRepository } from "../../../domain/repositories/SavingsRepository";
import { savingsFromRecord, savingsToRecord } from "../records";
import type { SavingsRow } from "./rows";
import { savingsFromRow, savingsToRow } from "./rows";

const TABLE = "savings_entries";

/** Supabase-backed savings movements. getAll returns date-ascending (port contract). */
export class SavingsRepositorySupabase implements SavingsRepository {
  private readonly client: SupabaseClient;
  private readonly userId: string;

  constructor(client: SupabaseClient, userId: string) {
    this.client = client;
    this.userId = userId;
  }

  private toRow(entry: SavingsEntry) {
    return { ...savingsToRow(savingsToRecord(entry)), user_id: this.userId };
  }

  async add(entry: SavingsEntry): Promise<void> {
    const { error } = await this.client.from(TABLE).upsert(this.toRow(entry));
    if (error) throw new Error(error.message);
  }

  async getAll(): Promise<SavingsEntry[]> {
    const { data, error } = await this.client.from(TABLE).select("*").order("date", { ascending: true });
    if (error) throw new Error(error.message);
    return ((data ?? []) as SavingsRow[]).map(savingsFromRow).map(savingsFromRecord);
  }

  async update(entry: SavingsEntry): Promise<void> {
    await this.add(entry);
  }

  async remove(id: string): Promise<void> {
    const { error } = await this.client.from(TABLE).delete().eq("id", id);
    if (error) throw new Error(error.message);
  }
}
