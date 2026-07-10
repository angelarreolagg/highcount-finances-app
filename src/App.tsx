import { Route, Routes } from "react-router";
import { AnnualSummaryPage } from "./ui/pages/AnnualSummaryPage";
import { ExpensesPage } from "./ui/pages/ExpensesPage";
import { HomePage } from "./ui/pages/HomePage";
import { SavingsPage } from "./ui/pages/SavingsPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/expenses" element={<ExpensesPage />} />
      <Route path="/savings" element={<SavingsPage />} />
      <Route path="/summary/:year" element={<AnnualSummaryPage />} />
    </Routes>
  );
}

export default App;
