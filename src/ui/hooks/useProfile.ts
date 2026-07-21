import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../../infrastructure/supabase/client";
import {
  getProfileName,
  setProfileName,
} from "../../infrastructure/persistence/supabase/repositories";
import { useSettingsStore } from "../../state/settingsStore";
import { useAuth } from "../auth/authContext";

interface Profile {
  displayName: string;
  email: string | null;
  avatarUrl: string | null;
  signedIn: boolean;
  setDisplayName: (name: string) => Promise<void>;
}

/**
 * Backend-aware profile: name/email/avatar for the header. Signed-in reads/writes the cloud
 * `profiles` table; signed-out uses the local settings store. Email + avatar come from the session.
 */
export function useProfile(): Profile {
  const { user, isCloudEnabled } = useAuth();
  const localName = useSettingsStore((s) => s.displayName);
  const setLocalName = useSettingsStore((s) => s.setDisplayName);
  const queryClient = useQueryClient();
  const signedIn = isCloudEnabled && !!user && !!supabase;

  const cloud = useQuery({
    queryKey: ["profile", user?.id],
    enabled: signedIn,
    queryFn: () => getProfileName(supabase!, user!.id),
  });

  const meta = (user?.user_metadata ?? {}) as { avatar_url?: string; picture?: string };

  return {
    displayName: signedIn ? (cloud.data ?? "") : localName,
    email: user?.email ?? null,
    avatarUrl: meta.avatar_url ?? meta.picture ?? null,
    signedIn,
    setDisplayName: async (name) => {
      if (signedIn) {
        await setProfileName(supabase!, user!.id, name);
        await queryClient.invalidateQueries({ queryKey: ["profile"] });
      } else {
        setLocalName(name);
      }
    },
  };
}
