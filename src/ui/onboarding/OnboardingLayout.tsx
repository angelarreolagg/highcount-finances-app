import { motion } from "motion/react";
import { useTranslation } from "react-i18next";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { useIntroClock } from "./introPlayback";

/** The shared animated gradient backdrop + drifting blobs (same as PageShell's). */
export function OnboardingBackdrop() {
  return (
    <div className="app-backdrop" aria-hidden="true">
      <div className="hero-blob hero-blob-a -top-24 left-[8%] size-72" />
      <div className="hero-blob hero-blob-b top-28 right-[6%] size-80" />
    </div>
  );
}

/**
 * The stage every onboarding screen plays on. Mounted ONCE by the page and kept alive across the
 * intro → wizard handoff: if the backdrop unmounts mid-transition the screen flashes bare `bg-night`
 * (the old "fade to black") and the ambient blob/gradient keyframes restart from zero.
 */
export function OnboardingScene({ children }: { children: ReactNode }) {
  return (
    <main className="relative flex min-h-dvh flex-col items-center justify-center px-5 py-10">
      <OnboardingBackdrop />
      {children}
    </main>
  );
}

/**
 * The brand tile — the one element that survives the whole onboarding opening. It appears centered
 * in the intro and again in the name step's header; the shared `layoutId` means Motion *travels and
 * shrinks the same tile* between those two slots instead of fading one out and springing another
 * in. Only ever render one at a time.
 */
export function OnboardingMark({ size = "card" }: { size?: "hero" | "card" }) {
  const hero = size === "hero";
  return (
    <motion.div
      layoutId="onboarding-mark"
      transition={{ type: "spring", bounce: 0.12, duration: 0.9 }}
      className={`mx-auto flex items-center justify-center rounded-3xl bg-white/10 ring-1 ring-white/15 ${
        hero ? "size-20 shadow-xl shadow-black/30" : "size-16"
      }`}
    >
      <img
        src="/favicon/favicon-128x128.png"
        alt=""
        className={hero ? "size-12 rounded-2xl" : "size-10 rounded-xl"}
      />
    </motion.div>
  );
}

const wordmark = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { type: "spring" as const, bounce: 0.2 } },
};

/**
 * The intro's wordmark + tagline — everything *except* the mark, so the two can leave separately:
 * this block blurs away while the mark flies on into the form card.
 */
export function OnboardingWordmark({
  instant = false,
  held = false,
}: {
  /** Mount already in place (the beat played on the previous route) instead of replaying it. */
  instant?: boolean;
  /** Hold at the start of the entrance — used while the auth cover hides the screen. */
  held?: boolean;
}) {
  const { t } = useTranslation();
  return (
    <motion.div
      initial={instant ? false : "hidden"}
      animate={held ? "hidden" : "visible"}
      exit={{ opacity: 0, y: 10, filter: "blur(6px)", transition: { duration: 0.45 } }}
      variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } } }}
      className="mt-5 text-center"
    >
      <motion.h1 variants={wordmark} className="text-3xl font-bold tracking-tight">
        High Count
      </motion.h1>
      <motion.p variants={wordmark} className="mx-auto mt-2 max-w-xs text-sm text-white/60">
        {t("onboarding.introTagline")}
      </motion.p>
    </motion.div>
  );
}

/**
 * The app's brand intro — mark + wordmark + tagline, centered. Used standalone as the gate's
 * loading splash; the wizard composes the same two pieces itself so it can hand the mark off.
 */
export function OnboardingIntro() {
  // The clock (and the entrance) start only once the auth cover is gone — behind it the beat would
  // be spent invisibly and the wizard would take over mid-animation.
  const { covered, startedBefore } = useIntroClock();
  return (
    <OnboardingScene>
      <motion.div
        initial={startedBefore ? false : { opacity: 0, scale: 0.85 }}
        animate={covered ? { opacity: 0, scale: 0.85 } : { opacity: 1, scale: 1 }}
        transition={{ type: "spring", bounce: 0.35, duration: 0.9 }}
      >
        <OnboardingMark size="hero" />
      </motion.div>
      <OnboardingWordmark instant={startedBefore} held={covered} />
    </OnboardingScene>
  );
}

/** Splash shown while the gate decides whether to onboard — the branded intro (avoids a dashboard flash). */
export function OnboardingSplash() {
  return <OnboardingIntro />;
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

/**
 * The wizard's centered glass column (progress dots + panel). The stage around it belongs to
 * `OnboardingScene`, which the page keeps mounted across the intro handoff.
 */
export function OnboardingLayout({
  progress,
  children,
}: {
  /** 1-based current step / total, for the progress dots. Omit on the welcome intro. */
  progress?: { current: number; total: number };
  children: ReactNode;
}) {
  return (
    <div className="w-full max-w-md">
      {progress && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.4 }}
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
        </motion.div>
      )}
      {/* layout="size" animates only width/height (not position, so the column stays centered),
          so the panel grows/shrinks smoothly as steps of different heights swap in. */}
      <motion.div
        layout="size"
        transition={{ type: "spring", bounce: 0.15, duration: 0.4 }}
        className="relative p-6"
      >
        {/* The glass is its own layer BEHIND the content rather than a class on the panel: the
            entrance fades it in, and anything that fades must not be an ancestor of the arriving
            mark (that's what made the flight invisible). `layout` keeps its radius undistorted
            while the panel springs between step heights. */}
        <motion.div
          layout
          aria-hidden="true"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", bounce: 0.1, duration: 0.7, delay: 0.2 }}
          className="absolute inset-0 rounded-3xl border border-white/10 bg-white/[0.06] shadow-xl shadow-black/30 backdrop-blur-xl"
        />
        <div className="relative">{children}</div>
      </motion.div>
    </div>
  );
}
