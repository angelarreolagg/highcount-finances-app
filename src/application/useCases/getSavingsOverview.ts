import type { SavingsRepository } from "../../domain/repositories/SavingsRepository";
import { buildSavingsSummary } from "../../domain/services/savingsSummary";
import type { SavingsOverviewDTO } from "../dto/savingsOverview";

export interface GetSavingsOverviewDeps {
  savingsRepository: SavingsRepository;
}

export function makeGetSavingsOverview(deps: GetSavingsOverviewDeps) {
  return async function getSavingsOverview(): Promise<SavingsOverviewDTO> {
    const entries = await deps.savingsRepository.getAll();
    return {
      summary: buildSavingsSummary(entries),
      hasEntries: entries.length > 0,
    };
  };
}
