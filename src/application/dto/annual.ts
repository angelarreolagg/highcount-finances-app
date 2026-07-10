import type { AnnualSummary } from "../../domain/services/annualSummary";

export interface AnnualSummaryDTO {
  year: number;
  /** Current and past years are always unlocked; only future years are locked. */
  unlocked: boolean;
  /** Present only when unlocked. */
  summary: AnnualSummary | null;
}
