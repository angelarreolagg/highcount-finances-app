import type { Repositories } from "./di/container";
import type {
  CardRecord,
  CategoryRecord,
  MSIPlanRecord,
  SavingsRecord,
  TransactionRecord,
} from "./persistence/records";
import {
  cardFromRecord,
  cardToRecord,
  msiPlanFromRecord,
  msiPlanToRecord,
  savingsFromRecord,
  savingsToRecord,
  transactionFromRecord,
  transactionToRecord,
} from "./persistence/records";

/**
 * Versioned, backend-agnostic snapshot of the whole finance dataset in the canonical
 * record format. This is the portable "standard format": a local export and a cloud
 * export of the same data are byte-identical. Powers Settings export/import and the
 * one-time local→cloud auto-upload on first sign-in.
 */
export interface BackupDoc {
  version: 1;
  exportedAt: string;
  categories: CategoryRecord[];
  cards: CardRecord[];
  msiPlans: MSIPlanRecord[];
  savingsEntries: SavingsRecord[];
  transactions: TransactionRecord[];
}

export async function exportDataset(repos: Repositories): Promise<BackupDoc> {
  const [categories, cards, msiPlans, savings, transactions] = await Promise.all([
    repos.categoryRepository.getAll(),
    repos.cardRepository.getAll(),
    repos.msiPlanRepository.getAll(),
    repos.savingsRepository.getAll(),
    repos.transactionRepository.getAll(),
  ]);
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    categories, // Category record === entity (no Money/dates)
    cards: cards.map(cardToRecord),
    msiPlans: msiPlans.map(msiPlanToRecord),
    savingsEntries: savings.map(savingsToRecord),
    transactions: transactions.map(transactionToRecord),
  };
}

/**
 * Write a dataset into the target backend in FK dependency order
 * (categories → cards → msi plans → savings → transactions). Upserts by id, so
 * re-importing the same document is idempotent. Categories go through `ensureSeeded`
 * (they're the same fixed defaults on every backend).
 */
export async function importDataset(repos: Repositories, doc: BackupDoc): Promise<void> {
  await repos.categoryRepository.ensureSeeded(doc.categories);
  for (const card of doc.cards) await repos.cardRepository.add(cardFromRecord(card));
  for (const plan of doc.msiPlans) await repos.msiPlanRepository.add(msiPlanFromRecord(plan));
  for (const entry of doc.savingsEntries) await repos.savingsRepository.add(savingsFromRecord(entry));
  await repos.transactionRepository.addMany(doc.transactions.map(transactionFromRecord));
}

/** Copy the entire dataset from one backend to another (used for local→cloud auto-upload). */
export async function copyDataset(from: Repositories, to: Repositories): Promise<void> {
  await importDataset(to, await exportDataset(from));
}
