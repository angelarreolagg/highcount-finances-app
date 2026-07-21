import {
  createIndexedDbRepositories,
  initializeBackend,
  setBackend,
} from "../../infrastructure/di/container";
import { supabase } from "../../infrastructure/supabase/client";
import { activateBackendForSession } from "./backend";

/**
 * Resolve and activate the correct backend BEFORE the first render (awaited in main.tsx),
 * so a returning signed-in user sees cloud data immediately with no local-then-cloud flash.
 * Never rejects: a cloud hiccup at startup falls back to the local store so the app always
 * renders instead of hanging on a blank screen.
 */
export async function bootstrapBackend(): Promise<void> {
  try {
    if (!supabase) {
      await initializeBackend();
      return;
    }
    const { data } = await supabase.auth.getSession();
    await activateBackendForSession(data.session);
  } catch (error) {
    console.error("Backend bootstrap failed; falling back to local.", error);
    try {
      setBackend(createIndexedDbRepositories());
      await initializeBackend();
    } catch {
      /* Even local seeding failed — render anyway; the UI shows its own loading/empty states. */
    }
  }
}
