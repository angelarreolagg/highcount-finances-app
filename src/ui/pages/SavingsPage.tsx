import { PageShell } from "../components/layout/PageShell";
import { RouteHero } from "../components/layout/RouteHero";
import { BalanceLineChart, ReturnsBarChart } from "../components/savings/SavingsCharts";
import { Button } from "../components/shared/Button";
import { GlassCard } from "../components/shared/GlassCard";
import { useCards, useSavingsOverview } from "../hooks/useDashboardData";
import { useUiStore } from "../../state/uiStore";
import { RowActions } from "../components/shared/RowActions";
import { chipClassFor } from "../utils/chips";

export function SavingsPage() {
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
          <RouteHero label="Total savings · net" amount={summary.currentBalance} roll="up">
            <p className="mt-2 text-sm tabular-nums text-white/70">
              Total saved {summary.totalDeposits.format()} ·{" "}
              <span className="text-mint">+{summary.totalReturns.format()} returns</span>
            </p>
          </RouteHero>
        ) : (
          <div className="flex h-56 items-end justify-center pb-10">
            <p className="text-sm text-white/60">Loading…</p>
          </div>
        )
      }
    >
      {summary && (
        <div className="space-y-4 pt-2">
          {!data?.hasEntries ? (
            <GlassCard className="text-center">
              <p className="mb-3 text-sm text-white/60">
                No savings movements yet — log your first deposit to start tracking growth.
              </p>
              <Button variant="primary" onClick={() => openModal("logSavings")}>
                Log a movement
              </Button>
            </GlassCard>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <GlassCard title="Balance over time">
                  <BalanceLineChart timeline={timeline} />
                </GlassCard>

                <GlassCard title="Returns per entry">
                  {hasReturns ? (
                    <ReturnsBarChart timeline={timeline} />
                  ) : (
                    <p className="text-sm text-white/40">
                      No returns logged yet — when your account pays interest, log it as a
                      "returns" movement and it will chart here.
                    </p>
                  )}
                </GlassCard>
              </div>

              <GlassCard
                title="History"
                action={
                  <Button variant="ghost" className="px-2 py-1" onClick={() => openModal("logSavings")}>
                    + Log movement
                  </Button>
                }
              >
                <ul className="space-y-3">
                  {newestFirst.map((p) => (
                    <li key={p.id} className="group flex items-center justify-between gap-3 text-sm">
                      <span className="min-w-0">
                        <span className="flex items-center gap-1.5">
                          {p.color && (
                            <span
                              className={`size-2.5 shrink-0 rounded-full ${chipClassFor(p.color, p.id)}`}
                              aria-hidden="true"
                            />
                          )}
                          <span className="font-medium tabular-nums">{p.date}</span>
                          <span
                            className={`rounded-full px-1.5 py-0.5 text-[10px] ${
                              p.kind === "returns"
                                ? "bg-mint/15 text-mint"
                                : "bg-white/10 text-white/70"
                            }`}
                          >
                            {p.kind}
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
                      <span className="text-right">
                        <span
                          className={`block tabular-nums ${p.kind === "returns" ? "text-mint" : ""}`}
                        >
                          +{p.amount.format()}
                        </span>
                        <span className="block text-xs tabular-nums text-white/50">
                          balance {p.balanceAfter.format()}
                        </span>
                      </span>
                      <RowActions
                        label={`${p.kind} on ${p.date}`}
                        onEdit={() => openEdit({ type: "savings", entry: p })}
                        onDelete={() =>
                          openDelete({ type: "savings", id: p.id, label: `${p.kind} · ${p.date}` })
                        }
                      />
                    </li>
                  ))}
                </ul>
              </GlassCard>
            </>
          )}
          {isLoading && <p className="text-sm text-white/50">Loading…</p>}
        </div>
      )}
    </PageShell>
  );
}
