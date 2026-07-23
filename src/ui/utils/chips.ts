import type { CSSProperties } from "react";
import type { ChipColor } from "../../domain/entities/ChipColor";
import { CHIP_COLORS, isChipColor } from "../../domain/entities/ChipColor";

/** Colorful circular icon chips (per the Revolut wealth screen): hue derived from the row's id. */

const CHIP_CLASSES: Record<ChipColor, string> = {
  indigo: "bg-indigo-500",
  sky: "bg-sky-500",
  emerald: "bg-emerald-500",
  amber: "bg-amber-500",
  rose: "bg-rose-500",
  violet: "bg-violet-500",
  cyan: "bg-cyan-500",
  fuchsia: "bg-fuchsia-500",
};

/** Palette options for the swatch picker, in display order. */
export const CHIP_COLOR_OPTIONS: { color: ChipColor; className: string }[] = CHIP_COLORS.map(
  (color) => ({ color, className: CHIP_CLASSES[color] }),
);

/** Automatic hue: hash the seed into the palette (fallback when no color was assigned). */
export function chipClass(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return CHIP_CLASSES[CHIP_COLORS[hash % CHIP_COLORS.length]];
}

/** User-assigned color when present and valid, otherwise the automatic hash hue. */
export function chipClassFor(color: string | undefined, seed: string): string {
  if (color && isChipColor(color)) return CHIP_CLASSES[color];
  return chipClass(seed);
}

const HEX_RE = /^#[0-9a-fA-F]{6}$/;

/** True for a full 6-digit hex color (the free-form card color format). */
export function isHexColor(color: string | undefined): color is string {
  return color != null && HEX_RE.test(color);
}

/** Quick-pick presets for the free color picker (brand hues). */
export const PALETTE_HEXES: string[] = [
  "#818cf8", // peri
  "#38bdf8", // sky
  "#34d399", // mint
  "#fbbf24", // amber
  "#f87171", // coral
  "#a78bfa", // violet
  "#22d3ee", // cyan
  "#e879f9", // fuchsia
];

/** Diagonal gradient for a card face; falls back to the peri-deep blue when no color set. */
export function cardSurface(color: string | undefined): string {
  const base = isHexColor(color) ? color : "#2536e8";
  return `linear-gradient(135deg, ${base} 0%, color-mix(in srgb, ${base} 55%, #05060e) 100%)`;
}

/**
 * Full inline style for a card-face element: the gradient plus a local `--color-white: #fff`
 * reset. A card always sits on a dark colored gradient, so its `text-white/…` / `ring-white/…`
 * must stay light in every theme — this pins white back even under the Excel light theme (which
 * globally flips `--color-white` to dark ink). A no-op in the dark themes.
 */
export function cardSurfaceStyle(color: string | undefined): CSSProperties {
  return { backgroundImage: cardSurface(color), "--color-white": "#fff" } as CSSProperties;
}

/** Inline background for a chip tinted by a free hex color; undefined when none (use a class fallback). */
export function cardChipStyle(color: string | undefined): CSSProperties | undefined {
  return isHexColor(color) ? { backgroundColor: color } : undefined;
}

function hslToHex(h: number, s: number, l: number): string {
  const a = (s * Math.min(l, 100 - l)) / 100;
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const c = l / 100 - (a / 100) * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * c)
      .toString(16)
      .padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

/** A pleasant random card color (random hue, fixed saturation/lightness for the dark theme). */
export function randomCardColor(): string {
  return hslToHex(Math.floor(Math.random() * 360), 68, 58);
}
