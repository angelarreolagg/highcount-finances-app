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
  setProfileSalary,
  setProfileOnboardingComplete,
} from "../../infrastructure/persistence/supabase/repositories";
import { useSettingsStore } from "../../state/settingsStore";
import { DEFAULT_THEME, normalizeTheme } from "../theme/themes";

/**
 * Marks that this device's local (guest) dataset + preferences have already been absorbed by a
 * cloud account. Only the FIRST account claims them; later sign-ups start genuinely empty instead
 * of inheriting the previous account's leftovers (which would also skip first-run setup).
 */
const LOCAL_DATASET_CLAIMED_KEY = "highcount:local-dataset-claimed";

export function isLocalDatasetClaimed(): boolean {
  return localStorage.getItem(LOCAL_DATASET_CLAIMED_KEY) !== null;
}

function claimLocalDataset(userId: string): void {
  localStorage.setItem(LOCAL_DATASET_CLAIMED_KEY, userId);
}

/** Release the claim — used after wiping the on-device dataset (account deletion). */
export function clearLocalDatasetClaim(): void {
  localStorage.removeItem(LOCAL_DATASET_CLAIMED_KEY);
}

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
    // a seeded Cash account) BEFORE seeding, so we don't end up with a duplicate Cash. Only the
    // first account to sign in on this device absorbs the guest data + preferences — otherwise a
    // second account would inherit the first one's dataset and theme.
    if (!(await isBootstrapped(supabase, userId))) {
      if (!isLocalDatasetClaimed()) {
        await copyDataset(createIndexedDbRepositories(), cloud);
        // Carry a locally-set profile name up to the cloud account.
        const localName = useSettingsStore.getState().displayName.trim();
        if (localName) await setProfileName(supabase, userId, localName);
        // Carry a locally-chosen theme up too, so a guest's pick follows them into the account.
        const localTheme = normalizeTheme(useSettingsStore.getState().theme);
        if (localTheme !== DEFAULT_THEME) await setProfileTheme(supabase, userId, localTheme);
        // Carry a locally-set average monthly salary up as well.
        const localSalary = useSettingsStore.getState().averageMonthlySalary.trim();
        if (localSalary) await setProfileSalary(supabase, userId, localSalary);
        // A guest who already ran the wizard shouldn't be asked again by their new account.
        if (useSettingsStore.getState().onboardingComplete) {
          await setProfileOnboardingComplete(supabase, userId, true);
        }
        claimLocalDataset(userId);
      }
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
