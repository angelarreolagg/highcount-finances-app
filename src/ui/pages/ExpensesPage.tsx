import { useState } from "react";
import { Shapes } from "lucide-react";
import { Trans, useTranslation } from "react-i18next";
import { monthName } from "../../shared/utils/months";
import type { ChipColor } from "../../domain/entities/ChipColor";
import { GlassCard } from "../components/shared/GlassCard";
import { PageShell } from "../components/layout/PageShell";
import { RouteHero } from "../components/layout/RouteHero";
import { GlassSelect } from "../components/shared/GlassSelect";
import { IconSelect } from "../components/shared/IconSelect";
import { CategoryChip } from "../components/shared/CategoryChip";
import { useCards, useCategories, useExpensesFeed } from "../hooks/useDashboardData";
import { useUiStore } from "../../state/uiStore";
import { RowActions } from "../components/shared/RowActions";
import { seedLabel, cardTypeLabel, chipColorLabel } from "../i18n/labels";
import { categoryIcon } from "../utils/categoryIcons";
import { cardSurface, CHIP_COLOR_OPTIONS } from "../utils/chips";
import { Money } from "../../domain/value-objects/Money";

type TypeFilter = "expense" | "income" | "all";
type ColorFilter = "all" | ChipColor;

export function ExpensesPage() {
  const { t, i18n } = useTranslation();
  const { data: feed, isLoading } = useExpensesFeed();
  const { data: categories = [] } = useCategories();
  const { data: cards = [] } = useCards();
  const openEdit = useUiStore((s) => s.openEdit);
  const openDelete = useUiStore((s) => s.openDelete);

  const [typeFilter, setTypeFilter] = useState<TypeFilter>("expense");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [cardFilter, setCardFilter] = useState("all");
  const [monthFilter, setMonthFilter] = useState("all");
  const [colorFilter, setColorFilter] = useState<ColorFilter>("all");

  const filtered = (feed?.transactions ?? []).filter((tx) => {
    if (typeFilter !== "all" && tx.type !== typeFilter) return false;
    if (categoryFilter !== "all" && tx.categoryId !== categoryFilter) return false;
    if (cardFilter !== "all" && tx.cardId !== cardFilter) return false;
    if (monthFilter !== "all" && !tx.date.startsWith(monthFilter)) return false;
    // Assigned-color-only: auto-hued rows (no picked color) only match "All colors".
    if (colorFilter !== "all" && tx.color !== colorFilter) return false;
    return true;
  });

  const filteredTotal = filtered.reduce(
    (acc, tx) => (tx.type === "income" ? acc.add(tx.amount) : acc.subtract(tx.amount)),
    Money.zero(),
  );

  return (
    <PageShell
      hero={
        feed ? (
          <RouteHero
            label={t("expenses.heroLabel", {
              month: monthName(feed.monthIndex, i18n.language),
              year: feed.year,
            })}
            amount={feed.totalExpenses}
            roll="down"
          >
            <p className="mt-2 text-sm tabular-nums text-white/70">
              <Trans
                i18nKey="expenses.breakdown"
                values={{ income: feed.totalIncome.format(), net: feed.net.format() }}
                components={{ inc: <span className="text-mint" /> }}
              />
            </p>
          </RouteHero>
        ) : (
          <div className="flex h-56 items-end justify-center pb-10">
            <p className="text-sm text-white/60">{t("common.loading")}</p>
          </div>
        )
      }
    >
      {feed && (
        <div className="space-y-4 pt-2">
          <div className="grid grid-cols-2 gap-2 md:grid-cols-3 xl:grid-cols-5">
            <GlassSelect
              value={typeFilter}
              onChange={(v) => setTypeFilter(v as TypeFilter)}
              aria-label={t("expenses.filterType")}
              placeholder={t("expenses.type")}
              options={[
                { value: "expense", label: t("expenses.typeExpenses") },
                { value: "income", label: t("expenses.typeIncome") },
                { value: "all", label: t("expenses.allTypes") },
              ]}
            />
            <IconSelect
              value={categoryFilter}
              onChange={setCategoryFilter}
              aria-label={t("expenses.filterCategory")}
              placeholder={t("expenses.category")}
              options={[
                {
                  value: "all",
                  label: t("expenses.allCategories"),
                  icon: <Shapes size={16} strokeWidth={1.8} />,
                },
                ...categories.map((c) => ({
                  value: c.id,
                  label: seedLabel(t, c.id, c.name),
                  icon: categoryIcon(c.name),
                })),
              ]}
            />
            <GlassSelect
              value={cardFilter}
              onChange={setCardFilter}
              aria-label={t("expenses.filterCard")}
              placeholder={t("expenses.card")}
              options={[
                { value: "all", label: t("expenses.allCards") },
                ...cards.map((c) => ({
                  value: c.id,
                  label: seedLabel(t, c.id, c.name),
                  sublabel: cardTypeLabel(t, c.type),
                  leading: (
                    <span
                      className="block size-4 rounded"
                      style={{ backgroundImage: cardSurface(c.color) }}
                    />
                  ),
                })),
              ]}
            />
            <GlassSelect
              value={monthFilter}
              onChange={setMonthFilter}
              aria-label={t("expenses.filterMonth")}
              placeholder={t("expenses.month")}
              options={[
                { value: "all", label: t("expenses.allOpenMonths") },
                ...feed.months.map((m) => {
                  const prefix = `${m.year}-${String(m.monthIndex + 1).padStart(2, "0")}`;
                  return {
                    value: prefix,
                    label: t(m.isCurrent ? "expenses.monthCurrent" : "expenses.monthOpen", {
                      month: monthName(m.monthIndex, i18n.language),
                      year: m.year,
                    }),
                  };
                }),
              ]}
            />
            <GlassSelect
              value={colorFilter}
              onChange={(v) => setColorFilter(v as ColorFilter)}
              aria-label={t("expenses.filterColor")}
              placeholder={t("expenses.color")}
              options={[
                { value: "all", label: t("expenses.allColors") },
                ...CHIP_COLOR_OPTIONS.map(({ color, className }) => ({
                  value: color,
                  label: chipColorLabel(t, color),
                  leading: <span className={`block size-4 rounded-full ${className}`} />,
                })),
              ]}
            />
          </div>

          <GlassCard
            title={t("expenses.count", { count: filtered.length })}
            action={
              <span className="text-sm tabular-nums text-white/60">{filteredTotal.format()}</span>
            }
          >
            {isLoading && <p className="text-sm text-white/50">{t("common.loading")}</p>}
            {filtered.length === 0 ? (
              <p className="text-sm text-white/40">{t("expenses.empty")}</p>
            ) : (
              <ul className="space-y-3">
                {filtered.map((tx) => {
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
                          {tx.date} · {seedLabel(t, tx.categoryId, tx.categoryName)} · {tx.cardName}
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
          </GlassCard>
        </div>
      )}
    </PageShell>
  );
}
