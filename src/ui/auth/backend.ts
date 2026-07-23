import type { Session } from "@supabase/supabase-js";
import { copyDataset } from "../../infrastructure/backup";
import {
  createIndexedDbRepositories,
  initializeBackend,
  setActiveUserId,
  setBackend,
} from "../../infrastructure/di/container";
import { supabase } from "../../infrastructure/supabase/client";
import {
  createSupabaseRepositories,
  isBootstrapped,
  markBootstrapped,
  setProfileName,
  setProfileTheme,
} from "../../infrastructure/persistence/supabase/repositories";
import { useSettingsStore } from "../../state/settingsStore";
import { DEFAULT_THEME, normalizeTheme } from "../theme/themes";

/**
 * Point the app's active backend at the right store for the given session:
 *   session present → Supabase (cloud), seeded, with a one-time local→cloud upload
 *   session null    → IndexedDB (local), seeded
 * Idempotent, so it's safe to call on every auth transition and at startup.
 */
export async function activateBackendForSession(session: Session | null): Promise<void> {
  if (session && supabase) {
    const userId = session.user.id;
    const cloud = createSupabaseRepositories(supabase, userId);
    setBackend(cloud);
    setActiveUserId(userId);

    // First sign-in to a fresh account: copy the existing local dataset up (it already includes
    // a seeded Cash account) BEFORE seeding, so we don't end up with a duplicate Cash.
    if (!(await isBootstrapped(supabase, userId))) {
      await copyDataset(createIndexedDbRepositories(), cloud);
      // Carry a locally-set profile name up to the cloud account.
      const localName = useSettingsStore.getState().displayName.trim();
      if (localName) await setProfileName(supabase, userId, localName);
      // Carry a locally-chosen theme up too, so a guest's pick follows them into the account.
      const localTheme = normalizeTheme(useSettingsStore.getState().theme);
      if (localTheme !== DEFAULT_THEME) await setProfileTheme(supabase, userId, localTheme);
      await markBootstrapped(supabase, userId);
    }
    // Seed a default Cash account ONLY if the account is still empty (ensureSeeded is idempotent).
    await initializeBackend();
    return;
  }

  setBackend(createIndexedDbRepositories());
  setActiveUserId(null);
  await initializeBackend();
}
