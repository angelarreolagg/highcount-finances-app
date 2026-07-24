import { createContext, useContext } from "react";
import type { Session, User } from "@supabase/supabase-js";

export interface AuthContextValue {
  /** Whether Supabase env is configured at all (else the app is local-only). */
  isCloudEnabled: boolean;
  /** True once the initial session has loaded (always true when cloud is disabled). */
  authReady: boolean;
  /**
   * False while the active backend is being re-pointed at a new session. Repositories are a live
   * binding (`di/container.ts`), so anything that reads data — or routes based on it — must wait,
   * or it would query the outgoing backend (e.g. the empty local store right after a sign-in).
   */
  backendReady: boolean;
  session: Session | null;
  user: User | null;
  signInWithGoogle: () => Promise<void>;
  signInWithPassword: (email: string, password: string) => Promise<void>;
  signUpWithPassword: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
