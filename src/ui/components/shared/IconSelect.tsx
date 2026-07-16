import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { useClickOutside } from "../../hooks/useClickOutside";
import { FloatingPanel } from "./FloatingPanel";
import { control } from "./formStyles";
import { ChevronDownIcon } from "./icons";

export interface IconSelectOption {
  value: string;
  label: string;
  icon: ReactNode;
}

interface IconSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: IconSelectOption[];
  placeholder: string;
  "aria-label"?: string;
}

/** Glass dropdown with an icon per option — the accessible custom replacement for a native `<select>`. */
export function IconSelect({ value, onChange, options, placeholder, "aria-label": ariaLabel }: IconSelectProps) {
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
            <span className="shrink-0 text-white/70">{selected.icon}</span>
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
                <span className={active ? "text-peri" : "text-white/60"}>{option.icon}</span>
                <span className="min-w-0 flex-1 truncate">{option.label}</span>
              </button>
            );
          })}
        </div>
      </FloatingPanel>
    </div>
  );
}
