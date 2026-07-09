import type { SavingsEntry } from "../entities/SavingsEntry";

export interface SavingsRepository {
  add(entry: SavingsEntry): Promise<void>;
  /** All entries sorted by date ascending. */
  getAll(): Promise<SavingsEntry[]>;
}
