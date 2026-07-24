import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useNavigate } from "react-router";
import type { Session } from "@supabase/supabase-js";
import { getActiveUserId } from "../../infrastructure/di/container";
import { queryClient } from "../../infrastructure/queryClient";
import { isCloudEnabled, supabase } from "../../infrastructure/supabase/client";
import { useBackendStore } from "../../state/backendStore";
import { useSettingsStore } from "../../state/settingsStore";
import { COVER_FADE_MS, useThemeTransitionStore } from "../../state/themeTransitionStore";
import { AuthContext } from "./authContext";
import type { AuthContextValue } from "./authContext";
import { activateBackendForSession } from "./backend";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

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
  // `bootstrapBackend()` already activated the initial session before first render, so the backend
  // starts in sync; it only goes out of sync while an in-app auth change is being applied.
  const backendReady = useBackendStore((s) => s.ready);
  const setBackendReady = useBackendStore((s) => s.setReady);

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
    // Also re-raises the flag if a previous activation was cancelled by this very re-run (A → out →
    // A in quick succession), which would otherwise leave the app stuck behind the splash.
    if (userId === getActiveUserId()) {
      setBackendReady(true);
      return;
    }

    // The live `repositories` binding still points at the OUTGOING session from here until
    // activation finishes — hold off every data read (and any routing decision made from one).
    setBackendReady(false);
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
        setBackendReady(true);
        // On sign-out, deterministically land on the login screen. The persisted settings are the
        // *local* (guest) identity — wipe them so the account's theme / name / salary / onboarding
        // flag can't bleed into whoever signs in next. Done here rather than in the `signOut`
        // action so an expired session or another tab's sign-out is covered too.
        if (!userId) {
          useSettingsStore.getState().reset();
          navigate("/login", { replace: true });
        }
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
      backendReady,
      session,
      user: session?.user ?? null,
      signInWithGoogle: async () => {
        if (!supabase) return;
        // Flag the pending OAuth so ThemeTransition can cover the theme fetch on the return load
        // (a full page reload, otherwise indistinguishable from a normal reload).
        sessionStorage.setItem("highcount:oauth-pending", "1");
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
        // Raise the cover BEFORE dropping the session: losing the session flips the premium theme
        // back to default and clears the query cache, so everything from here to the /login mount
        // must happen underneath. The cover lifts once /login is up (see ThemeTransition).
        useThemeTransitionStore.getState().startCover(true, "/login");
        await sleep(COVER_FADE_MS);
        const { error } = await supabase.auth.signOut();
        if (error) {
          useThemeTransitionStore.getState().endCover();
          throw new Error(error.message);
        }
      },
    }),
    [session, hydrated, backendReady],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
