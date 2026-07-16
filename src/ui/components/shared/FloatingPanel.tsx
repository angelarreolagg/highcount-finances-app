import { AnimatePresence, motion } from "motion/react";
import { useLayoutEffect, useState } from "react";
import type { ReactNode, RefObject } from "react";
import { createPortal } from "react-dom";

interface FloatingPanelProps {
  open: boolean;
  /** The trigger button — used to compute where the portaled panel appears. */
  triggerRef: RefObject<HTMLElement | null>;
  /** Attached to the panel's own root node — pass this to useClickOutside alongside triggerRef. */
  panelRef: RefObject<HTMLDivElement | null>;
  onClose: () => void;
  /**
   * Force the panel to be at least as wide as its trigger (default true — good for
   * option lists that should span the field). Set false when the panel has its own
   * intrinsic width smaller than the trigger (e.g. the compact date picker).
   */
  matchTriggerWidth?: boolean;
  className?: string;
  children: ReactNode;
}

/**
 * Portals its children into `document.body`, positioned `fixed` just below the
 * trigger. Escapes the DOM subtree of any ancestor modal entirely, so it can never
 * contribute to that modal's `overflow-y-auto` scrollHeight (the bug a plain
 * `position: absolute` popover has — even floating visually on top, it still counts
 * toward the scrollable container's content size). `position: fixed` alone doesn't
 * fix this either: a Motion-animated ancestor's inline `transform` makes it the
 * containing block for fixed descendants too, so only a true DOM portal escapes.
 * Closes on scroll (of anything) rather than tracking live repositioning — these are
 * short-lived form popovers, not persistent floating UI.
 */
export function FloatingPanel({
  open,
  triggerRef,
  panelRef,
  onClose,
  matchTriggerWidth = true,
  className = "",
  children,
}: FloatingPanelProps) {
  const [rect, setRect] = useState<{ top: number; left: number; width: number } | null>(null);

  useLayoutEffect(() => {
    if (!open || !triggerRef.current) return;
    const r = triggerRef.current.getBoundingClientRect();
    setRect({ top: r.bottom + 6, left: r.left, width: r.width });
  }, [open, triggerRef]);

  useLayoutEffect(() => {
    if (!open) return;
    const onScroll = (e: Event) => {
      // Ignore scrolls inside the panel itself (e.g. a long, scrollable option list);
      // only close when an ancestor/page scrolls, which would move the trigger away.
      if (panelRef.current?.contains(e.target as Node)) return;
      onClose();
    };
    document.addEventListener("scroll", onScroll, true);
    return () => document.removeEventListener("scroll", onScroll, true);
  }, [open, onClose, panelRef]);

  return createPortal(
    <AnimatePresence>
      {open && rect && (
        <motion.div
          ref={panelRef}
          initial={{ opacity: 0, y: -4, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -4, scale: 0.97 }}
          transition={{ type: "spring", bounce: 0.2, duration: 0.3 }}
          style={{
            position: "fixed",
            top: rect.top,
            left: rect.left,
            ...(matchTriggerWidth ? { minWidth: rect.width } : null),
          }}
          className={`z-50 origin-top rounded-2xl border border-white/10 bg-panel/95 shadow-xl shadow-black/40 backdrop-blur-2xl ${className}`}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
