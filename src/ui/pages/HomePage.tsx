import { useState } from "react";
import { motion } from "motion/react";
import { Trans, useTranslation } from "react-i18next";
import { Link } from "react-router";
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

/**
 * Staged "being built" reveal for the dashboard — variant-driven so the cells AND the GlassCards
 * nested inside them both resolve to `visible` (an explicit-object animate would break that chain
 * and leave the cards stuck at `hidden`). The grid drives its own children on mount.
 */
const gridReveal = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.08 } },
};
const cellReveal = {
  hidden: { opacity: 0, y: 24, scale: 0.94 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring" as const, bounce: 0.28, duration: 0.7 },
  },
};

function RunwayChip({ summary }: { summary: DashboardSummaryDTO }) {
  const { t } = useTranslation();
  if (summary.riskLevel === "unknown") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs text-white/70 backdrop-blur">
        {t("runway.unknown")}
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
      {t("runway.months", { count: Number(summary.monthsOfRunway) })}
      {warning &&
        ` — ${t("runway.belowThreshold", { threshold: RUNWAY_WARNING_THRESHOLD_MONTHS })}`}
    </span>
  );
}

export function HomePage() {
  const { t } = useTranslation();
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
            label={t("home.heroLabel")}
            amount={summary.overview.currentBalance}
            roll="pachinko"
          >
            <p className="mt-2 text-sm tabular-nums text-white/70">
              <Trans
                i18nKey="home.balanceBreakdown"
                values={{
                  income: summary.overview.totalIncome.format(),
                  expenses: summary.overview.totalExpensesToDate.format(),
                }}
                components={{ inc: <span className="text-mint" /> }}
              />
            </p>
            <p className="mt-1 text-sm tabular-nums text-white/70">
              {t("home.realTotal")}{" "}
              <span
                className={summary.overview.realBalance.isNegative() ? "text-coral" : "text-white"}
              >
                {summary.overview.realBalance.format()}
              </span>
            </p>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
              <RunwayChip summary={summary} />
              <Link
                to={`/summary/${year}`}
                className="text-xs text-white/50 underline-offset-2 transition-colors hover:text-white hover:underline"
              >
                {t("common.yearInReview")} →
              </Link>
            </div>
          </RouteHero>
        ) : (
          <div className="flex h-56 items-end justify-center pb-10">
            {isError ? (
              <p className="text-sm text-coral">{(error as Error).message}</p>
            ) : (
              <p className="text-sm text-white/60">{t("common.loading")}</p>
            )}
          </div>
        )
      }
    >
      {summary && (
        <motion.div
          variants={gridReveal}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 gap-4 pt-4 md:grid-cols-2 xl:min-h-0 xl:flex-1 xl:grid-cols-4 xl:grid-rows-2"
        >
          <motion.div
            variants={cellReveal}
            className="min-h-0 md:col-span-2 xl:col-span-2 xl:row-span-2"
          >
            <MonthGrid
              year={browsedYear}
              statuses={(yearGrid ?? summary).monthStatuses}
              totals={(yearGrid ?? summary).monthTotals}
              currentMonthIndex={browsedYear === year ? monthIndex : -1}
              onPrevYear={() => setBrowsedYear((y) => y - 1)}
              onNextYear={() => setBrowsedYear((y) => Math.min(y + 1, year))}
              canGoNext={browsedYear < year}
            />
          </motion.div>
          <motion.div variants={cellReveal} className="min-h-0">
            <StatsPanel summary={summary} />
          </motion.div>
          <motion.div variants={cellReveal} className="min-h-0">
            <SavingsSection />
          </motion.div>
          <motion.div variants={cellReveal} className="min-h-0 xl:col-span-2">
            <MSISection />
          </motion.div>
        </motion.div>
      )}
      <MonthDetailModal />
    </PageShell>
  );
}
