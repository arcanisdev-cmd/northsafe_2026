import { Routes, Route } from "react-router-dom";
import { StaffReportsProvider } from "./utils/StaffReportsContext.jsx";
import LandingPage from "./pages/LandingPage";
import SignupPage from "./pages/SignupPage";
import SignInPage from "./pages/SigninPage";
import DashboardPage from "./pages/DashboardPage";
import HazardMapPage from "./pages/HazardMapPage";
import MyReportsPage from "./pages/MyReportsPage";
import ReportHazardPage from "./pages/ReportHazardPage";
import ProfilePage from "./pages/ProfilePage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import AdminHazardReportsPage from "./pages/AdminHazardReportsPage";
import AdminAIClassificationPage from "./pages/AdminAIClassificationPage";
import AdminHazardMapPage from "./pages/AdminHazardMapPage";
import AdminAnalyticsPage from "./pages/AdminAnalyticsPage";
import AdminAnnouncementsPage from "./pages/AdminAnnouncementsPage";
import AdminUserManagementPage from "./pages/AdminUserManagementPage";
import AdminAuditLogsPage from "./pages/AdminAuditLogsPage";
import StaffDashboardPage from "./pages/StaffDashboardPage";
import StaffReviewQueuePage from "./pages/StaffReviewQueuePage";
import StaffReportDetailPage from "./pages/StaffReportDetailPage";
import StaffInProgressPage from "./pages/StaffInProgressPage";
import StaffFieldChecksPage from "./pages/StaffFieldChecksPage";
import StaffResolvedReportsPage from "./pages/StaffResolvedReportsPage";
import StaffMapMonitorPage from "./pages/StaffMapMonitorPage";
import StaffAnalyticsPage from "./pages/StaffAnalyticsPage";
import StaffNotificationsPage from "./pages/StaffNotificationsPage";

function App() {
  return (
    <StaffReportsProvider>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/hazard-map" element={<HazardMapPage />} />
        <Route path="/my-reports" element={<MyReportsPage />} />
        <Route path="/report-hazard" element={<ReportHazardPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/admin" element={<AdminDashboardPage />} />
        <Route path="/admin/hazard-reports" element={<AdminHazardReportsPage />} />
        <Route path="/admin/ai-logs" element={<AdminAIClassificationPage />} />
        <Route path="/admin/map" element={<AdminHazardMapPage />} />
        <Route path="/admin/analytics" element={<AdminAnalyticsPage />} />
        <Route path="/admin/announcements" element={<AdminAnnouncementsPage />} />
        <Route path="/admin/users" element={<AdminUserManagementPage />} />
        <Route path="/admin/audit-logs" element={<AdminAuditLogsPage />} />
        <Route path="/staff/review-queue" element={<StaffReviewQueuePage />} />
        <Route path="/staff/review-queue/:id" element={<StaffReportDetailPage />} />
                <Route path="/staff/in-progress" element={<StaffInProgressPage />} />
        <Route path="/staff/field-checks" element={<StaffFieldChecksPage />} />
        <Route path="/staff/resolved" element={<StaffResolvedReportsPage />} />
                <Route path="/staff/notifications" element={<StaffNotificationsPage />} />
        <Route path="/staff/*" element={<StaffDashboardPage />} />
        <Route path="/staff/map" element={<StaffMapMonitorPage />} />
        <Route path="/staff/analytics" element={<StaffAnalyticsPage />} />
      </Routes>
    </StaffReportsProvider>
  );
}

export default App;