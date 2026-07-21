import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * Persisted user preferences (localStorage). Only the display name lives here —
 * the language preference is owned by the i18next language detector
 * (`highcount:lang`). Kept separate from the ephemeral view-only `uiStore`.
 */

interface SettingsState {
  displayName: string;
  setDisplayName: (name: string) => void;
  /** True once the first-run onboarding wizard has been completed or skipped. */
  onboardingComplete: boolean;
  setOnboardingComplete: (done: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      displayName: "",
      setDisplayName: (name) => set({ displayName: name }),
      onboardingComplete: false,
      setOnboardingComplete: (done) => set({ onboardingComplete: done }),
    }),
    { name: "highcount:settings" },
  ),
);
