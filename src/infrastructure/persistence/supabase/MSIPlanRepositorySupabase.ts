import type { SupabaseClient } from "@supabase/supabase-js";
import type { MSIPlan } from "../../../domain/entities/MSIPlan";
import type { MSIPlanRepository } from "../../../domain/repositories/MSIPlanRepository";
import { msiPlanFromRecord, msiPlanToRecord } from "../records";
import type { MSIPlanRow } from "./rows";
import { msiPlanFromRow, msiPlanToRow } from "./rows";

const TABLE = "msi_plans";

/** Supabase-backed MSI plans. getAll returns startDate-ascending (port contract). */
export class MSIPlanRepositorySupabase implements MSIPlanRepository {
  private readonly client: SupabaseClient;
  private readonly userId: string;

  constructor(client: SupabaseClient, userId: string) {
    this.client = client;
    this.userId = userId;
  }

  private toRow(plan: MSIPlan) {
    return { ...msiPlanToRow(msiPlanToRecord(plan)), user_id: this.userId };
  }

  async add(plan: MSIPlan): Promise<void> {
    const { error } = await this.client.from(TABLE).upsert(this.toRow(plan));
    if (error) throw new Error(error.message);
  }

  async update(plan: MSIPlan): Promise<void> {
    await this.add(plan);
  }

  async remove(id: string): Promise<void> {
    const { error } = await this.client.from(TABLE).delete().eq("id", id);
    if (error) throw new Error(error.message);
  }

  async getAll(): Promise<MSIPlan[]> {
    const { data, error } = await this.client
      .from(TABLE)
      .select("*")
      .order("start_date", { ascending: true });
    if (error) throw new Error(error.message);
    return ((data ?? []) as MSIPlanRow[]).map(msiPlanFromRow).map(msiPlanFromRecord);
  }
}
