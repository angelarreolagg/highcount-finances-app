import type { DashboardSummaryDTO } from "../../../application/dto/dashboard";
import { chipClass } from "../../utils/chips";
import { GlassCard } from "../shared/GlassCard";

export function StatsPanel({ summary }: { summary: DashboardSummaryDTO }) {
  const largest = summary.largestExpense;
  return (
    <GlassCard title="This month" className="h-full">
      <ul className="space-y-3 text-sm">
        <li className="flex items-center justify-between">
          <span className="text-white/60">Income</span>
          <span className="tabular-nums text-mint">+{summary.totalIncome.format()}</span>
        </li>
        <li className="flex items-center justify-between">
          <span className="text-white/60">Net</span>
          <span className="tabular-nums">{summary.net.format()}</span>
        </li>
        <li className="flex items-center justify-between gap-3">
          <span className="text-white/60">Largest expense</span>
          {largest ? (
            <span className="flex min-w-0 items-center gap-2">
              <span
                className={`flex size-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${chipClass(largest.categoryName)}`}
              >
                {largest.categoryName[0]}
              </span>
              <span className="truncate text-white/60">{largest.categoryName}</span>
              <span className="tabular-nums">−{largest.amount.format()}</span>
            </span>
          ) : (
            <span className="text-white/40">No expenses yet</span>
          )}
        </li>
      </ul>
    </GlassCard>
  );
}
