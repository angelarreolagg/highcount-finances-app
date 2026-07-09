import type { AnnualSummary } from "../../domain/services/annualSummary";

export interface AnnualSummaryDTO {
  year: number;
  unlocked: boolean;
  /** Present only when unlocked. */
  summary: AnnualSummary | null;
  /** ISO date on which this year's summary unlocks (for the locked message). */
  unlocksOn: string;
}
