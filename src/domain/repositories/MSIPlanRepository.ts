import type { MSIPlan } from "../entities/MSIPlan";

export interface MSIPlanRepository {
  add(plan: MSIPlan): Promise<void>;
  getAll(): Promise<MSIPlan[]>;
  /** Replace the stored plan with the same id. */
  update(plan: MSIPlan): Promise<void>;
  remove(id: string): Promise<void>;
}
