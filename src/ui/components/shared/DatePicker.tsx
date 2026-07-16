import { Calendar } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  addMonths,
  daysInMonth,
  makeLocalDate,
  parseISODate,
  startOfDay,
  toISODate,
} from "../../../domain/value-objects/calendar";
import { useClickOutside } from "../../hooks/useClickOutside";
import { MONTH_NAMES } from "../../../shared/utils/months";
import { FloatingPanel } from "./FloatingPanel";
import { control } from "./formStyles";
import { ChevronDownIcon } from "./icons";

const WEEKDAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

interface DatePickerProps {
  value: string;
  onChange: (iso: string) => void;
  "aria-label"?: string;
}

function formatDisplay(iso: string): string {
  const { year, monthIndex, day } = parseISODate(iso);
  return `${day} ${MONTH_NAMES[monthIndex].slice(0, 3)} ${year}`;
}

/** Shared date picker: a glass month-grid popover replacing the native `<input type="date">`.
 *  Single-date mode only for now — nothing in the app needs a range yet, but the same
 *  building blocks (calendar.ts helpers, useClickOutside) make one a natural follow-up. */
export function DatePicker({ value, onChange, "aria-label": ariaLabel }: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const selected = value ? parseISODate(value) : null;
  const today = startOfDay(new Date());
  const [viewYear, setViewYear] = useState(selected?.year ?? today.getFullYear());
  const [viewMonth, setViewMonth] = useState(selected?.monthIndex ?? today.getMonth());
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

  const handleTriggerClick = () => {
    // Jump the visible month back to the selected/current date each time the panel opens.
    if (!open) {
      setViewYear(selected?.year ?? today.getFullYear());
      setViewMonth(selected?.monthIndex ?? today.getMonth());
    }
    setOpen((v) => !v);
  };

  const goMonth = (delta: number) => {
    const next = addMonths(viewYear, viewMonth, delta);
    setViewYear(next.year);
    setViewMonth(next.monthIndex);
  };

  const firstWeekday = makeLocalDate(viewYear, viewMonth, 1).getDay();
  const total = daysInMonth(viewYear, viewMonth);
  const days = Array.from({ length: total }, (_, i) => i + 1);

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={handleTriggerClick}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={ariaLabel}
        className={`${control} flex items-center gap-2 text-left`}
      >
        <Calendar size={16} strokeWidth={1.8} className="shrink-0 text-white/50" />
        <span className="min-w-0 flex-1 truncate">
          {value ? formatDisplay(value) : <span className="text-white/30">Select a date</span>}
        </span>
      </button>

      <FloatingPanel
        open={open}
        triggerRef={triggerRef}
        panelRef={panelRef}
        onClose={() => setOpen(false)}
        matchTriggerWidth={false}
        className="w-60 p-2.5"
      >
        <div role="dialog" aria-label="Choose a date">
          <div className="mb-2 flex items-center justify-between">
            <button
              type="button"
              onClick={() => goMonth(-1)}
              aria-label="Previous month"
              className="flex size-6 items-center justify-center rounded-full text-white/70 hover:bg-white/10 hover:text-white"
            >
              <ChevronDownIcon size={14} className="rotate-90" />
            </button>
            <span className="text-sm font-medium">
              {MONTH_NAMES[viewMonth]} {viewYear}
            </span>
            <button
              type="button"
              onClick={() => goMonth(1)}
              aria-label="Next month"
              className="flex size-6 items-center justify-center rounded-full text-white/70 hover:bg-white/10 hover:text-white"
            >
              <ChevronDownIcon size={14} className="-rotate-90" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-[10px] text-white/40">
            {WEEKDAY_LABELS.map((label, i) => (
              <span key={i} className="py-0.5">
                {label}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstWeekday }, (_, i) => (
              <span key={`pad-${i}`} />
            ))}
            {days.map((day) => {
              const date = makeLocalDate(viewYear, viewMonth, day);
              const iso = toISODate(date);
              const isSelected = value === iso;
              const isToday = date.getTime() === today.getTime();
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => {
                    onChange(iso);
                    setOpen(false);
                  }}
                  className={`flex aspect-square items-center justify-center rounded-lg text-xs tabular-nums transition-colors ${
                    isSelected
                      ? "border border-peri/40 bg-peri/25 text-white"
                      : isToday
                        ? "text-peri hover:bg-white/10"
                        : "text-white/85 hover:bg-white/10"
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      </FloatingPanel>
    </div>
  );
}
