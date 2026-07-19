import { useTranslation } from "react-i18next";
import type { DashboardSummaryDTO } from "../../../application/dto/dashboard";
import { seedLabel } from "../../i18n/labels";
import { chipClass } from "../../utils/chips";
import { GlassCard } from "../shared/GlassCard";

export function StatsPanel({ summary }: { summary: DashboardSummaryDTO }) {
  const { t } = useTranslation();
  const largest = summary.largestExpense;
  return (
    <GlassCard title={t("dashboard.thisMonth")} className="h-full">
      <ul className="space-y-3 text-sm">
        <li className="flex items-center justify-between">
          <span className="text-white/60">{t("common.income")}</span>
          <span className="tabular-nums text-mint">+{summary.totalIncome.format()}</span>
        </li>
        <li className="flex items-center justify-between">
          <span className="text-white/60">{t("common.net")}</span>
          <span className="tabular-nums">{summary.net.format()}</span>
        </li>
        <li className="flex items-center justify-between gap-3">
          <span className="text-white/60">{t("common.largestExpense")}</span>
          {largest ? (
            <span className="flex min-w-0 items-center gap-2">
              <span
                className={`flex size-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${chipClass(largest.categoryName)}`}
              >
                {seedLabel(t, largest.categoryId, largest.categoryName)[0]}
              </span>
              <span className="truncate text-white/60">
                {seedLabel(t, largest.categoryId, largest.categoryName)}
              </span>
              <span className="tabular-nums">−{largest.amount.format()}</span>
            </span>
          ) : (
            <span className="text-white/40">{t("dashboard.noExpensesYet")}</span>
          )}
        </li>
      </ul>
    </GlassCard>
  );
}
