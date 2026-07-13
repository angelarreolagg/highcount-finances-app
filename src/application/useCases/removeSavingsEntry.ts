import type { SavingsRepository } from "../../domain/repositories/SavingsRepository";

export interface RemoveSavingsEntryDeps {
  savingsRepository: SavingsRepository;
}

export function makeRemoveSavingsEntry(deps: RemoveSavingsEntryDeps) {
  return async function removeSavingsEntry(id: string): Promise<void> {
    await deps.savingsRepository.remove(id);
  };
}
