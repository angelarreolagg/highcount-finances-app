import { ArrowDownLeft, ArrowUpRight, Scale } from "lucide-react";
import { useTranslation } from "react-i18next";
import { monthName } from "../../../shared/utils/months";
import { useUiStore } from "../../../state/uiStore";
import { useMonthDetail } from "../../hooks/useDashboardData";
import { seedLabel } from "../../i18n/labels";
import { CategoryChip } from "../shared/CategoryChip";
import { Modal } from "../shared/Modal";
import { RowActions } from "../shared/RowActions";

export function MonthDetailModal() {
  const { t, i18n } = useTranslation();
  const detailMonth = useUiStore((s) => s.detailMonth);
  const closeMonthDetail = useUiStore((s) => s.closeMonthDetail);
  const openEdit = useUiStore((s) => s.openEdit);
  const openDelete = useUiStore((s) => s.openDelete);
  const { data, isLoading } = useMonthDetail(
    detailMonth?.year ?? null,
    detailMonth?.monthIndex ?? null,
  );

  const title = detailMonth
    ? `${monthName(detailMonth.monthIndex, i18n.language)} ${detailMonth.year}`
    : "";

  return (
    <Modal open={detailMonth !== null} title={title} onClose={closeMonthDetail}>
      {isLoading && <p className="text-sm text-white/50">{t("common.loading")}</p>}
      {data && (
        <>
          <div className="mb-4 grid grid-cols-3 gap-2 text-center">
            <div className="rounded-2xl bg-white/5 p-3">
              <p className="flex items-center justify-center gap-1 text-xs text-white/50">
                <ArrowDownLeft size={13} strokeWidth={1.8} className="text-mint" />
                {t("common.income")}
              </p>
              <p className="mt-1 text-sm font-semibold tabular-nums text-mint">
                +{data.totalIncome.format()}
              </p>
            </div>
            <div className="rounded-2xl bg-white/5 p-3">
              <p className="flex items-center justify-center gap-1 text-xs text-white/50">
                <ArrowUpRight size={13} strokeWidth={1.8} />
                {t("common.spent")}
              </p>
              <p className="mt-1 text-sm font-semibold tabular-nums">
                −{data.totalExpenses.format()}
              </p>
            </div>
            <div className="rounded-2xl bg-white/5 p-3">
              <p className="flex items-center justify-center gap-1 text-xs text-white/50">
                <Scale size={13} strokeWidth={1.8} />
                {t("common.net")}
              </p>
              <p className="mt-1 text-sm font-semibold tabular-nums">{data.net.format()}</p>
            </div>
          </div>

          {data.transactions.length === 0 ? (
            <p className="text-sm text-white/40">{t("modals.monthDetail.empty")}</p>
          ) : (
            <ul className="space-y-3">
              {data.transactions.map((tx) => {
                const label = tx.description || seedLabel(t, tx.categoryId, tx.categoryName);
                return (
                  <li key={tx.id} className="group flex items-center gap-3 text-sm">
                    <CategoryChip categoryName={tx.categoryName} color={tx.color} />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-1.5">
                        <span className="truncate font-medium">{label}</span>
                        {tx.installmentLabel && (
                          <span className="shrink-0 rounded-full bg-white/10 px-1.5 py-0.5 text-[10px] text-white/70">
                            {tx.installmentLabel}
                          </span>
                        )}
                      </span>
                      <span className="block text-xs text-white/50">
                        {tx.date} · {tx.cardName}
                      </span>
                    </span>
                    <span
                      className={`shrink-0 tabular-nums ${tx.type === "income" ? "text-mint" : ""}`}
                    >
                      {tx.type === "income" ? "+" : "−"}
                      {tx.amount.format()}
                    </span>
                    {!tx.installmentLabel && (
                      <RowActions
                        label={label}
                        onEdit={() => openEdit({ type: "transaction", transaction: tx })}
                        onDelete={() => openDelete({ type: "transaction", id: tx.id, label })}
                      />
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </>
      )}
    </Modal>
  );
}
