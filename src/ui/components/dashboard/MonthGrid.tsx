import { motion } from "motion/react";
import type { MonthTotalsDTO } from "../../../application/dto/dashboard";
import type { MonthStatus } from "../../../domain/services/billingCycle";
import { MONTH_NAMES } from "../../../shared/utils/months";
import { useUiStore } from "../../../state/uiStore";
import { GlassCard } from "../shared/GlassCard";

interface MonthGridProps {
  year: number;
  statuses: MonthStatus[];
  totals: MonthTotalsDTO[];
  currentMonthIndex: number;
}

function MonthFigures({ totals }: { totals: MonthTotalsDTO }) {
  if (totals.income.isZero() && totals.expenses.isZero()) {
    return <span className="mt-1 hidden text-[11px] text-white/25 lg:block">—</span>;
  }
  return (
    <span className="mt-1 hidden space-y-0.5 text-[11px] leading-tight tabular-nums lg:block">
      <span className="block text-mint">+{totals.income.format()}</span>
      <span className="block text-white/70">−{totals.expenses.format()}</span>
      <span className="block text-white/50">net {totals.net.format()}</span>
    </span>
  );
}

export function MonthGrid({ year, statuses, totals, currentMonthIndex }: MonthGridProps) {
  const openMonthDetail = useUiStore((s) => s.openMonthDetail);

  return (
    <GlassCard title={`Months · ${year}`} className="h-full">
      <div className="flex h-full flex-col">
        <div className="grid grid-cols-4 gap-2 lg:gap-3 xl:flex-1 xl:grid-rows-3">
        {MONTH_NAMES.map((name, monthIndex) => {
          const status = statuses[monthIndex] ?? { isViewable: false, isOpenForLogging: false };
          const monthTotals = totals[monthIndex];
          const isCurrent = monthIndex === currentMonthIndex;
          return (
            <motion.button
              key={name}
              type="button"
              disabled={!status.isViewable}
              whileTap={status.isViewable ? { scale: 0.94 } : undefined}
              onClick={() => openMonthDetail({ year, monthIndex })}
              className={`relative rounded-2xl py-2.5 text-xs font-medium transition-colors lg:px-2 lg:py-3 lg:text-left ${
                isCurrent
                  ? "border border-peri/40 bg-peri/25 text-white"
                  : status.isViewable
                    ? "bg-white/5 text-white/85 hover:bg-white/10"
                    : "text-white/25"
              }`}
            >
              <span className="block lg:pl-1">
                {name.slice(0, 3)}
                {status.isViewable && monthTotals && <MonthFigures totals={monthTotals} />}
              </span>
              {status.isOpenForLogging && (
                <span
                  className="absolute top-1.5 right-1.5 size-1.5 rounded-full bg-mint"
                  title="Open for logging"
                />
              )}
            </motion.button>
          );
        })}
        </div>
        <p className="mt-3 flex shrink-0 items-center gap-1.5 text-[11px] text-white/40">
          <span className="size-1.5 rounded-full bg-mint" /> open for logging expenses
        </p>
      </div>
    </GlassCard>
  );
}
