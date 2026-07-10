import { useUiStore } from "../../../state/uiStore";
import { useSavingsEntries } from "../../hooks/useDashboardData";
import { Button } from "../shared/Button";
import { GlassCard } from "../shared/GlassCard";

export function SavingsSection() {
  const { data: entries = [] } = useSavingsEntries();
  const openModal = useUiStore((s) => s.openModal);
  const newestFirst = [...entries].reverse();

  return (
    <GlassCard
      title="Savings"
      className="h-full"
      action={
        <Button variant="ghost" className="px-2 py-1" onClick={() => openModal("logSavings")}>
          + Log movement
        </Button>
      }
    >
      {newestFirst.length === 0 ? (
        <p className="text-sm text-white/40">
          Log a deposit or the interest your account produced to track growth and runway.
        </p>
      ) : (
        <ul className="space-y-3">
          {newestFirst.map((e) => (
            <li key={e.id} className="flex items-center justify-between gap-3 text-sm">
              <span className="min-w-0">
                <span className="flex items-center gap-1.5">
                  <span className="font-medium tabular-nums">{e.date}</span>
                  <span
                    className={`rounded-full px-1.5 py-0.5 text-[10px] ${
                      e.kind === "returns" ? "bg-mint/15 text-mint" : "bg-white/10 text-white/70"
                    }`}
                  >
                    {e.kind}
                  </span>
                </span>
                {e.note && <span className="block truncate text-xs text-white/50">{e.note}</span>}
              </span>
              <span className={`tabular-nums ${e.kind === "returns" ? "text-mint" : ""}`}>
                +{e.amount.format()}
              </span>
            </li>
          ))}
        </ul>
      )}
    </GlassCard>
  );
}
