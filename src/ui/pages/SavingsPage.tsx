import { Trans, useTranslation } from "react-i18next";
import { PageShell } from "../components/layout/PageShell";
import { RouteHero } from "../components/layout/RouteHero";
import { BalanceLineChart, ReturnsBarChart } from "../components/savings/SavingsCharts";
import { Button } from "../components/shared/Button";
import { GlassCard } from "../components/shared/GlassCard";
import { useCards, useSavingsOverview } from "../hooks/useDashboardData";
import { useUiStore } from "../../state/uiStore";
import { RowActions } from "../components/shared/RowActions";
import { savingsKindLabel } from "../i18n/labels";
import { chipClassFor } from "../utils/chips";
import { savingsKindIcon } from "../utils/savingsIcons";

export function SavingsPage() {
  const { t } = useTranslation();
  const { data, isLoading } = useSavingsOverview();
  const { data: cards = [] } = useCards();
  const openModal = useUiStore((s) => s.openModal);
  const openEdit = useUiStore((s) => s.openEdit);
  const openDelete = useUiStore((s) => s.openDelete);

  const cardNameById = new Map(cards.map((c) => [c.id, c.name]));
  const summary = data?.summary ?? null;
  const timeline = summary?.timeline ?? [];
  const newestFirst = [...timeline].reverse();
  const hasReturns = timeline.some((p) => p.kind === "returns");

  return (
    <PageShell
      hero={
        summary ? (
          <RouteHero label={t("savings.heroLabel")} amount={summary.currentBalance} roll="up">
            <p className="mt-2 text-sm tabular-nums text-white/70">
              <Trans
                i18nKey="savings.breakdown"
                values={{
                  saved: summary.totalDeposits.format(),
                  returns: summary.totalReturns.format(),
                }}
                components={{ ret: <span className="text-mint" /> }}
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
      {summary && (
        <div className="space-y-4 pt-2">
          {!data?.hasEntries ? (
            <GlassCard className="items-center py-8 text-center">
              <h2 className="text-lg font-semibold">{t("savings.emptyTitle")}</h2>
              <p className="mx-auto mt-2 mb-5 max-w-md text-sm text-white/60">
                {t("savings.emptyBody")}
              </p>
              <Button variant="primary" onClick={() => openModal("logSavings")}>
                {t("savings.logMovement")}
              </Button>
            </GlassCard>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <GlassCard title={t("savings.balanceOverTime")}>
                  <BalanceLineChart timeline={timeline} />
                </GlassCard>

                <GlassCard title={t("savings.returnsPerEntry")}>
                  {hasReturns ? (
                    <ReturnsBarChart timeline={timeline} />
                  ) : (
                    <p className="text-sm text-white/40">{t("savings.noReturns")}</p>
                  )}
                </GlassCard>
              </div>

              <GlassCard
                title={t("savings.history")}
                action={
                  <Button variant="ghost" className="px-2 py-1" onClick={() => openModal("logSavings")}>
                    {t("savings.addMovement")}
                  </Button>
                }
              >
                <ul className="space-y-3">
                  {newestFirst.map((p) => (
                    <li key={p.id} className="group flex items-center gap-3 text-sm">
                      <span
                        className={`flex size-9 shrink-0 items-center justify-center rounded-full ${chipClassFor(p.color, p.id)}`}
                        aria-hidden="true"
                      >
                        {savingsKindIcon(p.kind, { className: "text-white" })}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-1.5">
                          <span className="font-medium tabular-nums">{p.date}</span>
                          <span
                            className={`rounded-full px-1.5 py-0.5 text-[10px] ${
                              p.kind === "returns"
                                ? "bg-mint/15 text-mint"
                                : "bg-white/10 text-white/70"
                            }`}
                          >
                            {savingsKindLabel(t, p.kind)}
                          </span>
                          {p.cardId && cardNameById.has(p.cardId) && (
                            <span className="truncate text-xs text-white/50">
                              · {cardNameById.get(p.cardId)}
                            </span>
                          )}
                        </span>
                        {p.note && (
                          <span className="block truncate text-xs text-white/50">{p.note}</span>
                        )}
                      </span>
                      <span className="shrink-0 text-right">
                        <span
                          className={`block tabular-nums ${p.kind === "returns" ? "text-mint" : ""}`}
                        >
                          +{p.amount.format()}
                        </span>
                        <span className="block text-xs tabular-nums text-white/50">
                          {t("savings.balanceAfter", { amount: p.balanceAfter.format() })}
                        </span>
                      </span>
                      <RowActions
                        label={t("savings.rowLabel", {
                          kind: savingsKindLabel(t, p.kind),
                          date: p.date,
                        })}
                        onEdit={() => openEdit({ type: "savings", entry: p })}
                        onDelete={() =>
                          openDelete({
                            type: "savings",
                            id: p.id,
                            label: t("savings.rowLabel", {
                              kind: savingsKindLabel(t, p.kind),
                              date: p.date,
                            }),
                          })
                        }
                      />
                    </li>
                  ))}
                </ul>
              </GlassCard>
            </>
          )}
          {isLoading && <p className="text-sm text-white/50">{t("common.loading")}</p>}
        </div>
      )}
    </PageShell>
  );
}
