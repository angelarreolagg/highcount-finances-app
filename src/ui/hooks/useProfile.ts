import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../../infrastructure/supabase/client";
import {
  getProfile,
  setProfileName,
  setProfileTheme,
  setProfileSalary,
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
  setDisplayName: (name: string) => Promise<void>;
  setTheme: (theme: ThemeId) => Promise<void>;
  setAverageMonthlySalary: (value: string) => Promise<void>;
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
  const queryClient = useQueryClient();
  const signedIn = isCloudEnabled && !!user && !!supabase;

  const cloud = useQuery({
    queryKey: ["profile", user?.id],
    enabled: signedIn,
    queryFn: () => getProfile(supabase!, user!.id),
  });

  const meta = (user?.user_metadata ?? {}) as { avatar_url?: string; picture?: string };

  // Signed-in: prefer the cloud theme once loaded, falling back to the local store while the query
  // is in flight — so a reload paints the last theme instantly instead of flashing default.
  const theme: ThemeId = signedIn
    ? normalizeTheme(cloud.data?.theme ?? localTheme)
    : normalizeTheme(localTheme);

  // Signed-in: prefer the cloud value once loaded, falling back to the local store while in flight.
  const averageMonthlySalary = signedIn ? (cloud.data?.averageSalary ?? localSalary) : localSalary;

  return {
    displayName: signedIn ? (cloud.data?.displayName ?? "") : localName,
    email: user?.email ?? null,
    avatarUrl: meta.avatar_url ?? meta.picture ?? null,
    signedIn,
    // Guests have no cloud profile; signed-in waits for the first fetch to settle (success or error).
    profileLoaded: signedIn ? cloud.isFetched : true,
    theme,
    averageMonthlySalary,
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
  };
}
