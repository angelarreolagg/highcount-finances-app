import { motion } from "motion/react";
import type { ComponentProps } from "react";

type ButtonVariant = "pill" | "primary" | "ghost" | "danger" | "dangerSoft";

const variantClasses: Record<ButtonVariant, string> = {
  pill: "bg-white/15 text-white backdrop-blur hover:bg-white/25",
  primary: "bg-white text-night hover:bg-white/90",
  ghost: "text-peri hover:bg-white/10",
  danger: "bg-coral text-night hover:bg-coral/90",
  // A milder danger than the solid coral fill — a coral-tinted outline for reversible actions
  // (e.g. sign out) that should read as cautionary but not destructive.
  dangerSoft: "bg-coral/15 text-coral ring-1 ring-inset ring-coral/30 hover:bg-coral/25",
};

interface ButtonProps extends ComponentProps<typeof motion.button> {
  variant?: ButtonVariant;
}

export function Button({ variant = "pill", className = "", ...props }: ButtonProps) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      className={`rounded-full px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50 ${variantClasses[variant]} ${className}`}
      {...props}
    />
  );
}
