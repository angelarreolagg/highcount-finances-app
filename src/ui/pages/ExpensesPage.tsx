import { useState } from "react";
import { MONTH_NAMES } from "../../shared/utils/months";
import { GlassCard } from "../components/shared/GlassCard";
import { PageShell } from "../components/layout/PageShell";
import { RouteHero } from "../components/layout/RouteHero";
import { Select } from "../components/shared/Select";
import { useCards, useCategories, useExpensesFeed } from "../hooks/useDashboardData";
import { useUiStore } from "../../state/uiStore";
import { RowActions } from "../components/shared/RowActions";
import { chipClassFor } from "../utils/chips";
import { Money } from "../../domain/value-objects/Money";

type TypeFilter = "expense" | "income" | "all";

export function ExpensesPage() {
  const { data: feed, isLoading } = useExpensesFeed();
  const { data: categories = [] } = useCategories();
  const { data: cards = [] } = useCards();
  const openEdit = useUiStore((s) => s.openEdit);
  const openDelete = useUiStore((s) => s.openDelete);

  const [typeFilter, setTypeFilter] = useState<TypeFilter>("expense");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [cardFilter, setCardFilter] = useState("all");
  const [monthFilter, setMonthFilter] = useState("all");

  const filtered = (feed?.transactions ?? []).filter((t) => {
    if (typeFilter !== "all" && t.type !== typeFilter) return false;
    if (categoryFilter !== "all" && t.categoryId !== categoryFilter) return false;
    if (cardFilter !== "all" && t.cardId !== cardFilter) return false;
    if (monthFilter !== "all" && !t.date.startsWith(monthFilter)) return false;
    return true;
  });

  const filteredTotal = filtered.reduce(
    (acc, t) => (t.type === "income" ? acc.add(t.amount) : acc.subtract(t.amount)),
    Money.zero(),
  );

  return (
    <PageShell
      hero={
        feed ? (
          <RouteHero
            label={`Spent · ${MONTH_NAMES[feed.monthIndex]} ${feed.year}`}
            amount={feed.totalExpenses}
            roll="down"
          >
            <p className="mt-2 text-sm tabular-nums text-white/70">
              <span className="text-mint">+{feed.totalIncome.format()}</span> income · net{" "}
              {feed.net.format()}
            </p>
          </RouteHero>
        ) : (
          <div className="flex h-56 items-end justify-center pb-10">
            <p className="text-sm text-white/60">Loading…</p>
          </div>
        )
      }
    >
      {feed && (
        <div className="space-y-4 pt-2">
          <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
            <Select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as TypeFilter)}
              aria-label="Filter by type"
            >
              <option value="expense">Expenses</option>
              <option value="income">Income</option>
              <option value="all">All types</option>
            </Select>
            <Select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              aria-label="Filter by category"
            >
              <option value="all">All categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
            <Select
              value={cardFilter}
              onChange={(e) => setCardFilter(e.target.value)}
              aria-label="Filter by card"
            >
              <option value="all">All cards</option>
              {cards.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
            <Select
              value={monthFilter}
              onChange={(e) => setMonthFilter(e.target.value)}
              aria-label="Filter by month"
            >
              <option value="all">All open months</option>
              {feed.months.map((m) => {
                const prefix = `${m.year}-${String(m.monthIndex + 1).padStart(2, "0")}`;
                return (
                  <option key={prefix} value={prefix}>
                    {MONTH_NAMES[m.monthIndex]} {m.year}
                    {m.isCurrent ? " (current)" : " (still open)"}
                  </option>
                );
              })}
            </Select>
          </div>

          <GlassCard
            title={`${filtered.length} transaction${filtered.length === 1 ? "" : "s"}`}
            action={
              <span className="text-sm tabular-nums text-white/60">{filteredTotal.format()}</span>
            }
          >
            {isLoading && <p className="text-sm text-white/50">Loading…</p>}
            {filtered.length === 0 ? (
              <p className="text-sm text-white/40">
                Nothing matches these filters — add an expense or loosen a filter.
              </p>
            ) : (
              <ul className="space-y-3">
                {filtered.map((t) => (
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
                        {t.date} · {t.categoryName} · {t.cardName}
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
          </GlassCard>
        </div>
      )}
    </PageShell>
  );
}
