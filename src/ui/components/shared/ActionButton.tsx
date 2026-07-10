import { motion } from "motion/react";
import type { ReactNode } from "react";

interface ActionButtonProps {
  label: string;
  onClick: () => void;
  children: ReactNode;
}

/** Revolut-style circular frosted action button with a tiny label beneath. */
export function ActionButton({ label, onClick, children }: ActionButtonProps) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.94 }}
      onClick={onClick}
      className="flex flex-col items-center gap-1.5 text-xs font-medium text-white/85"
    >
      <span className="flex size-12 items-center justify-center rounded-full border border-white/10 bg-white/15 backdrop-blur">
        {children}
      </span>
      {label}
    </motion.button>
  );
}
