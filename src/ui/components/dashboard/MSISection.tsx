import { useUiStore } from "../../../state/uiStore";
import { useMsiPlans } from "../../hooks/useDashboardData";
import { chipClassFor } from "../../utils/chips";
import { Button } from "../shared/Button";
import { GlassCard } from "../shared/GlassCard";
import { RowActions } from "../shared/RowActions";

export function MSISection() {
  const { data: plans = [] } = useMsiPlans();
  const openModal = useUiStore((s) => s.openModal);
  const openEdit = useUiStore((s) => s.openEdit);
  const openDelete = useUiStore((s) => s.openDelete);

  return (
    <GlassCard
      title="MSI / MCI plans"
      className="h-full"
      action={
        <Button variant="ghost" className="px-2 py-1" onClick={() => openModal("registerMsi")}>
          + New plan
        </Button>
      }
    >
      {plans.length === 0 ? (
        <p className="text-sm text-white/40">
          Register an installment purchase and every monthly charge is logged for you.
        </p>
      ) : (
        <ul className="space-y-3">
          {plans.map((p) => (
            <li key={p.id} className="group flex items-center gap-3 text-sm">
              <span
                className={`flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-bold ${chipClassFor(p.color, p.id)}`}
              >
                {p.months}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-medium">{p.description}</span>
                <span className="block text-xs text-white/50">
                  {p.months} months · {p.withInterest ? "with interest" : "interest-free"} · from{" "}
                  {p.startDate}
                </span>
              </span>
              <span className="text-right tabular-nums">
                <span className="block">{p.monthlyAmount.format()}</span>
                <span className="block text-xs text-white/50">of {p.totalAmount.format()}</span>
              </span>
              <RowActions
                label={p.description}
                onEdit={() => openEdit({ type: "msiPlan", plan: p })}
                onDelete={() => openDelete({ type: "msiPlan", plan: p })}
              />
            </li>
          ))}
        </ul>
      )}
    </GlassCard>
  );
}
