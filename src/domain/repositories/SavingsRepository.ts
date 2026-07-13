import type { SavingsEntry } from "../entities/SavingsEntry";

export interface SavingsRepository {
  add(entry: SavingsEntry): Promise<void>;
  /** All entries sorted by date ascending. */
  getAll(): Promise<SavingsEntry[]>;
  /** Replace the stored entry with the same id. */
  update(entry: SavingsEntry): Promise<void>;
  remove(id: string): Promise<void>;
}
