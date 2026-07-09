import type { DashboardSummaryDTO } from "../../../application/dto/dashboard";
import { MONTH_NAMES } from "../../../shared/utils/months";

export function StatsPanel({ summary }: { summary: DashboardSummaryDTO }) {
  return (
    <section className="mb-6 border p-3">
      <h2 className="text-lg font-semibold mb-2">
        {MONTH_NAMES[summary.monthIndex]} {summary.year}
      </h2>
      {/* Primary metric — plain number for now; ring chart comes in the styling pass. */}
      <p className="text-2xl">{summary.totalExpenses.format()}</p>
      <p className="text-sm">total expenses this month</p>
      <ul className="mt-3 text-sm space-y-1">
        <li>Total income: {summary.totalIncome.format()}</li>
        <li>Net: {summary.net.format()}</li>
        <li>
          Largest expense:{" "}
          {summary.largestExpense
            ? `${summary.largestExpense.amount.format()} (${summary.largestExpense.categoryName})`
            : "—"}
        </li>
      </ul>
    </section>
  );
}
