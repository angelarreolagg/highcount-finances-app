import type { SavingsSummary } from "../../domain/services/savingsSummary";

export interface SavingsOverviewDTO {
  summary: SavingsSummary;
  /** True when the user has logged at least one entry. */
  hasEntries: boolean;
}
