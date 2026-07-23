import { create } from "zustand";

/**
 * Ephemeral flag for the full-screen cover used on auth transitions (see
 * `ui/theme/ThemeTransition.tsx`). Kept in a store rather than component state so the effect-driven
 * triggers use a plain setter (React setState called synchronously inside an effect trips the React
 * Compiler's cascading-render rule).
 *
 * `fadeIn` picks the entrance: sign-in appears instantly (to mask the theme-swap flash), sign-out
 * fades to black (a smooth page transition into /login).
 */
interface ThemeTransitionState {
  covering: boolean;
  fadeIn: boolean;
  startCover: (fadeIn: boolean) => void;
  endCover: () => void;
}

export const useThemeTransitionStore = create<ThemeTransitionState>((set) => ({
  covering: false,
  fadeIn: false,
  startCover: (fadeIn) => set({ covering: true, fadeIn }),
  endCover: () => set({ covering: false }),
}));
