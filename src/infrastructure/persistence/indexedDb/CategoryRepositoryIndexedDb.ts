import type { Category } from "../../../domain/entities/Category";
import type { CategoryRepository } from "../../../domain/repositories/CategoryRepository";
import { STORES, idbBulkPut, idbCount, idbGetAll } from "./db";

export class CategoryRepositoryIndexedDb implements CategoryRepository {
  async getAll(): Promise<Category[]> {
    return idbGetAll<Category>(STORES.categories);
  }

  async ensureSeeded(defaults: Category[]): Promise<void> {
    const count = await idbCount(STORES.categories);
    if (count === 0) {
      await idbBulkPut(STORES.categories, defaults);
    }
  }
}
