import { Route, Routes } from "react-router";
import { AnnualSummaryPage } from "./ui/pages/AnnualSummaryPage";
import { ExpensesPage } from "./ui/pages/ExpensesPage";
import { HomePage } from "./ui/pages/HomePage";
import { SavingsPage } from "./ui/pages/SavingsPage";
import { SettingsPage } from "./ui/pages/SettingsPage";
import { OnboardingGate } from "./ui/onboarding/OnboardingGate";
import { OnboardingPage } from "./ui/onboarding/OnboardingPage";

function App() {
  return (
    <OnboardingGate>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/expenses" element={<ExpensesPage />} />
        <Route path="/savings" element={<SavingsPage />} />
        <Route path="/summary/:year" element={<AnnualSummaryPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/welcome" element={<OnboardingPage />} />
      </Routes>
    </OnboardingGate>
  );
}

export default App;
