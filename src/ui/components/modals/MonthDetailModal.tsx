import { MONTH_NAMES } from "../../../shared/utils/months";
import { useUiStore } from "../../../state/uiStore";
import { useMonthDetail } from "../../hooks/useDashboardData";

export function MonthDetailModal() {
  const detailMonth = useUiStore((s) => s.detailMonth);
  const closeMonthDetail = useUiStore((s) => s.closeMonthDetail);
  const { data, isLoading } = useMonthDetail(
    detailMonth?.year ?? null,
    detailMonth?.monthIndex ?? null,
  );

  if (!detailMonth) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white border p-4 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between mb-3">
          <h2 className="text-lg font-semibold">
            {MONTH_NAMES[detailMonth.monthIndex]} {detailMonth.year}
          </h2>
          <button type="button" onClick={closeMonthDetail} className="border px-2">
            Close
          </button>
        </div>
        {isLoading && <p className="text-sm">Loading…</p>}
        {data && (
          <>
            <ul className="text-sm mb-3">
              <li>Total income: {data.totalIncome.format()}</li>
              <li>Total expenses: {data.totalExpenses.format()}</li>
              <li>Net: {data.net.format()}</li>
            </ul>
            {data.transactions.length === 0 ? (
              <p className="text-sm">No transactions this month.</p>
            ) : (
              <table className="text-sm w-full border-collapse">
                <thead>
                  <tr className="text-left border-b">
                    <th className="pr-2">Date</th>
                    <th className="pr-2">Description</th>
                    <th className="pr-2">Category</th>
                    <th className="pr-2">Account</th>
                    <th className="text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {data.transactions.map((t) => (
                    <tr key={t.id} className="border-b">
                      <td className="pr-2">{t.date}</td>
                      <td className="pr-2">
                        {t.description || "—"}
                        {t.installmentLabel && ` [${t.installmentLabel}]`}
                      </td>
                      <td className="pr-2">{t.categoryName}</td>
                      <td className="pr-2">{t.cardName}</td>
                      <td className={`text-right ${t.type === "income" ? "text-green-700" : ""}`}>
                        {t.type === "income" ? "+" : "−"}
                        {t.amount.format()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </>
        )}
      </div>
    </div>
  );
}
