import { motion } from "motion/react";
import { Link, useParams } from "react-router";
import { MONTH_NAMES } from "../../shared/utils/months";
import { GlassCard } from "../components/shared/GlassCard";
import { riseIn } from "../components/shared/motionPresets";
import { ArrowLeftIcon } from "../components/shared/icons";
import { useAnnualSummary, useCards } from "../hooks/useDashboardData";
import { cardChipStyle, chipClass } from "../utils/chips";
import { splitFormattedMoney } from "../utils/money";

export function AnnualSummaryPage() {
  const params = useParams();
  const year = Number(params.year);
  const { data, isLoading } = useAnnualSummary(year);
  const { data: cards = [] } = useCards();
  const cardColors = new Map(cards.map((c) => [c.id, c.color]));

  if (!Number.isInteger(year)) {
    return (
      <main className="mx-auto max-w-md p-4">
        <p className="text-sm text-white/60">That year doesn't look right.</p>
        <Link to="/" className="text-sm text-peri underline">
          Back to dashboard
        </Link>
      </main>
    );
  }

  const summary = data?.summary ?? null;
  const spent = summary ? splitFormattedMoney(summary.totalExpenses) : null;

  return (
    <motion.main
      initial="hidden"
      animate="visible"
      variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.07 } } }}
      className="mx-auto max-w-md px-4 pt-5 pb-16 md:max-w-3xl xl:max-w-5xl"
    >
      <motion.header variants={riseIn} className="mb-6">
        <div className="flex items-center justify-between">
          <Link
            to="/"
            aria-label="Back to dashboard"
            className="flex size-9 items-center justify-center rounded-full bg-white/10 text-white/80 hover:bg-white/20"
          >
            <ArrowLeftIcon size={18} />
          </Link>
          <nav className="flex items-center gap-1 rounded-full border border-white/10 bg-white/5 p-1 text-sm">
            <Link to={`/summary/${year - 1}`} className="rounded-full px-3 py-1 text-white/60 hover:bg-white/10">
              {year - 1}
            </Link>
            <span className="rounded-full bg-white/15 px-3 py-1 font-medium">{year}</span>
            <Link to={`/summary/${year + 1}`} className="rounded-full px-3 py-1 text-white/60 hover:bg-white/10">
              {year + 1}
            </Link>
          </nav>
        </div>

        <div className="mt-8">
          <p className="text-sm text-white/50">Year in Review · spent in {year}</p>
          {spent ? (
            <p className="mt-1 font-bold tabular-nums">
              <span className="text-5xl">{spent.main}</span>
              {spent.cents !== null && <span className="text-3xl text-white/70">.{spent.cents}</span>}
            </p>
          ) : (
            <p className="mt-1 text-5xl font-bold text-white/30">—</p>
          )}
          {summary && (
            <p className="mt-2 text-sm tabular-nums text-white/60">
              <span className="text-mint">+{summary.totalIncome.format()}</span> income · net{" "}
              {summary.net.format()} · {summary.transactionCount} transactions
            </p>
          )}
        </div>
      </motion.header>

      {isLoading && <p className="text-sm text-white/50">Loading…</p>}

      {data && !data.unlocked && (
        <GlassCard className="text-center">
          <p className="text-sm text-white/60">
            {year} hasn't started yet — its Year in Review will be here when it does.
          </p>
        </GlassCard>
      )}

      {summary && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <GlassCard title="Highlights" className="md:col-span-2">
            <ul className="space-y-3 text-sm">
              <li className="flex items-center justify-between gap-3">
                <span className="text-white/60">Largest expense</span>
                {summary.largestExpense ? (
                  <span className="text-right">
                    <span className="block tabular-nums">
                      −{summary.largestExpense.amount.format()}
                    </span>
                    <span className="block text-xs text-white/50">
                      {summary.largestExpense.description || "No description"} ·{" "}
                      {summary.largestExpense.date}
                    </span>
                  </span>
                ) : (
                  <span className="text-white/40">No expenses</span>
                )}
              </li>
              <li className="flex items-center justify-between">
                <span className="text-white/60">Savings change</span>
                {summary.savingsChange ? (
                  <span
                    className={`tabular-nums ${summary.savingsChange.isNegative() ? "" : "text-mint"}`}
                  >
                    {summary.savingsChange.isNegative() ? "" : "+"}
                    {summary.savingsChange.format()}
                  </span>
                ) : (
                  <span className="text-white/40">No snapshots</span>
                )}
              </li>
              {summary.savingsStart && summary.savingsEnd && (
                <li className="flex items-center justify-between text-xs text-white/50">
                  <span>{summary.savingsStart.format()} → </span>
                  <span className="tabular-nums">{summary.savingsEnd.format()}</span>
                </li>
              )}
            </ul>
          </GlassCard>

          <GlassCard title="By category" className="h-full">
            {summary.expensesByCategory.length === 0 ? (
              <p className="text-sm text-white/40">No expenses recorded.</p>
            ) : (
              <ul className="space-y-3 text-sm">
                {summary.expensesByCategory.map((c) => (
                  <li key={c.categoryId} className="flex items-center gap-3">
                    <span
                      className={`flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${chipClass(c.categoryName)}`}
                    >
                      {c.categoryName[0]}
                    </span>
                    <span className="flex-1 truncate">{c.categoryName}</span>
                    <span className="tabular-nums">−{c.total.format()}</span>
                  </li>
                ))}
              </ul>
            )}
          </GlassCard>

          <GlassCard title="By card / account" className="h-full">
            {summary.expensesByCard.length === 0 ? (
              <p className="text-sm text-white/40">No expenses recorded.</p>
            ) : (
              <ul className="space-y-3 text-sm">
                {summary.expensesByCard.map((c) => (
                  <li key={c.cardId} className="flex items-center gap-3">
                    <span
                      className={`flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${cardChipStyle(cardColors.get(c.cardId)) ? "" : chipClass(c.cardId)}`}
                      style={cardChipStyle(cardColors.get(c.cardId))}
                    >
                      {c.cardName[0]}
                    </span>
                    <span className="flex-1 truncate">{c.cardName}</span>
                    <span className="tabular-nums">−{c.total.format()}</span>
                  </li>
                ))}
              </ul>
            )}
          </GlassCard>

          <GlassCard title="Month by month" className="md:col-span-2">
            <ul className="space-y-2 text-sm">
              {summary.byMonth.map((m) => (
                <li key={m.monthIndex} className="flex items-center justify-between">
                  <span className="w-10 text-white/60">{MONTH_NAMES[m.monthIndex].slice(0, 3)}</span>
                  <span className="tabular-nums text-mint">
                    {m.income.isZero() ? "" : `+${m.income.format()}`}
                  </span>
                  <span className="tabular-nums">
                    {m.expenses.isZero() ? (
                      <span className="text-white/25">—</span>
                    ) : (
                      `−${m.expenses.format()}`
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </GlassCard>
        </div>
      )}
    </motion.main>
  );
}
