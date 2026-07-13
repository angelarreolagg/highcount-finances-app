import { MONTH_NAMES } from "../../../shared/utils/months";
import { useUiStore } from "../../../state/uiStore";
import { useMonthDetail } from "../../hooks/useDashboardData";
import { chipClassFor } from "../../utils/chips";
import { Modal } from "../shared/Modal";
import { RowActions } from "../shared/RowActions";

export function MonthDetailModal() {
  const detailMonth = useUiStore((s) => s.detailMonth);
  const closeMonthDetail = useUiStore((s) => s.closeMonthDetail);
  const openEdit = useUiStore((s) => s.openEdit);
  const openDelete = useUiStore((s) => s.openDelete);
  const { data, isLoading } = useMonthDetail(
    detailMonth?.year ?? null,
    detailMonth?.monthIndex ?? null,
  );

  const title = detailMonth
    ? `${MONTH_NAMES[detailMonth.monthIndex]} ${detailMonth.year}`
    : "";

  return (
    <Modal open={detailMonth !== null} title={title} onClose={closeMonthDetail}>
      {isLoading && <p className="text-sm text-white/50">Loading…</p>}
      {data && (
        <>
          <div className="mb-4 grid grid-cols-3 gap-2 text-center">
            <div className="rounded-2xl bg-white/5 p-3">
              <p className="text-xs text-white/50">Income</p>
              <p className="mt-1 text-sm font-semibold tabular-nums text-mint">
                +{data.totalIncome.format()}
              </p>
            </div>
            <div className="rounded-2xl bg-white/5 p-3">
              <p className="text-xs text-white/50">Spent</p>
              <p className="mt-1 text-sm font-semibold tabular-nums">
                −{data.totalExpenses.format()}
              </p>
            </div>
            <div className="rounded-2xl bg-white/5 p-3">
              <p className="text-xs text-white/50">Net</p>
              <p className="mt-1 text-sm font-semibold tabular-nums">{data.net.format()}</p>
            </div>
          </div>

          {data.transactions.length === 0 ? (
            <p className="text-sm text-white/40">
              Nothing logged this month yet — add an expense or income to see it here.
            </p>
          ) : (
            <ul className="space-y-3">
              {data.transactions.map((t) => (
                <li key={t.id} className="group flex items-center gap-3 text-sm">
                  <span
                    className={`flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-bold ${chipClassFor(t.color, t.categoryName)}`}
                  >
                    {t.categoryName[0]}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-1.5">
                      <span className="truncate font-medium">
                        {t.description || t.categoryName}
                      </span>
                      {t.installmentLabel && (
                        <span className="shrink-0 rounded-full bg-white/10 px-1.5 py-0.5 text-[10px] text-white/70">
                          {t.installmentLabel}
                        </span>
                      )}
                    </span>
                    <span className="block text-xs text-white/50">
                      {t.date} · {t.cardName}
                    </span>
                  </span>
                  <span
                    className={`shrink-0 tabular-nums ${t.type === "income" ? "text-mint" : ""}`}
                  >
                    {t.type === "income" ? "+" : "−"}
                    {t.amount.format()}
                  </span>
                  {!t.installmentLabel && (
                    <RowActions
                      label={t.description || t.categoryName}
                      onEdit={() => openEdit({ type: "transaction", transaction: t })}
                      onDelete={() =>
                        openDelete({
                          type: "transaction",
                          id: t.id,
                          label: t.description || t.categoryName,
                        })
                      }
                    />
                  )}
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </Modal>
  );
}
