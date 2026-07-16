import {
  Briefcase,
  Car,
  Clapperboard,
  Coins,
  HeartPulse,
  Home,
  ShoppingBag,
  Tag,
  Utensils,
  Wrench,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

/** Maps the closed set of DEFAULT_CATEGORIES names to a real vector icon (lucide-react). */
const CATEGORY_ICON_BY_NAME: Record<string, LucideIcon> = {
  Food: Utensils,
  Transport: Car,
  Housing: Home,
  Services: Wrench,
  Health: HeartPulse,
  Entertainment: Clapperboard,
  Shopping: ShoppingBag,
  "Other expense": Tag,
  Salary: Briefcase,
  "Other income": Coins,
};

interface CategoryIconProps {
  size?: number;
  className?: string;
}

/** The category's icon, or a generic tag as a safe fallback for any unmapped name. */
export function categoryIcon(name: string, props: CategoryIconProps = {}) {
  const { size = 16, className } = props;
  const Icon = CATEGORY_ICON_BY_NAME[name] ?? Tag;
  return <Icon size={size} strokeWidth={1.8} className={className} />;
}
