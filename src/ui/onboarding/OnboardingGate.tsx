import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router";
import { useAuth } from "../auth/authContext";
import { useHasAnyData } from "../hooks/useDashboardData";
import { useProfile } from "../hooks/useProfile";
import { OnboardingSplash } from "./OnboardingLayout";

/**
 * Routes users through first-run setup. Completion is a stored fact on the profile — the cloud
 * `profiles.onboarding_complete` column for a signed-in account, the local settings store for a
 * guest — never something re-derived from whether data happens to exist:
 *   - setup done → straight through
 *   - not done + no data → `/welcome` (signed in) or `/login` (signed out)
 * The data probe survives only as a self-heal for accounts predating the column. `/login` and
 * `/welcome` always render (they ARE the auth / setup flow). Wraps <Routes>.
 */
export function OnboardingGate({ children }: { children: ReactNode }) {
  const { isCloudEnabled, user, authReady, backendReady } = useAuth();
  const { onboardingComplete, setOnboardingComplete, profileLoaded } = useProfile();
  const location = useLocation();
  const healed = useRef(false);

  const path = location.pathname;
  const signedIn = isCloudEnabled && !!user;
  const skip = onboardingComplete;
  // On the OAuth return the React session hydrates a tick after paint, and an in-app sign-in
  // re-points the backend a tick after that — don't make an auth- or data-dependent routing
  // decision until both settle, or we'd flash `/login` or probe the outgoing backend.
  const authResolving = isCloudEnabled && (!authReady || !backendReady);
  const gateActive = !skip && !authResolving && path !== "/login" && path !== "/welcome";
  // `onboardingComplete` reads the local cache until the cloud profile resolves, so a *false* is
  // not yet trustworthy for a signed-in user (an onboarded account with no data would be sent
  // through the wizard again). The probe still runs in parallel — only the decision waits.
  const profileResolving = signedIn && !profileLoaded;

  const { data: hasData, isLoading } = useHasAnyData({ enabled: gateActive });

  // Self-heal for accounts that finished setup before the flag existed: data means setup is done,
  // so record it once (the ref guards the loop — useProfile's setters are fresh closures each render).
  useEffect(() => {
    if (hasData === true && !healed.current) {
      healed.current = true;
      void setOnboardingComplete(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasData]);

  // The login screen: signed-in users don't belong here.
  if (path === "/login") {
    return signedIn ? <Redirect to="/" /> : <>{children}</>;
  }
  // The setup wizard: render for local users AND new signed-in accounts.
  if (path === "/welcome") return <>{children}</>;

  // A cached `true` lets the app in instantly (no splash on a normal reload); only an unresolved
  // `false` has to wait.
  if (skip) return <>{children}</>;
  if (authResolving || profileResolving || isLoading) return <OnboardingSplash />;
  // Send to setup only on a DEFINITIVE "no data" — an errored probe (offline, a transient 401 on
  // the OAuth return) must never be mistaken for a fresh account and hijack the app into the wizard.
  if (hasData === false) return <Redirect to={signedIn ? "/welcome" : "/login"} />;

  return <>{children}</>;
}

/**
 * A redirect that keeps the branded scene on screen while it happens. A bare `<Navigate>` renders
 * NOTHING for the commit it fires on, so the backdrop and the brand mark unmount for a frame — the
 * destination then re-mounts them from scratch and the intro reads as restarting. Rendering the
 * splash alongside keeps the scene continuous and lets the mark hand off on its shared `layoutId`.
 */
function Redirect({ to }: { to: string }) {
  return (
    <>
      <OnboardingSplash />
      <Navigate to={to} replace />
    </>
  );
}
