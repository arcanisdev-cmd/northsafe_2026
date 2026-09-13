import { useEffect, useState } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import SignupPage from "./pages/SignupPage";
import SignInPage from "./pages/SignInPage";
import DashboardPage from "./pages/DashboardPage";
import HazardMapPage from "./pages/HazardMapPage";
import MyReportsPage from "./pages/MyReportsPage";
import ReportHazardPage from "./pages/ReportHazardPage";
import ProfilePage from "./pages/ProfilePage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminReports from "./pages/admin/AdminReports";
import AdminUsers from "./pages/admin/AdminUsers";
import Analytics from "./pages/admin/Analytics";
import AuditLogs from "./pages/admin/AuditLogs";
import AdminAnnouncements from "./pages/admin/AdminAnnouncements";

function RequireAuth({ children }) {
  const location = useLocation();
  const token = localStorage.getItem("northsafe_token") ?? sessionStorage.getItem("northsafe_token");

  if (!token) {
    return <Navigate to="/signin" replace state={{ from: location }} />;
  }

  return children;
}

function RequireAdmin({ children }) {
  const location = useLocation();
  const token = localStorage.getItem("northsafe_token") ?? sessionStorage.getItem("northsafe_token");
  const [state, setState] = useState({ loading: Boolean(token), user: null });

  useEffect(() => {
    if (!token) return;

    const controller = new AbortController();
    fetch(`${import.meta.env.VITE_API_URL ?? ""}/api/me`, {
      headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
      signal: controller.signal,
    })
      .then(async (response) => {
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data?.message ?? "Unable to verify administrator access.");
        }

        setState({ loading: false, user: data.user ?? null });
        localStorage.setItem("northsafe_user", JSON.stringify(data.user));
        sessionStorage.setItem("northsafe_user", JSON.stringify(data.user));
      })
      .catch((error) => {
        if (error.name === "AbortError") return;

        localStorage.removeItem("northsafe_token");
        localStorage.removeItem("northsafe_user");
        sessionStorage.removeItem("northsafe_token");
        sessionStorage.removeItem("northsafe_user");
        setState({ loading: false, user: null });
      });

    return () => controller.abort();
  }, [token]);

  if (!token) return <Navigate to="/signin" replace state={{ from: location }} />;
  if (state.loading) return <div className="flex min-h-screen items-center justify-center">Verifying access...</div>;
  if (state.user?.role !== "admin") return <Navigate to="/dashboard" replace />;

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
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/admin" element={<RequireAdmin><AdminDashboard /></RequireAdmin>} />
      <Route path="/admin/reports" element={<RequireAdmin><AdminReports /></RequireAdmin>} />
      <Route path="/admin/users" element={<RequireAdmin><AdminUsers /></RequireAdmin>} />
      <Route path="/admin/analytics" element={<RequireAdmin><Analytics /></RequireAdmin>} />
      <Route path="/admin/audit-logs" element={<RequireAdmin><AuditLogs /></RequireAdmin>} />
      <Route path="/admin/announcements" element={<RequireAdmin><AdminAnnouncements /></RequireAdmin>} />
    </Routes>
  );
}

export default App;