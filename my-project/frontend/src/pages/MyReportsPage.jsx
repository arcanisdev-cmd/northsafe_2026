import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ClipboardList, Clock, CheckCircle, Ban, Search, Plus } from "lucide-react";

import AuthNavbar from "../layouts/AuthNavbar";
import Footer from "../layouts/Footer";
import StatCard from "../components/StatCard";
import HazardReportCard from "../components/HazardReportCard";
import ReportStatusTimeline from "../components/ReportStatusTimeline";

import { hazardTypes, barangayOptions, reportStatuses } from "../components/data/MockDashboardData";
import {
  getReportStats,
  getDefaultSelectedReport,
  filterMyReports,
  paginate,
  getTotalPages,
  isVerified,
} from "../utils/reportSelectors";

const PAGE_SIZE = 3;

function clearStoredAuth() {
  localStorage.removeItem("northsafe_token");
  localStorage.removeItem("northsafe_user");
  sessionStorage.removeItem("northsafe_token");
  sessionStorage.removeItem("northsafe_user");
}

function formatDateTime(date) {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const year = date.getFullYear();
  const hours24 = date.getHours();
  const hours12 = hours24 % 12 || 12;
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const suffix = hours24 >= 12 ? "PM" : "AM";

  return `${month}/${day}/${year} ${String(hours12).padStart(2, "0")}:${minutes}${suffix}`;
}

function formatTimeAgo(dateValue) {
  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "just now";
  }

  const minutes = Math.max(1, Math.round((Date.now() - date.getTime()) / 60000));

  if (minutes < 60) {
    return `${minutes} min${minutes === 1 ? "" : "s"} ago`;
  }

  const hours = Math.round(minutes / 60);
  if (hours < 24) {
    return `${hours} hr${hours === 1 ? "" : "s"} ago`;
  }

  const days = Math.round(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

function deriveAlertLevel(report) {
  const status = String(report.status ?? "pending").toLowerCase();

  if (status === "rejected") {
    return "white";
  }

  if (status === "resolved") {
    return "red";
  }

  return "blue";
}

function normalizeReport(report) {
  const createdAt = report.createdAt ?? report.created_at ?? new Date().toISOString();
  const createdDate = new Date(createdAt);
  const statusHistory = Array.isArray(report.statusHistory)
    ? report.statusHistory.map((entry) => ({
        status: entry.status,
        timestamp: entry.timestamp,
        remarks: entry.remarks ?? null,
      }))
    : [];

  return {
    ...report,
    reporterId: report.reporterId ?? report.user_id ?? null,
    reporterName: report.reporterName ?? report.userName ?? "NorthSafe User",
    timeAgo: report.timeAgo ?? formatTimeAgo(createdDate),
    alertLevel: report.alertLevel ?? deriveAlertLevel(report),
    title: report.title ?? "Untitled Report",
    description: report.description ?? "",
    address: report.address ?? report.locationName ?? report.location_name ?? "",
    dateTime: report.dateTime ?? formatDateTime(createdDate),
    hazardType: report.hazardType ?? report.hazard_type ?? "",
    barangay: report.barangay ?? null,
    lat: report.lat ?? report.latitude ?? null,
    lng: report.lng ?? report.longitude ?? null,
    statusHistory,
    upvotes: report.upvotes ?? 0,
    downvotes: report.downvotes ?? 0,
    comments: report.comments ?? 0,
    imageSrc: report.imageSrc ?? report.imageUrl ?? null,
    status: report.status ?? "Pending",
    createdAt: report.createdAt ?? createdDate.toISOString(),
  };
}

function MyReportsPage() {
  const navigate = useNavigate();
  const apiBaseUrl = import.meta.env.VITE_API_URL ?? "";
  const [myReports, setMyReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [search, setSearch] = useState("");
  const [barangay, setBarangay] = useState("");
  const [hazardType, setHazardType] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("northsafe_token") ?? sessionStorage.getItem("northsafe_token");

    if (!token) {
      navigate("/signin");
      return;
    }

    const controller = new AbortController();

    async function loadReports() {
      setIsLoading(true);
      setLoadError("");

      try {
        const response = await fetch(`${apiBaseUrl}/api/reports/mine`, {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
          signal: controller.signal,
        });

        const data = await response.json();

        if (response.status === 401) {
          clearStoredAuth();
          navigate("/signin");
          return;
        }

        if (!response.ok) {
          setLoadError(data?.message ?? "Unable to load your reports.");
          return;
        }

        const normalizedReports = (data?.reports ?? []).map(normalizeReport);
        setMyReports(normalizedReports);
        setSelectedReport(getDefaultSelectedReport(normalizedReports));
      } catch (error) {
        if (error.name !== "AbortError") {
          setLoadError("Unable to load your reports.");
        }
      } finally {
        setIsLoading(false);
      }
    }

    loadReports();

    return () => controller.abort();
  }, [apiBaseUrl, navigate]);

  const stats = useMemo(() => getReportStats(myReports), [myReports]);

  const filteredReports = useMemo(
    () =>
      filterMyReports(myReports, {
        search,
        barangay: barangay ? Number(barangay) : "",
        hazardType,
        status,
      }),
    [myReports, search, barangay, hazardType, status]
  );

  const totalPages = getTotalPages(filteredReports.length, PAGE_SIZE);
  const visibleReports = paginate(filteredReports, page, PAGE_SIZE);

  const statCards = [
    { icon: ClipboardList, label: "Total Reports", value: stats.total, color: "#0BA6DF" },
    { icon: Clock, label: "Pending", value: stats.pending, color: "#F29D38" },
    { icon: CheckCircle, label: "Resolved", value: stats.resolved, color: "#22A559" },
    { icon: Ban, label: "Rejected", value: stats.rejected, color: "#D30004" },
  ];

  const selectClass =
    "h-11 rounded-lg border border-gray-300 bg-white px-4 text-[14px] text-gray-700 outline-none";

  return (
    <div>
      <div className="mx-auto" style={{ maxWidth: "1532px" }}>
        <AuthNavbar />

        {/* No manual spacer needed here — AuthNavbar now measures its own
            height and renders a matching spacer internally. */}

        <div style={{ backgroundColor: "#E8F4FF", paddingLeft: "108px", paddingRight: "108px" }} className="py-8">
          <div className="flex gap-5">
            {statCards.map((s) => (
              <StatCard key={s.label} {...s} />
            ))}
          </div>

          <div className="flex items-center justify-between mt-8">
            <h2 className="font-krub font-bold text-xl" style={{ color: "#6A6A6A" }}>
              Submitted Reports
            </h2>

            <Link
              to="/report-hazard"
              className="flex items-center gap-2 rounded-lg text-white font-inter font-bold text-sm justify-center"
              style={{ width: "220px", height: "43px", backgroundColor: "#F29D38" }}
            >
              <Plus size={16} />
              Report a Hazard
            </Link>
          </div>

          <div className="flex items-center gap-3 mt-4">
            <div
              className="flex items-center gap-2 bg-white rounded-lg px-4 flex-1"
              style={{ height: "43px", border: "1px solid #A3A3A3" }}
            >
              <Search size={16} className="text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Search ..."
                className="flex-1 text-sm bg-transparent outline-none min-w-0"
              />
            </div>

            <select
              value={barangay}
              onChange={(e) => {
                setBarangay(e.target.value);
                setPage(1);
              }}
              className={selectClass}
            >
              <option value="">Barangay</option>
              {barangayOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

            <select
              value={hazardType}
              onChange={(e) => {
                setHazardType(e.target.value);
                setPage(1);
              }}
              className={selectClass}
            >
              <option value="">Category</option>
              {hazardTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>

            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className={selectClass}
            >
              <option value="">Hazard Status</option>
              {reportStatuses.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-5 mt-6 items-start">
            <div className="flex-1 flex flex-col gap-5">
              {isLoading ? (
                <div className="bg-white rounded-2xl p-10 text-center text-gray-400 text-sm">
                  Loading your reports...
                </div>
              ) : loadError ? (
                <div className="bg-white rounded-2xl p-10 text-center text-red-500 text-sm">
                  {loadError}
                </div>
              ) : visibleReports.length === 0 ? (
                <div className="bg-white rounded-2xl p-10 text-center text-gray-400 text-sm">
                  No reports match these filters yet.
                </div>
              ) : (
                visibleReports.map((report) => (
                  <HazardReportCard
                    key={report.id}
                    reporterName={report.reporterName}
                    timeAgo={report.timeAgo}
                    alertLevel={report.alertLevel}
                    hazardType={report.hazardType}
                    title={report.title}
                    description={report.description}
                    address={report.address}
                    dateTime={report.dateTime}
                    verified={isVerified(report)}
                    upvotes={report.upvotes}
                    downvotes={report.downvotes}
                    comments={report.comments}
                    imageSrc={report.imageSrc}
                    width="100%"
                    buttonColor="#081435"
                    onClick={() => setSelectedReport(report)}
                    onViewHazardMap={() => navigate("/hazard-map", { state: { focusReportId: report.id } })}
                  />
                ))
              )}

              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-2">
                  <button
                    type="button"
                    disabled={page === 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="h-8 w-8 flex items-center justify-center rounded-full text-gray-500 disabled:opacity-30"
                  >
                    &lsaquo;
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setPage(n)}
                      className="h-8 w-8 flex items-center justify-center rounded-full text-[13px]"
                      style={{
                        backgroundColor: n === page ? "#081435" : "transparent",
                        color: n === page ? "#FFFFFF" : "#6A6A6A",
                        fontWeight: n === page ? 700 : 400,
                      }}
                    >
                      {n}
                    </button>
                  ))}
                  <button
                    type="button"
                    disabled={page === totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    className="h-8 w-8 flex items-center justify-center rounded-full text-gray-500 disabled:opacity-30"
                  >
                    &rsaquo;
                  </button>
                </div>
              )}
            </div>

            <div className="sticky" style={{ top: "100px" }}>
              <ReportStatusTimeline report={selectedReport} />
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </div>
  );
}

export default MyReportsPage;
