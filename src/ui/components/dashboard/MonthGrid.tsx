import { MONTH_NAMES } from "../../../shared/utils/months";
import { useUiStore } from "../../../state/uiStore";

interface MonthGridProps {
  year: number;
  availability: boolean[];
  currentMonthIndex: number;
}

export function MonthGrid({ year, availability, currentMonthIndex }: MonthGridProps) {
  const openMonthDetail = useUiStore((s) => s.openMonthDetail);

  return (
    <section className="mb-6">
      <h2 className="text-lg font-semibold mb-2">{year}</h2>
      <div className="grid grid-cols-4 gap-2">
        {MONTH_NAMES.map((name, monthIndex) => {
          const enabled = availability[monthIndex] ?? false;
          const isCurrent = monthIndex === currentMonthIndex;
          return (
            <button
              key={name}
              type="button"
              disabled={!enabled}
              onClick={() => openMonthDetail({ year, monthIndex })}
              className={`border p-2 text-sm ${enabled ? "" : "opacity-40"} ${isCurrent ? "font-bold" : ""}`}
            >
              {name}
            </button>
          );
        })}
      </div>
    </section>
  );
}
