import type { Session } from "@supabase/supabase-js";
import { copyDataset } from "../../infrastructure/backup";
import {
  createIndexedDbRepositories,
  initializeBackend,
  setBackend,
} from "../../infrastructure/di/container";
import { supabase } from "../../infrastructure/supabase/client";
import {
  createSupabaseRepositories,
  isBootstrapped,
  markBootstrapped,
} from "../../infrastructure/persistence/supabase/repositories";

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
    await initializeBackend(); // seed default categories + Cash account for a new account

    // First sign-in to a fresh account: copy the existing local dataset up, once.
    if (!(await isBootstrapped(supabase, userId))) {
      await copyDataset(createIndexedDbRepositories(), cloud);
      await markBootstrapped(supabase, userId);
    }
    return;
  }

  setBackend(createIndexedDbRepositories());
  await initializeBackend();
}
