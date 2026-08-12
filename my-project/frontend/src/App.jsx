import { Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import SignupPage from "./pages/SignupPage";
import DashboardPage from "./pages/DashboardPage";
import HazardMapPage from "./pages/HazardMapPage";
import MyReportsPage from "./pages/MyReportsPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/hazard-map" element={<HazardMapPage />} />
      <Route path="/my-reports" element={<MyReportsPage />} />
    </Routes>
  );
}

export default App;