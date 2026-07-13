import type { MSIPlan } from "../../../domain/entities/MSIPlan";
import type { MSIPlanRepository } from "../../../domain/repositories/MSIPlanRepository";
import { Money } from "../../../domain/value-objects/Money";
import { STORES, idbDelete, idbGetAll, idbPut } from "./db";

interface MSIPlanRecord {
  id: string;
  cardId: string;
  categoryId: string;
  description: string;
  totalAmount: string;
  months: number;
  monthlyAmount: string;
  withInterest: boolean;
  startDate: string;
}

export class MSIPlanRepositoryIndexedDb implements MSIPlanRepository {
  async add(plan: MSIPlan): Promise<void> {
    const record: MSIPlanRecord = {
      ...plan,
      totalAmount: plan.totalAmount.toStorage(),
      monthlyAmount: plan.monthlyAmount.toStorage(),
    };
    await idbPut(STORES.msiPlans, record);
  }

  async update(plan: MSIPlan): Promise<void> {
    await this.add(plan);
  }

  async remove(id: string): Promise<void> {
    await idbDelete(STORES.msiPlans, id);
  }

  async getAll(): Promise<MSIPlan[]> {
    const records = await idbGetAll<MSIPlanRecord>(STORES.msiPlans);
    return records
      .map((r) => ({
        ...r,
        totalAmount: Money.from(r.totalAmount),
        monthlyAmount: Money.from(r.monthlyAmount),
      }))
      .sort((a, b) => a.startDate.localeCompare(b.startDate));
  }
}
