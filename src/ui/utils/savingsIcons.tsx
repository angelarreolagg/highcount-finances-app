import { ArrowDownToLine, TrendingUp } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { SavingsEntryKind } from "../../domain/entities/SavingsEntry";

/** Default icon per savings movement kind: a deposit (money in) vs returns (interest produced). */
const KIND_ICON: Record<SavingsEntryKind, LucideIcon> = {
  deposit: ArrowDownToLine,
  returns: TrendingUp,
};

interface SavingsIconProps {
  size?: number;
  className?: string;
}

/** The savings movement's default icon (deposit / returns). */
export function savingsKindIcon(kind: SavingsEntryKind, props: SavingsIconProps = {}) {
  const { size = 18, className } = props;
  const Icon = KIND_ICON[kind];
  return <Icon size={size} strokeWidth={1.8} className={className} />;
}
