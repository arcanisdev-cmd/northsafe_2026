import { Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import SignupPage from "./pages/SignupPage";
import SignInPage from "./pages/SignInPage";
import DashboardPage from "./pages/DashboardPage";
import HazardMapPage from "./pages/HazardMapPage";
import MyReportsPage from "./pages/MyReportsPage";
import ReportHazardPage from "./pages/ReportHazardPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/signin" element={<SignInPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/hazard-map" element={<HazardMapPage />} />
      <Route path="/my-reports" element={<MyReportsPage />} />
      <Route path="/report-hazard" element={<ReportHazardPage />} />
    </Routes>
  );
}

export default App;