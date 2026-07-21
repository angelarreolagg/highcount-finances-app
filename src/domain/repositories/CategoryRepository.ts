import type { Category } from "../entities/Category";

export interface CategoryRepository {
  /** The fixed default categories — static constants, not stored per user. */
  getAll(): Promise<Category[]>;
}
