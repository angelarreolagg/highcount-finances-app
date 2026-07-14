import { DEFAULT_CATEGORIES } from "../../domain/entities/Category";
import type { Card } from "../../domain/entities/Card";
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
 * Composition root: wires domain repository interfaces to their IndexedDB
 * implementations. Porting to mobile/desktop means swapping only this file
 * (and the adapters it instantiates).
 */

const DEFAULT_ACCOUNTS: Card[] = [{ id: "account-cash", name: "Cash", type: "cash" }];

export const repositories = {
  transactionRepository: new TransactionRepositoryIndexedDb(),
  cardRepository: new CardRepositoryIndexedDb(),
  categoryRepository: new CategoryRepositoryIndexedDb(),
  savingsRepository: new SavingsRepositoryIndexedDb(),
  msiPlanRepository: new MSIPlanRepositoryIndexedDb(),
};

export const useCases = {
  addTransaction: makeAddTransaction(repositories),
  registerMSIPurchase: makeRegisterMSIPurchase(repositories),
  logSavingsGrowth: makeLogSavingsGrowth(repositories),
  getDashboardSummary: makeGetDashboardSummary(repositories),
  getYearMonthGrid: makeGetYearMonthGrid(repositories),
  getMonthDetail: makeGetMonthDetail(repositories),
  getAnnualSummary: makeGetAnnualSummary(repositories),
  getExpensesFeed: makeGetExpensesFeed(repositories),
  getSavingsOverview: makeGetSavingsOverview(repositories),
  addCard: makeAddCard(repositories),
  updateTransaction: makeUpdateTransaction(repositories),
  removeTransaction: makeRemoveTransaction(repositories),
  updateCard: makeUpdateCard(repositories),
  removeCard: makeRemoveCard(repositories),
  updateMSIPlan: makeUpdateMSIPlan(repositories),
  removeMSIPlan: makeRemoveMSIPlan(repositories),
  updateSavingsEntry: makeUpdateSavingsEntry(repositories),
  removeSavingsEntry: makeRemoveSavingsEntry(repositories),
};

/** Seed reference data on first run. Call once before rendering the app. */
export async function initializeApp(): Promise<void> {
  await repositories.categoryRepository.ensureSeeded(DEFAULT_CATEGORIES);
  await repositories.cardRepository.ensureSeeded(DEFAULT_ACCOUNTS);
}
