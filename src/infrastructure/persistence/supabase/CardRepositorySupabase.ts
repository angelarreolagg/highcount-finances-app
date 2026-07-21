import type { SupabaseClient } from "@supabase/supabase-js";
import type { Card } from "../../../domain/entities/Card";
import type { CardRepository } from "../../../domain/repositories/CardRepository";
import { cardFromRecord, cardToRecord } from "../records";
import type { CardRow } from "./rows";
import { cardFromRow, cardToRow } from "./rows";

const TABLE = "cards";

/** Supabase-backed cards/accounts. RLS scopes every row to the signed-in user. */
export class CardRepositorySupabase implements CardRepository {
  private readonly client: SupabaseClient;
  private readonly userId: string;

  constructor(client: SupabaseClient, userId: string) {
    this.client = client;
    this.userId = userId;
  }

  private toRow(card: Card) {
    return { ...cardToRow(cardToRecord(card)), user_id: this.userId };
  }

  async add(card: Card): Promise<void> {
    const { error } = await this.client.from(TABLE).upsert(this.toRow(card));
    if (error) throw new Error(error.message);
  }

  async getAll(): Promise<Card[]> {
    const { data, error } = await this.client.from(TABLE).select("*");
    if (error) throw new Error(error.message);
    return ((data ?? []) as CardRow[]).map(cardFromRow).map(cardFromRecord);
  }

  async update(card: Card): Promise<void> {
    await this.add(card);
  }

  async remove(id: string): Promise<void> {
    const { error } = await this.client.from(TABLE).delete().eq("id", id);
    if (error) throw new Error(error.message);
  }

  async ensureSeeded(defaults: Card[]): Promise<void> {
    const { count, error } = await this.client
      .from(TABLE)
      .select("id", { count: "exact", head: true });
    if (error) throw new Error(error.message);
    if ((count ?? 0) === 0 && defaults.length > 0) {
      const { error: insertError } = await this.client
        .from(TABLE)
        .upsert(defaults.map((c) => this.toRow(c)));
      if (insertError) throw new Error(insertError.message);
    }
  }
}
