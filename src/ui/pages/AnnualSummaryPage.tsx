import { Link, useParams } from "react-router";
import { MONTH_NAMES } from "../../shared/utils/months";
import { useAnnualSummary } from "../hooks/useDashboardData";

export function AnnualSummaryPage() {
  const params = useParams();
  const year = Number(params.year);
  const { data, isLoading } = useAnnualSummary(year);

  if (!Number.isInteger(year)) {
    return (
      <main className="max-w-3xl mx-auto p-4">
        <p className="text-sm">Invalid year.</p>
        <Link to="/" className="underline text-sm">
          Back to dashboard
        </Link>
      </main>
    );
  }

  const summary = data?.summary ?? null;

  return (
    <main className="max-w-3xl mx-auto p-4">
      <header className="mb-4 flex justify-between items-baseline">
        <h1 className="text-2xl font-bold">Year in Review — {year}</h1>
        <Link to="/" className="underline text-sm">
          Back to dashboard
        </Link>
      </header>

      <nav className="mb-4 text-sm space-x-3">
        <Link to={`/summary/${year - 1}`} className="underline">
          ← {year - 1}
        </Link>
        <Link to={`/summary/${year + 1}`} className="underline">
          {year + 1} →
        </Link>
      </nav>

      {isLoading && <p className="text-sm">Loading…</p>}

      {data && !data.unlocked && (
        <p className="border p-3 text-sm">
          The {year} Year in Review unlocks on {data.unlocksOn}.
        </p>
      )}

      {summary && (
        <div className="space-y-4 text-sm">
          <section className="border p-3">
            <h2 className="font-semibold mb-2">Totals</h2>
            <ul>
              <li>Total income: {summary.totalIncome.format()}</li>
              <li>Total expenses: {summary.totalExpenses.format()}</li>
              <li>Net: {summary.net.format()}</li>
              <li>Transactions: {summary.transactionCount}</li>
              <li>
                Largest expense:{" "}
                {summary.largestExpense
                  ? `${summary.largestExpense.amount.format()} — ${summary.largestExpense.description} (${summary.largestExpense.date})`
                  : "—"}
              </li>
            </ul>
          </section>

          <section className="border p-3">
            <h2 className="font-semibold mb-2">Savings</h2>
            {summary.savingsChange ? (
              <ul>
                <li>Start of year: {summary.savingsStart?.format()}</li>
                <li>End of year: {summary.savingsEnd?.format()}</li>
                <li>Change: {summary.savingsChange.format()}</li>
              </ul>
            ) : (
              <p>No savings snapshots logged this year.</p>
            )}
          </section>

          <section className="border p-3">
            <h2 className="font-semibold mb-2">Expenses by category</h2>
            {summary.expensesByCategory.length === 0 ? (
              <p>No expenses recorded.</p>
            ) : (
              <ul>
                {summary.expensesByCategory.map((c) => (
                  <li key={c.categoryId}>
                    {c.categoryName}: {c.total.format()}
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="border p-3">
            <h2 className="font-semibold mb-2">Expenses by card / account</h2>
            {summary.expensesByCard.length === 0 ? (
              <p>No expenses recorded.</p>
            ) : (
              <ul>
                {summary.expensesByCard.map((c) => (
                  <li key={c.cardId}>
                    {c.cardName}: {c.total.format()}
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="border p-3">
            <h2 className="font-semibold mb-2">Month by month</h2>
            <table className="w-full border-collapse">
              <thead>
                <tr className="text-left border-b">
                  <th>Month</th>
                  <th className="text-right">Income</th>
                  <th className="text-right">Expenses</th>
                </tr>
              </thead>
              <tbody>
                {summary.byMonth.map((m) => (
                  <tr key={m.monthIndex} className="border-b">
                    <td>{MONTH_NAMES[m.monthIndex]}</td>
                    <td className="text-right">{m.income.format()}</td>
                    <td className="text-right">{m.expenses.format()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </div>
      )}
    </main>
  );
}
