import type { Repositories } from "./di/container";
import { seedRepositories } from "./di/container";

/**
 * Permanently delete all finance data from a backend. Removes in reverse-FK order
 * (transactions → savings → plans → cards) so the cloud's foreign keys never block it.
 * Default categories are left in place (they're fixed reference data, re-seeded anyway).
 * Uses only the shared repository ports, so it works identically for local and cloud.
 */
export async function wipeDataset(repos: Repositories): Promise<void> {
  const [transactions, savings, plans, cards] = await Promise.all([
    repos.transactionRepository.getAll(),
    repos.savingsRepository.getAll(),
    repos.msiPlanRepository.getAll(),
    repos.cardRepository.getAll(),
  ]);

  await repos.transactionRepository.removeMany(transactions.map((t) => t.id));
  for (const entry of savings) await repos.savingsRepository.remove(entry.id);
  for (const plan of plans) await repos.msiPlanRepository.remove(plan.id);
  for (const card of cards) await repos.cardRepository.remove(card.id);
}

/** Wipe a backend and restore the fresh-install defaults (categories + a Cash account). */
export async function resetDataset(repos: Repositories): Promise<void> {
  await wipeDataset(repos);
  await seedRepositories(repos);
}
