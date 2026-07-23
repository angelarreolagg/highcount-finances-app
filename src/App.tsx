import { Route, Routes } from "react-router";
import { AnnualSummaryPage } from "./ui/pages/AnnualSummaryPage";
import { ExpensesPage } from "./ui/pages/ExpensesPage";
import { HomePage } from "./ui/pages/HomePage";
import { SavingsPage } from "./ui/pages/SavingsPage";
import { SettingsPage } from "./ui/pages/SettingsPage";
import { LoginPage } from "./ui/auth/LoginPage";
import { OnboardingGate } from "./ui/onboarding/OnboardingGate";
import { OnboardingPage } from "./ui/onboarding/OnboardingPage";
import { ThemeTransition } from "./ui/theme/ThemeTransition";
import { useApplyTheme } from "./ui/theme/useApplyTheme";

/**
 * Plain routes — tab navigation is instant (no whole-page transition). The auth flow animates
 * via each page's own entrance: `/login` fades in (logout), and the dashboard's staged build
 * plays on sign-in. A future React Native / Expo port would use the navigator's screen transitions.
 */
function App() {
  // Keeps <html data-theme> in sync with the selected (and eligibility-gated) color theme.
  useApplyTheme();
  return (
    <>
      <ThemeTransition />
      <OnboardingGate>
        <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/expenses" element={<ExpensesPage />} />
        <Route path="/savings" element={<SavingsPage />} />
        <Route path="/summary/:year" element={<AnnualSummaryPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/welcome" element={<OnboardingPage />} />
        </Routes>
      </OnboardingGate>
    </>
  );
}

export default App;
