import type { SupabaseClient } from "@supabase/supabase-js";
import type { Category } from "../../../domain/entities/Category";
import type { CategoryRepository } from "../../../domain/repositories/CategoryRepository";
import type { CategoryRow } from "./rows";
import { categoryFromRow, categoryToRow } from "./rows";

const TABLE = "categories";

/** Supabase-backed categories: read + seed only (matches the port). */
export class CategoryRepositorySupabase implements CategoryRepository {
  private readonly client: SupabaseClient;
  private readonly userId: string;

  constructor(client: SupabaseClient, userId: string) {
    this.client = client;
    this.userId = userId;
  }

  async getAll(): Promise<Category[]> {
    const { data, error } = await this.client.from(TABLE).select("*");
    if (error) throw new Error(error.message);
    return ((data ?? []) as CategoryRow[]).map(categoryFromRow);
  }

  async ensureSeeded(defaults: Category[]): Promise<void> {
    const { count, error } = await this.client
      .from(TABLE)
      .select("id", { count: "exact", head: true });
    if (error) throw new Error(error.message);
    if ((count ?? 0) === 0 && defaults.length > 0) {
      const rows = defaults.map((c) => ({ ...categoryToRow(c), user_id: this.userId }));
      const { error: insertError } = await this.client.from(TABLE).upsert(rows);
      if (insertError) throw new Error(insertError.message);
    }
  }
}
