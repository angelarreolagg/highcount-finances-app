import type { ReactNode } from "react";

interface FieldProps {
  label: string;
  error?: string;
  children: ReactNode;
}

export function Field({ label, error, children }: FieldProps) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-white/50">{label}</span>
      {children}
      {error && <span className="mt-1 block text-xs text-coral">{error}</span>}
    </label>
  );
}
