import type { Category } from "../entities/Category";

export interface CategoryRepository {
  getAll(): Promise<Category[]>;
  /** Insert the given categories only when the store is empty (first run). */
  ensureSeeded(defaults: Category[]): Promise<void>;
}
