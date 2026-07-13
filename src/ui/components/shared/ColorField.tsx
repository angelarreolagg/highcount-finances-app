import { isHexColor } from "../../utils/chips";

interface ColorFieldProps {
  /** Current hex color, or undefined for the default gradient. */
  value?: string;
  onChange: (color?: string) => void;
}

const DEFAULT_WELL = "#2536e8";

/** Free color picker: a native color well that opens the OS picker for any hex. */
export function ColorField({ value, onChange }: ColorFieldProps) {
  const active = isHexColor(value) ? value : undefined;

  return (
    <div className="flex items-center gap-3">
      <label className="relative size-9 shrink-0 cursor-pointer overflow-hidden rounded-xl ring-1 ring-inset ring-white/15">
        <span className="absolute inset-0" style={{ backgroundColor: active ?? DEFAULT_WELL }} />
        <input
          type="color"
          aria-label="Card color"
          value={active ?? DEFAULT_WELL}
          onChange={(e) => onChange(e.target.value)}
          className="absolute inset-0 size-full cursor-pointer opacity-0"
        />
      </label>
      <span className="font-mono text-xs tracking-wide text-white/70 uppercase">
        {active ?? "Auto"}
      </span>
    </div>
  );
}
