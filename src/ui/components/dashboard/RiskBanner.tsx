import type { DashboardSummaryDTO } from "../../../application/dto/dashboard";
import { RUNWAY_WARNING_THRESHOLD_MONTHS } from "../../../domain/services/riskIndicator";

export function RiskBanner({ summary }: { summary: DashboardSummaryDTO }) {
  if (summary.riskLevel === "unknown") {
    return (
      <p className="border p-2 mb-4 text-sm">
        Months of runway: unknown — log a savings balance and at least one income to compute it.
      </p>
    );
  }
  return (
    <p className={`border p-2 mb-4 text-sm ${summary.riskLevel === "warning" ? "border-red-600 text-red-700" : ""}`}>
      Savings: {summary.currentSavings?.format() ?? "—"} · Months of runway: {summary.monthsOfRunway}
      {summary.riskLevel === "warning" &&
        ` — WARNING: below ${RUNWAY_WARNING_THRESHOLD_MONTHS} months of income`}
    </p>
  );
}
