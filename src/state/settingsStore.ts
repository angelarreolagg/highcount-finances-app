import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ThemeId } from "../ui/theme/themes";
import { DEFAULT_THEME } from "../ui/theme/themes";

/**
 * Persisted user preferences (localStorage). Display name, the first-run flag, and the selected
 * color theme live here — the language preference is owned by the i18next language detector
 * (`highcount:lang`). Kept separate from the ephemeral view-only `uiStore`.
 *
 * The theme preference is stored for everyone, but premium themes only *apply* for signed-in
 * users (enforced in `useApplyTheme`); the stored choice re-applies the moment they sign in.
 */

interface SettingsState {
  displayName: string;
  setDisplayName: (name: string) => void;
  /** True once the first-run onboarding wizard has been completed or skipped. */
  onboardingComplete: boolean;
  setOnboardingComplete: (done: boolean) => void;
  /** Selected color theme (see `ui/theme/themes.ts`). */
  theme: ThemeId;
  setTheme: (theme: ThemeId) => void;
  /** Average monthly salary as a Money.toStorage() decimal string ("" = unset). Drives runway. */
  averageMonthlySalary: string;
  setAverageMonthlySalary: (value: string) => void;
  /** Restore every preference to its first-run default (used when deleting the account). */
  reset: () => void;
}

const DEFAULTS = {
  displayName: "",
  onboardingComplete: false,
  theme: DEFAULT_THEME,
  averageMonthlySalary: "",
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      displayName: DEFAULTS.displayName,
      setDisplayName: (name) => set({ displayName: name }),
      onboardingComplete: DEFAULTS.onboardingComplete,
      setOnboardingComplete: (done) => set({ onboardingComplete: done }),
      theme: DEFAULTS.theme,
      setTheme: (theme) => set({ theme }),
      averageMonthlySalary: DEFAULTS.averageMonthlySalary,
      setAverageMonthlySalary: (value) => set({ averageMonthlySalary: value }),
      reset: () => set({ ...DEFAULTS }),
    }),
    { name: "highcount:settings" },
  ),
);
