import type { CardRepository } from "../../domain/repositories/CardRepository";
import type { CategoryRepository } from "../../domain/repositories/CategoryRepository";
import type { SavingsRepository } from "../../domain/repositories/SavingsRepository";
import type { TransactionRepository } from "../../domain/repositories/TransactionRepository";
import {
  ANNUAL_SUMMARY_UNLOCK_DAY,
  ANNUAL_SUMMARY_UNLOCK_MONTH_INDEX,
  buildAnnualSummary,
  isAnnualSummaryUnlocked,
} from "../../domain/services/annualSummary";
import { monthPrefix } from "../../domain/value-objects/calendar";
import type { AnnualSummaryDTO } from "../dto/annual";

export interface GetAnnualSummaryDeps {
  transactionRepository: TransactionRepository;
  savingsRepository: SavingsRepository;
  cardRepository: CardRepository;
  categoryRepository: CategoryRepository;
}

export function makeGetAnnualSummary(deps: GetAnnualSummaryDeps) {
  return async function getAnnualSummary(
    year: number,
    today: Date = new Date(),
  ): Promise<AnnualSummaryDTO> {
    const unlocksOn = `${monthPrefix(year, ANNUAL_SUMMARY_UNLOCK_MONTH_INDEX)}-${ANNUAL_SUMMARY_UNLOCK_DAY}`;
    if (!isAnnualSummaryUnlocked(year, today)) {
      return { year, unlocked: false, summary: null, unlocksOn };
    }

    const [transactions, savingsEntries, cards, categories] = await Promise.all([
      deps.transactionRepository.getByYear(year),
      deps.savingsRepository.getAll(),
      deps.cardRepository.getAll(),
      deps.categoryRepository.getAll(),
    ]);

    return {
      year,
      unlocked: true,
      summary: buildAnnualSummary(year, transactions, savingsEntries, categories, cards),
      unlocksOn,
    };
  };
}
