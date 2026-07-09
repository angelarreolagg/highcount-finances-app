import { Route, Routes } from "react-router";
import { AnnualSummaryPage } from "./ui/pages/AnnualSummaryPage";
import { DashboardPage } from "./ui/pages/DashboardPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<DashboardPage />} />
      <Route path="/summary/:year" element={<AnnualSummaryPage />} />
    </Routes>
  );
}

export default App;
