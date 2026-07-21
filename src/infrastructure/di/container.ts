import { DEFAULT_CATEGORIES } from "../../domain/entities/Category";
import type { Card } from "../../domain/entities/Card";
import type { CardRepository } from "../../domain/repositories/CardRepository";
import type { CategoryRepository } from "../../domain/repositories/CategoryRepository";
import type { MSIPlanRepository } from "../../domain/repositories/MSIPlanRepository";
import type { SavingsRepository } from "../../domain/repositories/SavingsRepository";
import type { TransactionRepository } from "../../domain/repositories/TransactionRepository";
import { makeAddCard, makeRemoveCard, makeUpdateCard } from "../../application/useCases/manageCards";
import { makeAddTransaction } from "../../application/useCases/addTransaction";
import { makeRemoveMSIPlan } from "../../application/useCases/removeMSIPlan";
import { makeRemoveSavingsEntry } from "../../application/useCases/removeSavingsEntry";
import { makeRemoveTransaction } from "../../application/useCases/removeTransaction";
import { makeUpdateMSIPlan } from "../../application/useCases/updateMSIPlan";
import { makeUpdateSavingsEntry } from "../../application/useCases/updateSavingsEntry";
import { makeUpdateTransaction } from "../../application/useCases/updateTransaction";
import { makeGetAnnualSummary } from "../../application/useCases/getAnnualSummary";
import { makeGetDashboardSummary } from "../../application/useCases/getDashboardSummary";
import { makeGetExpensesFeed } from "../../application/useCases/getExpensesFeed";
import { makeGetMonthDetail } from "../../application/useCases/getMonthDetail";
import { makeGetSavingsOverview } from "../../application/useCases/getSavingsOverview";
import { makeGetYearMonthGrid } from "../../application/useCases/getYearMonthGrid";
import { makeLogSavingsGrowth } from "../../application/useCases/logSavingsGrowth";
import { makeRegisterMSIPurchase } from "../../application/useCases/registerMSIPurchase";
import { CardRepositoryIndexedDb } from "../persistence/indexedDb/CardRepositoryIndexedDb";
import { CategoryRepositoryIndexedDb } from "../persistence/indexedDb/CategoryRepositoryIndexedDb";
import { MSIPlanRepositoryIndexedDb } from "../persistence/indexedDb/MSIPlanRepositoryIndexedDb";
import { SavingsRepositoryIndexedDb } from "../persistence/indexedDb/SavingsRepositoryIndexedDb";
import { TransactionRepositoryIndexedDb } from "../persistence/indexedDb/TransactionRepositoryIndexedDb";

/**
 * Composition root. The active backend is swappable at runtime: `repositories` and
 * `useCases` are mutable (`let`) module bindings that consumers access lazily by property,
 * so calling `setBackend(...)` (on sign in / out) makes already-mounted hooks pick up the
 * new implementation on their next fetch — no UI wiring change needed. The IndexedDB
 * implementation is the default (signed-out / local mode); a Supabase implementation is
 * injected by the auth layer via `setBackend(createSupabaseRepositories(...))`.
 */

/** The repository bag every use-case factory (structurally) depends on. */
export interface Repositories {
  transactionRepository: TransactionRepository;
  cardRepository: CardRepository;
  categoryRepository: CategoryRepository;
  savingsRepository: SavingsRepository;
  msiPlanRepository: MSIPlanRepository;
}

const DEFAULT_ACCOUNTS: Card[] = [{ id: "account-cash", name: "Cash", type: "cash" }];

export function createIndexedDbRepositories(): Repositories {
  return {
    transactionRepository: new TransactionRepositoryIndexedDb(),
    cardRepository: new CardRepositoryIndexedDb(),
    categoryRepository: new CategoryRepositoryIndexedDb(),
    savingsRepository: new SavingsRepositoryIndexedDb(),
    msiPlanRepository: new MSIPlanRepositoryIndexedDb(),
  };
}

function buildUseCases(repos: Repositories) {
  return {
    addTransaction: makeAddTransaction(repos),
    registerMSIPurchase: makeRegisterMSIPurchase(repos),
    logSavingsGrowth: makeLogSavingsGrowth(repos),
    getDashboardSummary: makeGetDashboardSummary(repos),
    getYearMonthGrid: makeGetYearMonthGrid(repos),
    getMonthDetail: makeGetMonthDetail(repos),
    getAnnualSummary: makeGetAnnualSummary(repos),
    getExpensesFeed: makeGetExpensesFeed(repos),
    getSavingsOverview: makeGetSavingsOverview(repos),
    addCard: makeAddCard(repos),
    updateTransaction: makeUpdateTransaction(repos),
    removeTransaction: makeRemoveTransaction(repos),
    updateCard: makeUpdateCard(repos),
    removeCard: makeRemoveCard(repos),
    updateMSIPlan: makeUpdateMSIPlan(repos),
    removeMSIPlan: makeRemoveMSIPlan(repos),
    updateSavingsEntry: makeUpdateSavingsEntry(repos),
    removeSavingsEntry: makeRemoveSavingsEntry(repos),
  };
}

export let repositories: Repositories = createIndexedDbRepositories();
export let useCases = buildUseCases(repositories);

/** Swap the active backend (called by the auth layer on sign in / out). */
export function setBackend(repos: Repositories): void {
  repositories = repos;
  useCases = buildUseCases(repos);
}

/** Seed reference data (default categories + a Cash account) into a given backend. */
export async function seedRepositories(repos: Repositories): Promise<void> {
  await repos.categoryRepository.ensureSeeded(DEFAULT_CATEGORIES);
  await repos.cardRepository.ensureSeeded(DEFAULT_ACCOUNTS);
}

/** Seed reference data on the ACTIVE backend. */
export async function initializeBackend(): Promise<void> {
  await seedRepositories(repositories);
}
