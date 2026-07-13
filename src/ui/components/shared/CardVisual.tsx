import type { CardType } from "../../../domain/entities/Card";
import { cardSurface } from "../../utils/chips";

const TYPE_LABEL: Record<CardType, string> = {
  credit: "Credit",
  debit: "Debit",
  cash: "Cash",
};

interface CardVisualProps {
  name: string;
  type: CardType;
  color?: string;
  last4?: string;
  cutDay?: number | string;
  paymentDueDay?: number | string;
  /** Width/aspect overrides from the caller. */
  className?: string;
}

/** A gradient card face tinted by the assigned color — used in the wallet grid and the live form preview. */
export function CardVisual({
  name,
  type,
  color,
  last4,
  cutDay,
  paymentDueDay,
  className = "",
}: CardVisualProps) {
  const trimmed = name.trim();
  const showDays = type === "credit" && (cutDay !== undefined || paymentDueDay !== undefined);

  return (
    <div
      className={`relative flex aspect-[16/10] flex-col justify-between overflow-hidden rounded-2xl p-3 shadow-lg shadow-black/30 ring-1 ring-inset ring-white/12 ${className}`}
      style={{ backgroundImage: cardSurface(color) }}
    >
      <div className="flex justify-end">
        <span className="text-[9px] font-semibold tracking-widest text-white/70 uppercase">
          {TYPE_LABEL[type]}
        </span>
      </div>
      <div className="min-w-0">
        <p className={`truncate text-sm font-semibold ${trimmed ? "text-white" : "text-white/50"}`}>
          {trimmed || "Card name"}
        </p>
        <p className="truncate text-[11px] tabular-nums text-white/70">
          {last4 ? `·${last4}` : ""}
          {last4 && showDays ? " · " : ""}
          {showDays ? `cuts ${cutDay || "—"} · due ${paymentDueDay || "—"}` : ""}
        </p>
      </div>
    </div>
  );
}
