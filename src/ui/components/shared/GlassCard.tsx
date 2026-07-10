import { motion } from "motion/react";
import type { ReactNode } from "react";
import { riseIn } from "./motionPresets";

interface GlassCardProps {
  title?: string;
  action?: ReactNode;
  className?: string;
  children: ReactNode;
}

/** Frosted section card — the glass recipe from docs/DESIGN.md. */
export function GlassCard({ title, action, className = "", children }: GlassCardProps) {
  return (
    <motion.section
      variants={riseIn}
      className={`flex min-h-0 flex-col rounded-3xl border border-white/10 bg-white/[0.06] p-4 backdrop-blur-xl ${className}`}
    >
      {(title || action) && (
        <div className="mb-3 flex shrink-0 items-center justify-between">
          {title && <h2 className="text-sm font-semibold text-white/60">{title}</h2>}
          {action}
        </div>
      )}
      <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
    </motion.section>
  );
}
