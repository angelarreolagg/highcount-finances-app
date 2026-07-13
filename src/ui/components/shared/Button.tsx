import { motion } from "motion/react";
import type { ComponentProps } from "react";

type ButtonVariant = "pill" | "primary" | "ghost" | "danger";

const variantClasses: Record<ButtonVariant, string> = {
  pill: "bg-white/15 text-white backdrop-blur hover:bg-white/25",
  primary: "bg-white text-night hover:bg-white/90",
  ghost: "text-peri hover:bg-white/10",
  danger: "bg-coral text-night hover:bg-coral/90",
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
