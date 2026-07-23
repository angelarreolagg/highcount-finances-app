import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";
import type { Card } from "../../../domain/entities/Card";
import type { Money } from "../../../domain/value-objects/Money";
import { useClickOutside } from "../../hooks/useClickOutside";
import { cardTypeLabel } from "../../i18n/labels";
import { cardSurfaceStyle } from "../../utils/chips";
import { FloatingPanel } from "./FloatingPanel";
import { control } from "./formStyles";
import { ChevronDownIcon } from "./icons";

interface CardSelectProps {
  value: string;
  onChange: (value: string) => void;
  cards: Card[];
  placeholder: string;
  "aria-label"?: string;
  /** Available credit per card id (credit cards with a limit) — shown as a hint. */
  availableByCard?: Map<string, Money>;
}

/** A dense mini-tile for the picker grid — a true miniature of CardVisual: text sits
 *  directly over the gradient (no dark scrim overlay, which read as a hard seam). */
function MiniCardTile({ card, available, t }: { card: Card; available?: Money; t: TFunction }) {
  const showDays = card.type === "credit" && card.cutDay != null && card.paymentDueDay != null;
  return (
    <div
      className="flex aspect-[4/5] flex-col justify-between overflow-hidden rounded-xl p-1.5 ring-1 ring-inset ring-white/12"
      style={cardSurfaceStyle(card.color)}
    >
      <span className="self-end text-[8px] font-semibold tracking-widest text-white/70 uppercase">
        {cardTypeLabel(t, card.type)}
      </span>
      <span className="block">
        <span className="block truncate text-[11px] font-semibold text-white">{card.name}</span>
        {available ? (
          <span className={`block text-[9px] tabular-nums ${available.isNegative() ? "text-coral" : "text-white/80"}`}>
            {t("cardFace.left", { amount: available.format() })}
          </span>
        ) : (
          showDays && (
            <span className="block text-[9px] tabular-nums text-white/70">
              {card.cutDay} · {card.paymentDueDay}
            </span>
          )
        )}
      </span>
    </div>
  );
}

/** Card/account dropdown: a small gradient swatch in the trigger, a dense grid of mini
 *  tiles (color, name, type, cut/due) when open — a light index, not full wallet-card detail. */
export function CardSelect({
  value,
  onChange,
  cards,
  placeholder,
  "aria-label": ariaLabel,
  availableByCard,
}: CardSelectProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const selected = cards.find((c) => c.id === value);
  const selectedAvailable = selected ? availableByCard?.get(selected.id) : undefined;
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  useClickOutside(open, () => setOpen(false), [triggerRef, panelRef]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
        className={`${control} flex items-center gap-2.5 text-left`}
      >
        {selected ? (
          <>
            <span
              className="size-8 shrink-0 rounded-lg ring-1 ring-inset ring-white/15"
              style={cardSurfaceStyle(selected.color)}
            />
            <span className="min-w-0 flex-1">
              <span className="flex items-baseline justify-between gap-2">
                <span className="min-w-0 truncate text-sm">{selected.name}</span>
                {selected.type === "credit" &&
                  selected.cutDay != null &&
                  selected.paymentDueDay != null && (
                    <span className="shrink-0 text-[11px] tabular-nums text-white/50">
                      {t("cardFace.cutsDue", { cut: selected.cutDay, due: selected.paymentDueDay })}
                    </span>
                  )}
              </span>
              <span className="block text-[11px] text-white/50">
                {cardTypeLabel(t, selected.type)}
                {selectedAvailable && (
                  <>
                    {" · "}
                    <span className={selectedAvailable.isNegative() ? "text-coral" : "text-white/70"}>
                      {t("cardFace.left", { amount: selectedAvailable.format() })}
                    </span>
                  </>
                )}
              </span>
            </span>
          </>
        ) : (
          <span className="min-w-0 flex-1 truncate text-white/30">{placeholder}</span>
        )}
        <ChevronDownIcon
          size={16}
          className={`shrink-0 text-white/40 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      <FloatingPanel
        open={open}
        triggerRef={triggerRef}
        panelRef={panelRef}
        onClose={() => setOpen(false)}
        className="w-72 max-h-80 overflow-y-auto p-2 2xl:w-[26rem]"
      >
        <div role="listbox" className="grid grid-cols-4 gap-1.5 2xl:grid-cols-5">
          {cards.map((card) => {
            const active = card.id === value;
            return (
              <button
                key={card.id}
                type="button"
                role="option"
                aria-selected={active}
                aria-label={card.name}
                onClick={() => {
                  onChange(card.id);
                  setOpen(false);
                }}
                className={`rounded-xl transition-shadow ${active ? "ring-2 ring-peri" : ""}`}
              >
                <MiniCardTile card={card} available={availableByCard?.get(card.id)} t={t} />
              </button>
            );
          })}
        </div>
      </FloatingPanel>
    </div>
  );
}
