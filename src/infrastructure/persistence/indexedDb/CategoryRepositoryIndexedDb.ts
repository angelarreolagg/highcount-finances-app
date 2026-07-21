import type { Category } from "../../../domain/entities/Category";
import { DEFAULT_CATEGORIES } from "../../../domain/entities/Category";
import type { CategoryRepository } from "../../../domain/repositories/CategoryRepository";

/** Categories are static client-side constants — no storage. */
export class CategoryRepositoryIndexedDb implements CategoryRepository {
  async getAll(): Promise<Category[]> {
    return DEFAULT_CATEGORIES;
  }
}
