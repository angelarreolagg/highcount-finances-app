import { useState } from "react";
import type { DashboardSummaryDTO } from "../../application/dto/dashboard";
import { RUNWAY_WARNING_THRESHOLD_MONTHS } from "../../domain/services/riskIndicator";
import { PageShell } from "../components/layout/PageShell";
import { RouteHero } from "../components/layout/RouteHero";
import { MonthGrid } from "../components/dashboard/MonthGrid";
import { MSISection } from "../components/dashboard/MSISection";
import { SavingsSection } from "../components/dashboard/SavingsSection";
import { StatsPanel } from "../components/dashboard/StatsPanel";
import { MonthDetailModal } from "../components/modals/MonthDetailModal";
import { useDashboardSummary, useYearMonthGrid } from "../hooks/useDashboardData";

function RunwayChip({ summary }: { summary: DashboardSummaryDTO }) {
  if (summary.riskLevel === "unknown") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs text-white/70 backdrop-blur">
        Runway unknown — log savings and an income
      </span>
    );
  }
  const warning = summary.riskLevel === "warning";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs backdrop-blur ${
        warning ? "border-coral/40 bg-coral/15 text-coral" : "border-mint/40 bg-mint/15 text-mint"
      }`}
    >
      <span className={`size-1.5 rounded-full ${warning ? "bg-coral" : "bg-mint"}`} />
      {summary.monthsOfRunway} months of runway
      {warning && ` — below ${RUNWAY_WARNING_THRESHOLD_MONTHS}`}
    </span>
  );
}

export function HomePage() {
  const today = new Date();
  const year = today.getFullYear();
  const monthIndex = today.getMonth();
  const { data: summary, isError, error } = useDashboardSummary(year, monthIndex);

  // The calendar can browse other years; the hero/stats stay anchored to today.
  const [browsedYear, setBrowsedYear] = useState(year);
  const { data: yearGrid } = useYearMonthGrid(browsedYear);

  return (
    <PageShell
      lockDesktop
      hero={
        summary ? (
          <RouteHero
            label="Total money · all accounts"
            amount={summary.overview.currentBalance}
            roll="pachinko"
          >
            <p className="mt-2 text-sm tabular-nums text-white/70">
              <span className="text-mint">+{summary.overview.totalIncome.format()}</span> income ·{" "}
              −{summary.overview.totalExpensesToDate.format()} expenses
            </p>
            <p className="mt-1 text-sm tabular-nums text-white/70">
              Real total (all MSI committed):{" "}
              <span
                className={summary.overview.realBalance.isNegative() ? "text-coral" : "text-white"}
              >
                {summary.overview.realBalance.format()}
              </span>
            </p>
            <div className="mt-4">
              <RunwayChip summary={summary} />
            </div>
          </RouteHero>
        ) : (
          <div className="flex h-56 items-end justify-center pb-10">
            {isError ? (
              <p className="text-sm text-coral">{(error as Error).message}</p>
            ) : (
              <p className="text-sm text-white/60">Loading…</p>
            )}
          </div>
        )
      }
    >
      {summary && (
        <div className="grid grid-cols-1 gap-4 pt-4 md:grid-cols-2 xl:min-h-0 xl:flex-1 xl:grid-cols-4 xl:grid-rows-2">
          <div className="min-h-0 md:col-span-2 xl:col-span-2 xl:row-span-2">
            <MonthGrid
              year={browsedYear}
              statuses={(yearGrid ?? summary).monthStatuses}
              totals={(yearGrid ?? summary).monthTotals}
              currentMonthIndex={browsedYear === year ? monthIndex : -1}
              onPrevYear={() => setBrowsedYear((y) => y - 1)}
              onNextYear={() => setBrowsedYear((y) => Math.min(y + 1, year))}
              canGoNext={browsedYear < year}
            />
          </div>
          <StatsPanel summary={summary} />
          <SavingsSection />
          <div className="min-h-0 xl:col-span-2">
            <MSISection />
          </div>
        </div>
      )}
      <MonthDetailModal />
    </PageShell>
  );
}
