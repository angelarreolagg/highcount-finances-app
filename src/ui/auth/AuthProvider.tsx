import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useNavigate } from "react-router";
import type { Session } from "@supabase/supabase-js";
import { getActiveUserId } from "../../infrastructure/di/container";
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
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  // With cloud disabled there's no session to load, so we're hydrated from the start.
  const [hydrated, setHydrated] = useState(() => !supabase);

  useEffect(() => {
    if (!supabase) return;
    void supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setHydrated(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => setSession(next));
    return () => sub.subscription.unsubscribe();
  }, []);

  const userId = session?.user.id ?? null;
  useEffect(() => {
    // Wait for the initial session to load; React's session starts null, so acting earlier
    // would mis-fire a "sign-out".
    if (!supabase || !hydrated) return;
    // If the live backend already matches this session, there's nothing to do. This is exactly
    // the OAuth-return case (bootstrap already activated it) — skipping avoids the redundant
    // queryClient.clear() whose refetch would deadlock against Supabase's still-held auth lock.
    if (userId === getActiveUserId()) return;

    let cancelled = false;
    // Defer off the auth-event tick (Supabase deadlock avoidance) before touching the client.
    const timer = setTimeout(() => {
      void (async () => {
        try {
          await activateBackendForSession(session);
        } catch (error) {
          console.error("Backend activation failed.", error);
        }
        if (cancelled) return;
        queryClient.clear();
        // On sign-out, deterministically land on the login screen.
        if (!userId) navigate("/login", { replace: true });
      })();
    }, 0);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
    // Re-activate only when the signed-in identity changes — not on token refreshes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, userId]);

  const value = useMemo<AuthContextValue>(
    () => ({
      isCloudEnabled,
      authReady: hydrated,
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
        // emailRedirectTo brings the confirmation link back into the running app, where the
        // hydrated session lets OnboardingGate route the new (data-less) user into /welcome.
        // The origin must be listed under Supabase → Authentication → URL Configuration.
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) throw new Error(error.message);
      },
      signOut: async () => {
        if (!supabase) return;
        const { error } = await supabase.auth.signOut();
        if (error) throw new Error(error.message);
      },
    }),
    [session, hydrated],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
