import type { MSIPlan } from "../entities/MSIPlan";

export interface MSIPlanRepository {
  add(plan: MSIPlan): Promise<void>;
  getAll(): Promise<MSIPlan[]>;
}
