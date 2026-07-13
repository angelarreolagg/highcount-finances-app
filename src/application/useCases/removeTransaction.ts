import type { TransactionRepository } from "../../domain/repositories/TransactionRepository";

export interface RemoveTransactionDeps {
  transactionRepository: TransactionRepository;
}

export function makeRemoveTransaction(deps: RemoveTransactionDeps) {
  return async function removeTransaction(id: string): Promise<void> {
    const transactions = await deps.transactionRepository.getAll();
    const existing = transactions.find((t) => t.id === id);
    if (!existing) {
      throw new Error("Transaction not found");
    }
    if (existing.msiPlanId != null) {
      throw new Error("MSI installments are managed through their plan");
    }
    await deps.transactionRepository.remove(id);
  };
}
