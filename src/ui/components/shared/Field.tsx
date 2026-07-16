import type { ReactNode } from "react";

interface FieldProps {
  label: string;
  error?: string;
  className?: string;
  children: ReactNode;
}

export function Field({ label, error, className = "", children }: FieldProps) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1 block text-xs font-medium text-white/50">{label}</span>
      {children}
      {error && <span className="mt-1 block text-xs text-coral">{error}</span>}
    </label>
  );
}
