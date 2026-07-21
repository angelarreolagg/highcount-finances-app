import { useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";
import { queryClient } from "../../infrastructure/queryClient";
import { isCloudEnabled, supabase } from "../../infrastructure/supabase/client";
import { AuthContext } from "./authContext";
import type { AuthContextValue } from "./authContext";
import { activateBackendForSession } from "./backend";

/**
 * Tracks the Supabase session and re-points the active backend on sign in / out
 * (then clears the query cache so local and cloud data never bleed together). The
 * startup `bootstrapBackend()` already activated the initial session, so the first
 * observation here is skipped. Safe no-op when cloud is disabled.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const seenInitial = useRef(false);

  useEffect(() => {
    if (!supabase) return;
    void supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => setSession(next));
    return () => sub.subscription.unsubscribe();
  }, []);

  const userId = session?.user.id ?? null;
  useEffect(() => {
    if (!supabase) return;
    if (!seenInitial.current) {
      // Startup bootstrap already activated the initial backend — don't redo it.
      seenInitial.current = true;
      return;
    }
    let cancelled = false;
    void (async () => {
      try {
        await activateBackendForSession(session);
      } catch (error) {
        console.error("Backend activation failed.", error);
      }
      if (!cancelled) queryClient.clear();
    })();
    return () => {
      cancelled = true;
    };
    // Re-activate only when the signed-in identity changes — not on token refreshes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const value = useMemo<AuthContextValue>(
    () => ({
      isCloudEnabled,
      session,
      user: session?.user ?? null,
      signInWithGoogle: async () => {
        if (!supabase) return;
        const { error } = await supabase.auth.signInWithOAuth({
          provider: "google",
          options: { redirectTo: window.location.origin },
        });
        if (error) throw new Error(error.message);
      },
      signInWithPassword: async (email, password) => {
        if (!supabase) return;
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw new Error(error.message);
      },
      signUpWithPassword: async (email, password) => {
        if (!supabase) return;
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw new Error(error.message);
      },
      signOut: async () => {
        if (!supabase) return;
        const { error } = await supabase.auth.signOut();
        if (error) throw new Error(error.message);
      },
    }),
    [session],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
