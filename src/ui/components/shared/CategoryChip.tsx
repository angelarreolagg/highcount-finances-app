import { categoryIcon } from "../../utils/categoryIcons";
import { chipClassFor } from "../../utils/chips";

interface CategoryChipProps {
  categoryName: string;
  /** User-assigned chip color; falls back to the automatic hashed hue when undefined. */
  color?: string;
  className?: string;
}

/** The colored round chip for a transaction row — hued by color/category, with the category's vector icon. */
export function CategoryChip({ categoryName, color, className = "" }: CategoryChipProps) {
  return (
    <span
      className={`flex size-9 shrink-0 items-center justify-center rounded-full ${chipClassFor(color, categoryName)} ${className}`}
    >
      {categoryIcon(categoryName, { size: 18, className: "text-white" })}
    </span>
  );
}
