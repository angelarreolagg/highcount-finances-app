import { useEffect } from "react";
import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router";
import { useSettingsStore } from "../../state/settingsStore";
import { useAuth } from "../auth/authContext";
import { useHasAnyData } from "../hooks/useDashboardData";
import { OnboardingSplash } from "./OnboardingLayout";

/**
 * Routes users through first-run setup based on whether they have any data — for local AND
 * signed-in accounts alike:
 *   - not onboarded + no data → `/welcome` (signed in) or `/login` (signed out)
 *   - has data / already onboarded → straight through
 * `/login` and `/welcome` always render (they ARE the auth / setup flow). Wraps <Routes>.
 */
export function OnboardingGate({ children }: { children: ReactNode }) {
  const { isCloudEnabled, user, authReady } = useAuth();
  const onboardingComplete = useSettingsStore((s) => s.onboardingComplete);
  const setOnboardingComplete = useSettingsStore((s) => s.setOnboardingComplete);
  const location = useLocation();

  const path = location.pathname;
  const signedIn = isCloudEnabled && !!user;
  const skip = onboardingComplete;
  // On the OAuth return the React session hydrates a tick after paint — don't make an
  // auth-dependent routing decision until it's ready, or we'd flash `/login`.
  const authResolving = isCloudEnabled && !authReady;
  const gateActive = !skip && !authResolving && path !== "/login" && path !== "/welcome";

  const { data: hasData, isLoading } = useHasAnyData({ enabled: gateActive });

  // Any data (incl. a signed-in account with cloud data) means setup is done.
  useEffect(() => {
    if (hasData === true) setOnboardingComplete(true);
  }, [hasData, setOnboardingComplete]);

  // The login screen: signed-in users don't belong here.
  if (path === "/login") {
    return signedIn ? <Navigate to="/" replace /> : <>{children}</>;
  }
  // The setup wizard: render for local users AND new signed-in accounts.
  if (path === "/welcome") return <>{children}</>;

  if (skip) return <>{children}</>;
  if (authResolving || isLoading) return <OnboardingSplash />;
  // `true` = has data → continue; otherwise start setup (signed in → wizard, else login).
  if (hasData !== true) return <Navigate to={signedIn ? "/welcome" : "/login"} replace />;

  return <>{children}</>;
}
