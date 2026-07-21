/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Supabase project URL. Unset → cloud disabled, app runs local-only. */
  readonly VITE_SUPABASE_URL?: string;
  /** Supabase anon/public key (safe in the client; RLS enforces per-user access). */
  readonly VITE_SUPABASE_ANON_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
