import type { Card } from "../entities/Card";

export interface CardRepository {
  add(card: Card): Promise<void>;
  getAll(): Promise<Card[]>;
  remove(id: string): Promise<void>;
  /** Insert the given cards only when the store is empty (first run). */
  ensureSeeded(defaults: Card[]): Promise<void>;
}
