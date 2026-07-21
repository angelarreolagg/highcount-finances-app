import type { MSIPlan } from "../../../domain/entities/MSIPlan";
import type { MSIPlanRepository } from "../../../domain/repositories/MSIPlanRepository";
import type { MSIPlanRecord } from "../records";
import { msiPlanFromRecord as toEntity, msiPlanToRecord as toRecord } from "../records";
import { STORES, idbDelete, idbGetAll, idbPut } from "./db";

export class MSIPlanRepositoryIndexedDb implements MSIPlanRepository {
  async add(plan: MSIPlan): Promise<void> {
    await idbPut(STORES.msiPlans, toRecord(plan));
  }

  async update(plan: MSIPlan): Promise<void> {
    await this.add(plan);
  }

  async remove(id: string): Promise<void> {
    await idbDelete(STORES.msiPlans, id);
  }

  async getAll(): Promise<MSIPlan[]> {
    const records = await idbGetAll<MSIPlanRecord>(STORES.msiPlans);
    return records.map(toEntity).sort((a, b) => a.startDate.localeCompare(b.startDate));
  }
}
