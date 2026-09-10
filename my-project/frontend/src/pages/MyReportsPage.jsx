import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ClipboardList, Clock, CheckCircle, Ban, Search, Plus } from "lucide-react";

import AuthNavbar from "../layouts/AuthNavbar";
import Footer from "../layouts/Footer";
import StatCard from "../components/StatCard";
import HazardReportCard from "../components/HazardReportCard";
import ReportStatusTimeline from "../components/ReportStatusTimeline";

import { currentUser, hazardReports, hazardTypes, barangayOptions, reportStatuses } from "../components/data/MockDashboardData";
import {
  getMyReports,
  getReportStats,
  getDefaultSelectedReport,
  filterMyReports,
  paginate,
  getTotalPages,
  isVerified,
} from "../utils/reportSelectors";

const PAGE_SIZE = 3;

function MyReportsPage() {
  const navigate = useNavigate();
  const myReports = useMemo(() => getMyReports(hazardReports, currentUser.id), []);
  const stats = useMemo(() => getReportStats(myReports), [myReports]);

  const [selectedReport, setSelectedReport] = useState(() => getDefaultSelectedReport(myReports));
  const [search, setSearch] = useState("");
  const [barangay, setBarangay] = useState("");
  const [hazardType, setHazardType] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);

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
      <div className="max-w-[1532px] mx-auto">
        <AuthNavbar />

        {/* No manual spacer needed here — AuthNavbar now measures its own
            height and renders a matching spacer internally. */}

        <div style={{ backgroundColor: "#E8F4FF" }} className="px-[108px] py-8">
          {/* Stat cards */}
          <div className="flex gap-5">
            {statCards.map((s) => (
              <StatCard key={s.label} {...s} />
            ))}
          </div>

          {/* Title + primary action */}
          <div className="flex items-center justify-between mt-8">
            <h2 className="font-krub font-bold text-xl" style={{ color: "#6A6A6A" }}>
              Submitted Reports
            </h2>

            {/* Assumes a "/report-hazard" route exists for ReportHazardPage —
                update the `to` value if your router uses a different path. */}
            <Link
              to="/report-hazard"
              className="flex items-center gap-2 rounded-lg text-white font-inter font-bold text-sm justify-center"
              style={{ width: "220px", height: "43px", backgroundColor: "#F29D38" }}
            >
              <Plus size={16} />
              Report a Hazard
            </Link>
          </div>

          {/* Search + filters */}
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

          {/* Report list + timeline */}
          <div className="flex gap-5 mt-6 items-start">
            <div className="flex-1 flex flex-col gap-5">
              {visibleReports.length === 0 ? (
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
                    onViewHazardMap={() =>
                      navigate("/hazard-map", { state: { focusReportId: report.id } })
                    }
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
                    ‹
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
                    ›
                  </button>
                </div>
              )}
            </div>

            {/* Sticky like the other right-rail sidebars already in the app
                (Weather/Map/Alert Levels/Rewards on the dashboard). */}
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