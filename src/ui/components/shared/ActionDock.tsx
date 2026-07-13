import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "motion/react";
import type { MotionValue, SpringOptions } from "motion/react";
import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { useUiStore } from "../../../state/uiStore";
import { LayersIcon, PlusIcon } from "./icons";

/** macOS-style magnification (adapted from the ReactBits Dock): items swell as the cursor nears. */
const SPRING: SpringOptions = { mass: 0.1, stiffness: 150, damping: 12 };
const BASE_SIZE = 48;
const MAGNIFIED_SIZE = 68;
const DISTANCE = 140;

type DockVariant = "primary" | "glass";

/**
 * Transparent liquid glass with an animated glow border: a dark frosted fill, a
 * specular top sheen, and a colored light segment traveling around the rounded-
 * square edge (`.dock-ring-*`, see index.css). Add and MSI share the same
 * transparent fill — only the ring's hue distinguishes them.
 */
const itemStyles: Record<DockVariant, string> = {
  /** "Add" — peri/sky + amber glow ring. */
  primary: "dock-ring dock-ring-primary bg-white/[0.06] shadow-lg shadow-black/30 backdrop-blur-xl",
  /** "MSI" — quieter white/peri ring. */
  glass: "dock-ring dock-ring-glass bg-white/[0.06] shadow-lg shadow-black/30 backdrop-blur-xl",
};

/** Glass tooltip that reveals the action's name above the button on hover/focus. */
function DockLabel({ isHovered, children }: { isHovered: MotionValue<number>; children: ReactNode }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => isHovered.on("change", (latest) => setVisible(latest === 1)), [isHovered]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.span
          initial={{ opacity: 0, y: 0 }}
          animate={{ opacity: 1, y: -10 }}
          exit={{ opacity: 0, y: 0 }}
          transition={{ duration: 0.2 }}
          role="tooltip"
          style={{ x: "-50%" }}
          className="absolute -top-7 left-1/2 w-fit rounded-full border border-white/10 bg-panel/90 px-2.5 py-1 text-xs font-medium whitespace-pre text-white backdrop-blur-xl"
        >
          {children}
        </motion.span>
      )}
    </AnimatePresence>
  );
}

function DockItem({
  label,
  variant,
  mouseX,
  onClick,
  children,
}: {
  /** Reveals above the button on hover; also the button's aria-label. */
  label: string;
  variant: DockVariant;
  mouseX: MotionValue<number>;
  onClick: () => void;
  children: ReactNode;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const isHovered = useMotionValue(0);
  const reduceMotion = useReducedMotion();
  const maxSize = reduceMotion ? BASE_SIZE : MAGNIFIED_SIZE;

  const mouseDistance = useTransform(mouseX, (val) => {
    const rect = ref.current?.getBoundingClientRect() ?? { x: 0, width: BASE_SIZE };
    return val - rect.x - rect.width / 2;
  });
  const targetSize = useTransform(mouseDistance, [-DISTANCE, 0, DISTANCE], [BASE_SIZE, maxSize, BASE_SIZE]);
  const size = useSpring(targetSize, SPRING);

  return (
    <motion.button
      ref={ref}
      type="button"
      style={{ width: size, height: size }}
      whileTap={{ scale: 0.94 }}
      onHoverStart={() => isHovered.set(1)}
      onHoverEnd={() => isHovered.set(0)}
      onFocus={() => isHovered.set(1)}
      onBlur={() => isHovered.set(0)}
      onClick={onClick}
      aria-label={label}
      className={`relative inline-flex items-center justify-center rounded-2xl ${itemStyles[variant]}`}
    >
      {/* Specular top sheen — the liquid-glass highlight. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-1.5 top-1 h-2/5 rounded-xl bg-linear-to-b from-white/25 to-transparent blur-[2px]"
      />
      <span className="relative text-white">{children}</span>
      <DockLabel isHovered={isHovered}>{label}</DockLabel>
    </motion.button>
  );
}

/** Floating bottom-center dock with the everyday actions, visible on every route. */
export function ActionDock() {
  const openModal = useUiStore((s) => s.openModal);
  const mouseX = useMotionValue(Infinity);

  return (
    <div className="fixed bottom-4 left-1/2 z-40 -translate-x-1/2">
      <motion.div
        onMouseMove={(e) => mouseX.set(e.clientX)}
        onMouseLeave={() => mouseX.set(Infinity)}
        role="toolbar"
        aria-label="Quick actions"
        className="flex items-end gap-3 rounded-3xl border border-white/10 bg-panel/70 px-4 py-3 shadow-xl shadow-black/40 backdrop-blur-2xl"
      >
        <DockItem
          label="Add expense / income"
          variant="primary"
          mouseX={mouseX}
          onClick={() => openModal("addTransaction")}
        >
          <PlusIcon size={22} />
        </DockItem>
        <DockItem
          label="Register MSI plan"
          variant="glass"
          mouseX={mouseX}
          onClick={() => openModal("registerMsi")}
        >
          <LayersIcon size={20} />
        </DockItem>
      </motion.div>
    </div>
  );
}
