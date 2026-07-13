import type { Card } from "../entities/Card";

export interface CardRepository {
  add(card: Card): Promise<void>;
  getAll(): Promise<Card[]>;
  /** Replace the stored card with the same id. */
  update(card: Card): Promise<void>;
  remove(id: string): Promise<void>;
  /** Insert the given cards only when the store is empty (first run). */
  ensureSeeded(defaults: Card[]): Promise<void>;
}
