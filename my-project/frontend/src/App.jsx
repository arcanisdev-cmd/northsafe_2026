import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { StaffReportsProvider } from "./utils/StaffReportsContext.jsx";
import { RouteFallback } from "./components/LoadingScreen";

// Landing page stays a normal import so the home page paints immediately.
import LandingPage from "./pages/LandingPage";

// Every other page is lazy-loaded. Suspense + RouteFallback shows the
// loading screen automatically while a page's code is being fetched.
const SignupPage = lazy(() => import("./pages/SignupPage"));
const SignInPage = lazy(() => import("./pages/SigninPage"));
const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const HazardMapPage = lazy(() => import("./pages/HazardMapPage"));
const MyReportsPage = lazy(() => import("./pages/MyReportsPage"));
const ReportHazardPage = lazy(() => import("./pages/ReportHazardPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));

const AdminDashboardPage = lazy(() => import("./pages/AdminDashboardPage"));
const AdminHazardReportsPage = lazy(() => import("./pages/AdminHazardReportsPage"));
const AdminAIClassificationPage = lazy(() => import("./pages/AdminAIClassificationPage"));
const AdminHazardMapPage = lazy(() => import("./pages/AdminHazardMapPage"));
const AdminAnalyticsPage = lazy(() => import("./pages/AdminAnalyticsPage"));
const AdminAnnouncementsPage = lazy(() => import("./pages/AdminAnnouncementsPage"));
const AdminUserManagementPage = lazy(() => import("./pages/AdminUserManagementPage"));
const AdminAuditLogsPage = lazy(() => import("./pages/AdminAuditLogsPage"));

const StaffDashboardPage = lazy(() => import("./pages/StaffDashboardPage"));
const StaffReviewQueuePage = lazy(() => import("./pages/StaffReviewQueuePage"));
const StaffReportDetailPage = lazy(() => import("./pages/StaffReportDetailPage"));
const StaffInProgressPage = lazy(() => import("./pages/StaffInProgressPage"));
const StaffFieldChecksPage = lazy(() => import("./pages/StaffFieldChecksPage"));
const StaffResolvedReportsPage = lazy(() => import("./pages/StaffResolvedReportsPage"));
const StaffMapMonitorPage = lazy(() => import("./pages/StaffMapMonitorPage"));
const StaffAnalyticsPage = lazy(() => import("./pages/StaffAnalyticsPage"));
const StaffNotificationsPage = lazy(() => import("./pages/StaffNotificationsPage"));

function App() {
  return (
    <StaffReportsProvider>
      <Suspense fallback={<RouteFallback />}>
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
      </Suspense>
    </StaffReportsProvider>
  );
}

export default App;