import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { useClickOutside } from "../../hooks/useClickOutside";
import { FloatingPanel } from "./FloatingPanel";
import { control } from "./formStyles";
import { ChevronDownIcon } from "./icons";

export interface GlassSelectOption {
  value: string;
  label: string;
  /** Optional leading node (icon, color dot, gradient swatch) shown before the label. */
  leading?: ReactNode;
  /** Optional muted line under the label (e.g. a card type). */
  sublabel?: string;
}

interface GlassSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: GlassSelectOption[];
  placeholder: string;
  "aria-label"?: string;
}

/**
 * Generic glass listbox — the accessible custom replacement for a native `<select>`.
 * `IconSelect` and the `/expenses` filters build on this; `leading` is optional so it
 * serves icon-less, color-dot, and gradient-swatch options alike.
 */
export function GlassSelect({
  value,
  onChange,
  options,
  placeholder,
  "aria-label": ariaLabel,
}: GlassSelectProps) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);
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
        className={`${control} flex items-center gap-2 text-left`}
      >
        {selected ? (
          <>
            {selected.leading && <span className="shrink-0 text-white/70">{selected.leading}</span>}
            <span className="min-w-0 flex-1 truncate">{selected.label}</span>
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
        className="max-h-64 overflow-y-auto p-1.5"
      >
        <div role="listbox">
          {options.map((option) => {
            const active = option.value === value;
            return (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={active}
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
                className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm ${
                  active ? "bg-white/10 text-white" : "text-white/85 hover:bg-white/10"
                }`}
              >
                {option.leading && (
                  <span className={`shrink-0 ${active ? "text-peri" : "text-white/60"}`}>
                    {option.leading}
                  </span>
                )}
                <span className="min-w-0 flex-1">
                  <span className="block truncate">{option.label}</span>
                  {option.sublabel && (
                    <span className="block truncate text-xs text-white/45 capitalize">
                      {option.sublabel}
                    </span>
                  )}
                </span>
              </button>
            );
          })}
        </div>
      </FloatingPanel>
    </div>
  );
}
