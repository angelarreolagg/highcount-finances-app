import { motion } from "motion/react";
import { useTranslation } from "react-i18next";
import type { MonthTotalsDTO } from "../../../application/dto/dashboard";
import type { MonthStatus } from "../../../domain/services/billingCycle";
import { monthName } from "../../../shared/utils/months";
import { useUiStore } from "../../../state/uiStore";
import { GlassCard } from "../shared/GlassCard";
import { ChevronDownIcon } from "../shared/icons";

interface MonthGridProps {
  year: number;
  statuses: MonthStatus[];
  totals: MonthTotalsDTO[];
  /** Highlighted month, or -1 when browsing a year other than the current one. */
  currentMonthIndex: number;
  onPrevYear: () => void;
  onNextYear: () => void;
  /** False disables the next-year arrow (no browsing into the future). */
  canGoNext: boolean;
}

function MonthFigures({ totals }: { totals: MonthTotalsDTO }) {
  const { t } = useTranslation();
  if (totals.income.isZero() && totals.expenses.isZero()) {
    return <span className="mt-1 hidden text-[11px] text-white/25 lg:block">—</span>;
  }
  return (
    <span className="mt-1 hidden space-y-0.5 text-[11px] leading-tight tabular-nums lg:block">
      <span className="block text-mint">+{totals.income.format()}</span>
      <span className="block text-white/70">−{totals.expenses.format()}</span>
      <span className="block text-white/50">{t("dashboard.net", { amount: totals.net.format() })}</span>
    </span>
  );
}

/** Prev/year/next pager, rendered in the GlassCard action slot. */
function YearPager({
  year,
  onPrevYear,
  onNextYear,
  canGoNext,
}: Pick<MonthGridProps, "year" | "onPrevYear" | "onNextYear" | "canGoNext">) {
  const { t } = useTranslation();
  return (
    <div className="flex items-center gap-1 rounded-full border border-white/10 bg-white/5 p-0.5 text-sm">
      <button
        type="button"
        onClick={onPrevYear}
        aria-label={t("dashboard.prevYear")}
        className="flex size-6 items-center justify-center rounded-full text-white/70 hover:bg-white/10 hover:text-white"
      >
        <ChevronDownIcon size={16} className="rotate-90" />
      </button>
      <span className="min-w-[3ch] text-center font-medium tabular-nums">{year}</span>
      <button
        type="button"
        onClick={onNextYear}
        disabled={!canGoNext}
        aria-label={t("dashboard.nextYear")}
        className="flex size-6 items-center justify-center rounded-full text-white/70 hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent"
      >
        <ChevronDownIcon size={16} className="-rotate-90" />
      </button>
    </div>
  );
}

export function MonthGrid({
  year,
  statuses,
  totals,
  currentMonthIndex,
  onPrevYear,
  onNextYear,
  canGoNext,
}: MonthGridProps) {
  const { t, i18n } = useTranslation();
  const openMonthDetail = useUiStore((s) => s.openMonthDetail);

  return (
    <GlassCard
      title={t("dashboard.months")}
      className="h-full"
      action={
        <YearPager year={year} onPrevYear={onPrevYear} onNextYear={onNextYear} canGoNext={canGoNext} />
      }
    >
      <div className="flex h-full flex-col">
        <div className="grid grid-cols-4 gap-2 lg:gap-3 xl:flex-1 xl:grid-rows-3">
          {Array.from({ length: 12 }, (_, monthIndex) => {
            const shortName = monthName(monthIndex, i18n.language, { short: true });
            const status = statuses[monthIndex] ?? { isViewable: false, isOpenForLogging: false };
            const monthTotals = totals[monthIndex];
            const isCurrent = monthIndex === currentMonthIndex;
            return (
              <motion.button
                key={monthIndex}
                type="button"
                disabled={!status.isViewable}
                whileHover={status.isViewable ? { y: -2, scale: 1.02 } : undefined}
                whileTap={status.isViewable ? { scale: 0.94 } : undefined}
                transition={{ type: "spring", bounce: 0.3 }}
                onClick={() => openMonthDetail({ year, monthIndex })}
                className={`relative rounded-2xl border py-2.5 text-xs font-medium transition-colors lg:px-2 lg:py-3 lg:text-left ${
                  isCurrent
                    ? "border-peri/40 bg-peri/25 text-white"
                    : status.isViewable
                      ? "border-white/5 bg-white/5 text-white/85 hover:border-white/10 hover:bg-white/10"
                      : "border-transparent text-white/25"
                }`}
              >
                <span className="block lg:pl-1">
                  {shortName}
                  {status.isViewable && monthTotals && <MonthFigures totals={monthTotals} />}
                </span>
                {status.isOpenForLogging && (
                  <span
                    className="absolute top-1.5 right-1.5 size-1.5 rounded-full bg-mint"
                    title={t("dashboard.openForLogging")}
                  />
                )}
              </motion.button>
            );
          })}
        </div>
        <p className="mt-3 flex shrink-0 items-center gap-1.5 text-[11px] text-white/40">
          <span className="size-1.5 rounded-full bg-mint" /> {t("dashboard.openForLoggingLegend")}
        </p>
      </div>
    </GlassCard>
  );
}
