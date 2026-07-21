import type { Category } from "../../../domain/entities/Category";
import { DEFAULT_CATEGORIES } from "../../../domain/entities/Category";
import type { CategoryRepository } from "../../../domain/repositories/CategoryRepository";

/** Categories are static client-side constants — no per-user rows in the cloud. */
export class CategoryRepositorySupabase implements CategoryRepository {
  async getAll(): Promise<Category[]> {
    return DEFAULT_CATEGORIES;
  }
}
