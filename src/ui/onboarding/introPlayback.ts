import { useEffect, useState } from "react";
import { useThemeTransitionStore } from "../../state/themeTransitionStore";

/**
 * The brand intro's clock. The gate's loading splash and the wizard's opening beat are the same
 * intro on two different routes, so the wizard needs to know *when the beat became visible* — not
 * merely that it happened — or it either replays the entrance or truncates what's left of it to a
 * blink. `OnboardingPage` holds for the remainder of the beat instead.
 *
 * Deliberately module scope (not persisted): it only bridges the splash → /welcome route swap
 * within one page load, and a fresh load should get the whole intro again.
 *
 * Its own module because the react-refresh rule forbids non-component exports next to components.
 */
let startedAt: number | null = null;
/** How many intros are on screen right now — see `useIntroClock` for why this matters. */
let mountedIntros = 0;

/** Starts the clock the first time the intro is actually on screen; later calls are no-ops. */
export function startIntroClock(): void {
  if (startedAt === null) startedAt = Date.now();
}

/** Begins a fresh beat (a visit that isn't continuing one already on screen). */
export function restartIntroClock(): void {
  startedAt = Date.now();
}

export function introElapsedMs(): number {
  return startedAt === null ? 0 : Date.now() - startedAt;
}

/**
 * Shared timing state for both places the intro renders (the gate's splash and the wizard's own
 * opening phase). While the auth cover is up — the black overlay of a sign-in / OAuth return — the
 * intro is on screen but invisible, so the clock stays paused and the entrance stays held; letting
 * it run would spend the beat behind the cover and reveal the animation mid-flight.
 *
 * `startedBefore` distinguishes *continuing* a beat from *starting* one: it's true only when another
 * intro is still mounted as this one renders, which is exactly the seamless splash → /welcome swap
 * (React renders the arrival before it unmounts the departure). Any later, unrelated visit — a guest
 * who passed through the one-frame redirect splash minutes ago, say — finds nothing mounted and gets
 * the full beat again instead of a truncated tail.
 */
export function useIntroClock(): { covered: boolean; startedBefore: boolean } {
  const covered = useThemeTransitionStore((s) => s.covering);
  const [startedBefore] = useState(() => startedAt !== null && mountedIntros > 0);

  useEffect(() => {
    mountedIntros += 1;
    return () => {
      mountedIntros -= 1;
    };
  }, []);

  useEffect(() => {
    if (covered) return; // still hidden behind the auth cover — the beat hasn't begun
    if (startedBefore) startIntroClock();
    else restartIntroClock();
  }, [covered, startedBefore]);

  return { covered, startedBefore };
}
