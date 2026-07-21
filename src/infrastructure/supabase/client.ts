import { createClient } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * The Supabase client, created only when both env vars are present. When they're not,
 * `supabase` is null and `isCloudEnabled` is false — the app runs local-only and the
 * cloud/auth UI stays hidden. Only the anon (public) key is used here; Row-Level Security
 * enforces per-user access, so shipping it in the client bundle is expected and safe.
 */
const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isCloudEnabled = Boolean(url && anonKey);

export const supabase: SupabaseClient | null = isCloudEnabled
  ? createClient(url!, anonKey!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        // PKCE returns OAuth via a ?code= param (auto-exchanged + cleaned) instead of a
        // #access_token hash — no stray "#" left in the URL.
        flowType: "pkce",
      },
    })
  : null;
