import { useEffect } from "react";
import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router";
import { useSettingsStore } from "../../state/settingsStore";
import { useAuth } from "../auth/authContext";
import { useHasAnyData } from "../hooks/useDashboardData";
import { OnboardingSplash } from "./OnboardingLayout";

/**
 * Redirects first-run users (signed out, no data, not yet onboarded) to `/welcome`.
 * Returning users, users with any data, and signed-in users pass straight through with
 * zero overhead. Wraps the router's <Routes>.
 */
export function OnboardingGate({ children }: { children: ReactNode }) {
  const { isCloudEnabled, user } = useAuth();
  const onboardingComplete = useSettingsStore((s) => s.onboardingComplete);
  const setOnboardingComplete = useSettingsStore((s) => s.setOnboardingComplete);
  const location = useLocation();

  const signedIn = isCloudEnabled && !!user;
  const skip = onboardingComplete || signedIn;

  const { data: hasData, isLoading } = useHasAnyData({ enabled: !skip });

  // An existing user (has data but never went through onboarding) is marked complete silently.
  useEffect(() => {
    if (!skip && !isLoading && hasData) setOnboardingComplete(true);
  }, [skip, isLoading, hasData, setOnboardingComplete]);

  if (!skip) {
    if (isLoading) return <OnboardingSplash />;
    if (hasData === false && location.pathname !== "/welcome") {
      return <Navigate to="/welcome" replace />;
    }
  }

  return <>{children}</>;
}
