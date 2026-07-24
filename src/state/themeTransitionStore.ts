import { create } from "zustand";

/** Fade duration of the cover, in ms — shared so the overlay and the sign-out await stay in sync. */
export const COVER_FADE_MS = 350;

/**
 * Ephemeral flag for the full-screen cover used on auth transitions (see
 * `ui/theme/ThemeTransition.tsx`). Kept in a store rather than component state so the effect-driven
 * triggers use a plain setter (React setState called synchronously inside an effect trips the React
 * Compiler's cascading-render rule) — and so non-React callers (the `signOut` action) can raise the
 * cover before the session drops.
 *
 * `fadeIn` picks the entrance: sign-in appears instantly (to mask the theme-swap flash), sign-out
 * fades to black (a smooth page transition into /login). `awaitPath` holds the cover until that
 * route is actually mounted, so the destination never pops in mid-fade.
 */
interface ThemeTransitionState {
  covering: boolean;
  fadeIn: boolean;
  /** Route the cover waits for before it may lift (null = lift as soon as the profile resolves). */
  awaitPath: string | null;
  startCover: (fadeIn: boolean, awaitPath?: string | null) => void;
  endCover: () => void;
}

export const useThemeTransitionStore = create<ThemeTransitionState>((set) => ({
  covering: false,
  fadeIn: false,
  awaitPath: null,
  startCover: (fadeIn, awaitPath = null) => set({ covering: true, fadeIn, awaitPath }),
  endCover: () => set({ covering: false, awaitPath: null }),
}));
