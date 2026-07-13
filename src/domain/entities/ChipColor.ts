/** User-assignable chip color: a curated palette key, never a raw hex or CSS class. */
export type ChipColor =
  | "indigo"
  | "sky"
  | "emerald"
  | "amber"
  | "rose"
  | "violet"
  | "cyan"
  | "fuchsia";

export const CHIP_COLORS: readonly ChipColor[] = [
  "indigo",
  "sky",
  "emerald",
  "amber",
  "rose",
  "violet",
  "cyan",
  "fuchsia",
];

export function isChipColor(value: string): value is ChipColor {
  return (CHIP_COLORS as readonly string[]).includes(value);
}
