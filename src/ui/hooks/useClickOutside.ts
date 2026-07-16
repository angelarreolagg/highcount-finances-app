import { useEffect } from "react";
import type { RefObject } from "react";

/**
 * Closes on a pointerdown outside every given ref's element — pure DOM containment,
 * no z-index/stacking-context involved. Unlike an invisible full-viewport overlay div,
 * this stays reliable when nested inside an animated ancestor (e.g. a Motion-driven
 * modal panel, whose inline `transform` creates its own stacking context and can trap
 * z-index-based overlay tricks) and when the trigger and its panel are portaled apart
 * (they're no longer DOM-nested, so both refs must count as "inside").
 */
export function useClickOutside(
  open: boolean,
  onOutside: () => void,
  refs: RefObject<HTMLElement | null>[],
): void {
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node;
      const isInside = refs.some((ref) => ref.current?.contains(target));
      if (!isInside) onOutside();
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open, onOutside]);
}
