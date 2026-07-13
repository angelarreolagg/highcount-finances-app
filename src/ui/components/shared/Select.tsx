import type { ComponentProps } from "react";
import { selectControl } from "./formStyles";
import { ChevronDownIcon } from "./icons";

type SelectProps = ComponentProps<"select">;

/** Native select on the glass `control` recipe with a custom right-aligned chevron. */
export function Select({ className = "", children, ...props }: SelectProps) {
  return (
    <div className="relative">
      <select className={`${selectControl} ${className}`} {...props}>
        {children}
      </select>
      <ChevronDownIcon
        size={16}
        className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-white/40"
      />
    </div>
  );
}
