import type { ReactNode } from "react";
import { GlassSelect } from "./GlassSelect";

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

/** Glass dropdown with an icon per option — a thin wrapper over {@link GlassSelect}. */
export function IconSelect({
  value,
  onChange,
  options,
  placeholder,
  "aria-label": ariaLabel,
}: IconSelectProps) {
  return (
    <GlassSelect
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      aria-label={ariaLabel}
      options={options.map((o) => ({ value: o.value, label: o.label, leading: o.icon }))}
    />
  );
}
