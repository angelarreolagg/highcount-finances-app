import type { MSIPlanRepository } from "../../domain/repositories/MSIPlanRepository";
import type { TransactionRepository } from "../../domain/repositories/TransactionRepository";

export interface RemoveMSIPlanDeps {
  msiPlanRepository: MSIPlanRepository;
  transactionRepository: TransactionRepository;
}

/** Deletes the plan and every installment transaction it generated. */
export function makeRemoveMSIPlan(deps: RemoveMSIPlanDeps) {
  return async function removeMSIPlan(id: string): Promise<void> {
    const transactions = await deps.transactionRepository.getAll();
    const installmentIds = transactions.filter((t) => t.msiPlanId === id).map((t) => t.id);
    await deps.transactionRepository.removeMany(installmentIds);
    await deps.msiPlanRepository.remove(id);
  };
}
