import { motion } from "motion/react";
import { Link } from "react-router";
import { CardsSection } from "../components/dashboard/CardsSection";
import { MonthGrid } from "../components/dashboard/MonthGrid";
import { MSISection } from "../components/dashboard/MSISection";
import { QuickAddForm } from "../components/dashboard/QuickAddForm";
import { RiskBanner } from "../components/dashboard/RiskBanner";
import { SavingsSection } from "../components/dashboard/SavingsSection";
import { StatsPanel } from "../components/dashboard/StatsPanel";
import { MonthDetailModal } from "../components/modals/MonthDetailModal";
import { useDashboardSummary } from "../hooks/useDashboardData";

export function DashboardPage() {
  const today = new Date();
  const year = today.getFullYear();
  const monthIndex = today.getMonth();
  const { data: summary, isLoading, isError, error } = useDashboardSummary(year, monthIndex);

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-3xl mx-auto p-4"
    >
      <header className="mb-4 flex justify-between items-baseline">
        <h1 className="text-2xl font-bold">High Count</h1>
        <Link to={`/summary/${year}`} className="underline text-sm">
          Year in Review
        </Link>
      </header>

      {isLoading && <p className="text-sm">Loading…</p>}
      {isError && <p className="text-sm text-red-600">{(error as Error).message}</p>}
      {summary && (
        <>
          <RiskBanner summary={summary} />
          <MonthGrid
            year={year}
            availability={summary.monthAvailability}
            currentMonthIndex={monthIndex}
          />
          <StatsPanel summary={summary} />
        </>
      )}

      <QuickAddForm />
      <CardsSection />
      <MSISection />
      <SavingsSection />
      <MonthDetailModal />
    </motion.main>
  );
}
