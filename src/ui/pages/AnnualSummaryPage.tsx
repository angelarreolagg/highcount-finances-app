import { Trans, useTranslation } from "react-i18next";
import { Link, useParams } from "react-router";
import { monthName } from "../../shared/utils/months";
import { PageShell } from "../components/layout/PageShell";
import { GlassCard } from "../components/shared/GlassCard";
import { CardVisual } from "../components/shared/CardVisual";
import { ArrowLeftIcon } from "../components/shared/icons";
import { useAnnualSummary, useCards } from "../hooks/useDashboardData";
import { seedLabel } from "../i18n/labels";
import { categoryIcon } from "../utils/categoryIcons";
import { splitFormattedMoney } from "../utils/money";

export function AnnualSummaryPage() {
  const { t, i18n } = useTranslation();
  const params = useParams();
  const year = Number(params.year);
  const { data, isLoading } = useAnnualSummary(year);
  const { data: cards = [] } = useCards();
  const cardById = new Map(cards.map((c) => [c.id, c]));

  if (!Number.isInteger(year)) {
    return (
      <main className="mx-auto max-w-md p-4">
        <p className="text-sm text-white/60">{t("summary.badYear")}</p>
        <Link to="/" className="text-sm text-peri underline">
          {t("common.backToDashboard")}
        </Link>
      </main>
    );
  }

  const summary = data?.summary ?? null;
  const spent = summary ? splitFormattedMoney(summary.totalExpenses) : null;

  return (
    <PageShell
      hero={
        <div className="pt-6 pb-4">
          <div className="flex items-center justify-between">
            <Link
              to="/"
              aria-label={t("common.backToDashboard")}
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
            <p className="text-sm text-white/50">{t("summary.heroLabel", { year })}</p>
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
                <Trans
                  i18nKey="summary.heroBreakdown"
                  count={summary.transactionCount}
                  values={{
                    income: summary.totalIncome.format(),
                    net: summary.net.format(),
                    count: summary.transactionCount,
                  }}
                  components={{ inc: <span className="text-mint" /> }}
                />
              </p>
            )}
          </div>
        </div>
      }
    >
      <div className="pt-2">
        {isLoading && <p className="text-sm text-white/50">{t("common.loading")}</p>}

        {data && !data.unlocked && (
          <GlassCard className="text-center">
            <p className="text-sm text-white/60">{t("summary.locked", { year })}</p>
          </GlassCard>
        )}

        {summary && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            <GlassCard title={t("summary.highlights")} className="md:col-span-2 xl:col-span-4">
              <ul className="space-y-3 text-sm">
                <li className="flex items-center justify-between gap-3">
                  <span className="text-white/60">{t("common.largestExpense")}</span>
                  {summary.largestExpense ? (
                    <span className="text-right">
                      <span className="block tabular-nums">
                        −{summary.largestExpense.amount.format()}
                      </span>
                      <span className="block text-xs text-white/50">
                        {summary.largestExpense.description || t("summary.noDescription")} ·{" "}
                        {summary.largestExpense.date}
                      </span>
                    </span>
                  ) : (
                    <span className="text-white/40">{t("summary.noExpenses")}</span>
                  )}
                </li>
                <li className="flex items-center justify-between">
                  <span className="text-white/60">{t("summary.savingsChange")}</span>
                  {summary.savingsChange ? (
                    <span
                      className={`tabular-nums ${summary.savingsChange.isNegative() ? "" : "text-mint"}`}
                    >
                      {summary.savingsChange.isNegative() ? "" : "+"}
                      {summary.savingsChange.format()}
                    </span>
                  ) : (
                    <span className="text-white/40">{t("summary.noSnapshots")}</span>
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

            <GlassCard title={t("summary.byCategory")} className="h-full xl:col-span-2 xl:row-span-2">
              {summary.expensesByCategory.length === 0 ? (
                <p className="text-sm text-white/40">{t("summary.noExpensesRecorded")}</p>
              ) : (
                <ul className="space-y-3 text-sm">
                  {summary.expensesByCategory.map((c) => (
                    <li key={c.categoryId} className="flex items-center gap-3">
                      <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-white/70">
                        {categoryIcon(c.categoryName, { size: 16 })}
                      </span>
                      <span className="min-w-0 flex-1 truncate">
                        {seedLabel(t, c.categoryId, c.categoryName)}
                      </span>
                      <span className="shrink-0 tabular-nums">−{c.total.format()}</span>
                    </li>
                  ))}
                </ul>
              )}
            </GlassCard>

            <GlassCard title={t("summary.byCard")} className="h-full xl:col-span-2">
              {summary.expensesByCard.length === 0 ? (
                <p className="text-sm text-white/40">{t("summary.noExpensesRecorded")}</p>
              ) : (
                <ul className="space-y-3 text-sm">
                  {summary.expensesByCard.map((c) => {
                    const card = cardById.get(c.cardId);
                    return (
                      <li key={c.cardId} className="flex items-center gap-3">
                        <CardVisual
                          name={seedLabel(t, c.cardId, card?.name ?? c.cardName)}
                          type={card?.type ?? "debit"}
                          color={card?.color}
                          last4={card?.last4}
                          className="w-28 shrink-0"
                        />
                        <span className="flex-1" />
                        <span className="shrink-0 tabular-nums">−{c.total.format()}</span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </GlassCard>

            <GlassCard title={t("summary.monthByMonth")} className="h-full xl:col-span-2">
              <ul className="space-y-2 text-sm">
                {summary.byMonth.map((m) => (
                  <li key={m.monthIndex} className="flex items-center justify-between">
                    <span className="w-10 shrink-0 text-white/60">
                      {monthName(m.monthIndex, i18n.language, { short: true })}
                    </span>
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
      </div>
    </PageShell>
  );
}
