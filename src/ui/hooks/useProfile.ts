import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../../infrastructure/supabase/client";
import {
  getProfile,
  setProfileName,
  setProfileTheme,
  setProfileSalary,
  setProfileOnboardingComplete,
} from "../../infrastructure/persistence/supabase/repositories";
import { useSettingsStore } from "../../state/settingsStore";
import { normalizeTheme } from "../theme/themes";
import type { ThemeId } from "../theme/themes";
import { useAuth } from "../auth/authContext";

interface Profile {
  displayName: string;
  email: string | null;
  avatarUrl: string | null;
  signedIn: boolean;
  /** True once the profile has resolved (cloud fetch settled when signed in; always true for guests). */
  profileLoaded: boolean;
  /** Effective theme: synced from the cloud profile when signed in, else the local store. */
  theme: ThemeId;
  /** Average monthly salary (Money.toStorage() decimal string; "" = unset). Drives runway. */
  averageMonthlySalary: string;
  /** True once THIS account (or the local guest profile) has finished first-run setup. */
  onboardingComplete: boolean;
  setDisplayName: (name: string) => Promise<void>;
  setTheme: (theme: ThemeId) => Promise<void>;
  setAverageMonthlySalary: (value: string) => Promise<void>;
  setOnboardingComplete: (done: boolean) => Promise<void>;
}

/**
 * Backend-aware profile: name/email/avatar for the header, plus the selected color theme.
 * Signed-in reads/writes the cloud `profiles` table (theme syncs across devices); signed-out uses
 * the local settings store. Email + avatar come from the session.
 */
export function useProfile(): Profile {
  const { user, isCloudEnabled } = useAuth();
  const localName = useSettingsStore((s) => s.displayName);
  const setLocalName = useSettingsStore((s) => s.setDisplayName);
  const localTheme = useSettingsStore((s) => s.theme);
  const setLocalTheme = useSettingsStore((s) => s.setTheme);
  const localSalary = useSettingsStore((s) => s.averageMonthlySalary);
  const setLocalSalary = useSettingsStore((s) => s.setAverageMonthlySalary);
  const localOnboarded = useSettingsStore((s) => s.onboardingComplete);
  const setLocalOnboarded = useSettingsStore((s) => s.setOnboardingComplete);
  const queryClient = useQueryClient();
  const signedIn = isCloudEnabled && !!user && !!supabase;

  const cloud = useQuery({
    queryKey: ["profile", user?.id],
    enabled: signedIn,
    queryFn: () => getProfile(supabase!, user!.id),
  });

  const meta = (user?.user_metadata ?? {}) as { avatar_url?: string; picture?: string };

  // Signed-in: once the fetch SUCCEEDS the cloud profile is authoritative — a null column means
  // "unset" (default theme), never "reuse the cached value", or a fresh account would inherit the
  // previous one's theme. The local store is only the in-flight / failed-fetch fallback, so a
  // reload still paints the last theme instantly instead of flashing default.
  const cloudResolved = signedIn && cloud.isSuccess;
  const theme: ThemeId = cloudResolved
    ? normalizeTheme(cloud.data.theme)
    : normalizeTheme(localTheme);

  const averageMonthlySalary = cloudResolved ? (cloud.data.averageSalary ?? "") : localSalary;

  // Setup completion belongs to the ACCOUNT (a signed-in user must never be asked twice, on any
  // device). The local flag is the guest's own value and, while the query is in flight, an
  // optimistic cache so a reload doesn't flash the setup splash.
  const onboardingComplete = cloudResolved ? cloud.data.onboardingComplete : localOnboarded;

  return {
    displayName: signedIn ? (cloud.data?.displayName ?? "") : localName,
    email: user?.email ?? null,
    avatarUrl: meta.avatar_url ?? meta.picture ?? null,
    signedIn,
    // Guests have no cloud profile; signed-in waits for the first fetch to settle (success or error).
    profileLoaded: signedIn ? cloud.isFetched : true,
    theme,
    averageMonthlySalary,
    onboardingComplete,
    setDisplayName: async (name) => {
      if (signedIn) {
        await setProfileName(supabase!, user!.id, name);
        await queryClient.invalidateQueries({ queryKey: ["profile"] });
      } else {
        setLocalName(name);
      }
    },
    setTheme: async (next) => {
      // Always warm the local store (guest storage + a cache for the next reload); when signed in,
      // also persist to the cloud profile so the choice follows the user to other devices.
      setLocalTheme(next);
      if (signedIn) {
        await setProfileTheme(supabase!, user!.id, next);
        await queryClient.invalidateQueries({ queryKey: ["profile"] });
      }
    },
    setAverageMonthlySalary: async (value) => {
      setLocalSalary(value);
      if (signedIn) {
        await setProfileSalary(supabase!, user!.id, value);
        await queryClient.invalidateQueries({ queryKey: ["profile"] });
      }
    },
    setOnboardingComplete: async (done) => {
      setLocalOnboarded(done);
      if (signedIn) {
        await setProfileOnboardingComplete(supabase!, user!.id, done);
        await queryClient.invalidateQueries({ queryKey: ["profile"] });
      }
    },
  };
}
