import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import SignupPage from "./pages/SignupPage";
import SignInPage from "./pages/SignInPage";
import DashboardPage from "./pages/DashboardPage";
import HazardMapPage from "./pages/HazardMapPage";
import MyReportsPage from "./pages/MyReportsPage";
import ReportHazardPage from "./pages/ReportHazardPage";

function RequireAuth({ children }) {
  const location = useLocation();
  const token = localStorage.getItem("northsafe_token") ?? sessionStorage.getItem("northsafe_token");

  if (!token) {
    return <Navigate to="/signin" replace state={{ from: location }} />;
  }

  return children;
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/signin" element={<SignInPage />} />
      <Route
        path="/dashboard"
        element={(
          <RequireAuth>
            <DashboardPage />
          </RequireAuth>
        )}
      />
      <Route
        path="/hazard-map"
        element={(
          <RequireAuth>
            <HazardMapPage />
          </RequireAuth>
        )}
      />
      <Route
        path="/my-reports"
        element={(
          <RequireAuth>
            <MyReportsPage />
          </RequireAuth>
        )}
      />
      <Route path="/report-hazard" element={<ReportHazardPage />} />
    </Routes>
  );
}

export default App;