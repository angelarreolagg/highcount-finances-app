import type { ButtonHTMLAttributes, ReactNode } from "react";

/** The shared animated gradient backdrop + drifting blobs (same as PageShell's). */
export function OnboardingBackdrop() {
  return (
    <div className="app-backdrop" aria-hidden="true">
      <div className="hero-blob hero-blob-a -top-24 left-[8%] size-72" />
      <div className="hero-blob hero-blob-b top-28 right-[6%] size-80" />
    </div>
  );
}

/** Minimal splash shown while the gate decides whether to onboard (avoids a dashboard flash). */
export function OnboardingSplash() {
  return (
    <div className="relative flex min-h-dvh items-center justify-center">
      <OnboardingBackdrop />
      <div className="size-12 animate-pulse rounded-2xl bg-white/10 ring-1 ring-white/15 backdrop-blur" />
    </div>
  );
}

/**
 * Full-width primary CTA wearing the traveling `dock-ring` conic border. The button's
 * `rounded-[1.125rem]` matches the ring pseudo-element's radius so the animated border hugs
 * the pill at any width. Reduced motion freezes it to a static gradient border (index.css).
 */
export function OnboardingCta({
  children,
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      {...props}
      className={`dock-ring dock-ring-primary relative w-full rounded-[1.125rem] bg-white/[0.08] px-5 py-3 text-sm font-semibold text-white backdrop-blur-xl transition-colors hover:bg-white/[0.12] disabled:cursor-not-allowed disabled:opacity-40 ${className}`}
    >
      <span className="relative">{children}</span>
    </button>
  );
}

/** A subtle text link for the "Skip for now" affordance. */
export function OnboardingSkip({ children, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      {...props}
      className="mx-auto block text-xs font-medium text-white/50 transition-colors hover:text-white"
    >
      {children}
    </button>
  );
}

/** The distraction-free wizard frame: backdrop + centered glass column + optional progress dots. */
export function OnboardingLayout({
  progress,
  children,
}: {
  /** 1-based current step / total, for the progress dots. Omit on the welcome intro. */
  progress?: { current: number; total: number };
  children: ReactNode;
}) {
  return (
    <main className="relative flex min-h-dvh flex-col items-center justify-center px-5 py-10">
      <OnboardingBackdrop />
      <div className="w-full max-w-md">
        {progress && (
          <div
            className="mb-6 flex items-center justify-center gap-2"
            role="list"
            aria-label="Progress"
          >
            {Array.from({ length: progress.total }, (_, i) => {
              const active = i === progress.current - 1;
              const done = i < progress.current - 1;
              return (
                <span
                  key={i}
                  role="listitem"
                  aria-current={active ? "step" : undefined}
                  className={`h-1.5 rounded-full transition-all ${
                    active ? "w-6 bg-peri" : done ? "w-1.5 bg-peri/50" : "w-1.5 bg-white/15"
                  }`}
                />
              );
            })}
          </div>
        )}
        <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-6 shadow-xl shadow-black/30 backdrop-blur-xl">
          {children}
        </div>
      </div>
    </main>
  );
}
