import { useMemo, useState } from "react";
import {
  Search,
  ChevronDown,
  MapPin,
  Calendar,
  ChevronLeft,
  ChevronRight,
  User,
  TriangleAlert,
  ThumbsUp,
  ThumbsDown,
  Pin,
  PenSquare,
} from "lucide-react";
import AdminSidebar from "../layouts/AdminSidebar";
import AdminHeader from "../layouts/AdminHeader";
// hazardTypes / alertLevelOptions / reportStatuses stay imported straight
// from MockDashboardData.js — this is the one genuine cross-app taxonomy
// (also used by the Hazard Map and My Reports), unlike the rest of this
// page's data, which is local-only below.
import { hazardTypes, alertLevelOptions, reportStatuses } from "../components/data/MockDashboardData";

// ---------------------------------------------------------------------------
// Mock data — page-local. Only the three enums above are shared elsewhere.
// ---------------------------------------------------------------------------

const dateFilterOptions = ["Today", "This Week", "This Month", "All Time"];
const PAGE_SIZE = 6;

const adminHazardReports = Array.from({ length: 18 }, (_, i) => {
  const id = i + 1;
  const barangay = [167, 168, 171, 172, 174, 177][i % 6];
  const hazardType = ["Flood", "Fire", "Road Damage", "Power Line", "Fallen Tree", "Building Damage"][i % 6];
  const alertLevel = ["blue", "red", "white"][i % 3];
  return {
    id,
    title: `${hazardType} in barangay ${barangay}`,
    description:
      hazardType === "Flood"
        ? "Mataas na po baha sa barangay. Need na po lumikas."
        : `Reported ${hazardType.toLowerCase()} needing admin review.`,
    address: `University of Caloocan, Congressional Road, Bagumbong, Zone 15, District 1, Caloocan, Northern Manila District, Metro Manila, 1421, Philippines, Barangay ${barangay}`,
    date: "April 13, 2026",
    time: "2:45:10 PM",
    reporterName: "Jam Dagonio",
    hazardType,
    alertLevel,
    verified: i % 5 !== 4,
    pinned: id === 1,
    upvotes: (id * 3) % 15,
    downvotes: id % 4,
    imageSrc: null,
  };
});

// Small badge-style helpers — page-local since nothing outside this page
// uses this exact pill styling.
const BADGE_VARIANTS = {
  verified: { bg: "#EDE4FB", text: "#7C3AED" },
  pinned: { bg: "#FDF3D9", text: "#B45309" },
  alertBlue: { bg: "#E1EEFC", text: "#2F6FD9" },
  alertRed: { bg: "#FBE4E4", text: "#E11D2E" },
  alertWhite: { bg: "#F1F5F9", text: "#64748B" },
};

function Badge({ variant, children }) {
  const cfg = BADGE_VARIANTS[variant] ?? BADGE_VARIANTS.verified;
  return (
    <span
      className="inline-flex w-fit items-center rounded-md px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide"
      style={{ backgroundColor: cfg.bg, color: cfg.text }}
    >
      {children}
    </span>
  );
}

function alertBadgeVariant(level) {
  if (level === "red") return "alertRed";
  if (level === "white") return "alertWhite";
  return "alertBlue";
}

function alertBadgeLabel(level) {
  if (level === "red") return "Red Alert";
  if (level === "white") return "White Alert";
  return "Blue Alert";
}

// ---------------------------------------------------------------------------
// Small local sub-components
// ---------------------------------------------------------------------------

function FilterSelect({ label, value, onChange, options }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none rounded-lg border border-[#E5EEF9] bg-white py-2.5 pl-3 pr-9 text-sm font-medium text-slate-600 outline-none focus:border-[#2F6FD9]"
      >
        <option value="">{label}</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
      <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
    </div>
  );
}

function FilterBar({ search, onSearchChange, category, onCategoryChange, severity, onSeverityChange, status, onStatusChange, date, onDateChange }) {
  return (
    <div className="mb-4 flex flex-wrap gap-3">
      <div className="relative min-w-[240px] flex-1">
        <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search hazard reports or locations ..."
          className="w-full rounded-lg border border-[#E5EEF9] bg-white py-2.5 pl-9 pr-3 text-sm text-slate-700 outline-none focus:border-[#2F6FD9]"
        />
      </div>
      <FilterSelect label="Category" value={category} onChange={onCategoryChange} options={hazardTypes} />
      <FilterSelect label="Severity" value={severity} onChange={onSeverityChange} options={alertLevelOptions.map((o) => o.label)} />
      <FilterSelect label="Status" value={status} onChange={onStatusChange} options={reportStatuses} />
      <FilterSelect label="Date" value={date} onChange={onDateChange} options={dateFilterOptions} />
    </div>
  );
}

function ReportsList({ reports, selectedId, onSelect, page, onPageChange }) {
  const totalPages = Math.max(1, Math.ceil(reports.length / PAGE_SIZE));
  const start = (page - 1) * PAGE_SIZE;
  const visible = reports.slice(start, start + PAGE_SIZE);

  return (
    <div className="flex flex-col gap-3">
      {visible.length === 0 && (
        <div className="rounded-2xl border border-[#E5EEF9] bg-white p-8 text-center text-sm text-slate-500">
          No hazard reports match your filters.
        </div>
      )}

      {visible.map((report) => {
        const isSelected = report.id === selectedId;
        return (
          <button
            key={report.id}
            type="button"
            onClick={() => onSelect(report.id)}
            className={[
              "flex items-start gap-4 rounded-2xl border bg-white p-4 text-left shadow-sm transition-colors",
              isSelected ? "border-[#2F6FD9] ring-1 ring-[#2F6FD9]" : "border-[#E5EEF9] hover:border-slate-300",
            ].join(" ")}
          >
            <div className="flex shrink-0 flex-col gap-1.5">
              {report.verified && <Badge variant="verified">Verified</Badge>}
              <Badge variant={alertBadgeVariant(report.alertLevel)}>{alertBadgeLabel(report.alertLevel)}</Badge>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-[#0B1830]">{report.title}</p>
              <p className="mt-1 flex items-start gap-1.5 text-xs text-slate-500">
                <MapPin size={13} className="mt-0.5 shrink-0" />
                <span className="line-clamp-1">{report.address}</span>
              </p>
            </div>
            <p className="flex shrink-0 items-center gap-1.5 whitespace-nowrap text-xs text-slate-400">
              <Calendar size={13} />
              {report.date}
            </p>
          </button>
        );
      })}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <button type="button" onClick={() => onPageChange(Math.max(1, page - 1))} disabled={page === 1} className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 disabled:opacity-40">
            <ChevronLeft size={16} />
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
            <button key={n} type="button" onClick={() => onPageChange(n)} className={["flex h-8 w-8 items-center justify-center rounded-lg text-sm font-semibold transition-colors", n === page ? "bg-[#0B1830] text-white" : "text-slate-500 hover:bg-slate-100"].join(" ")}>
              {n}
            </button>
          ))}
          <button type="button" onClick={() => onPageChange(Math.min(totalPages, page + 1))} disabled={page === totalPages} className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 disabled:opacity-40">
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}

function DetailPanel({ report, onTogglePin, onUpdate, onClose }) {
  if (!report) {
    return (
      <div className="flex h-full min-h-[400px] items-center justify-center rounded-2xl border border-[#E5EEF9] bg-white p-8 text-center text-sm text-slate-500">
        Select a hazard report from the list to view its details.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-[#E5EEF9] bg-white shadow-sm">
      <div className="aspect-[16/10] w-full bg-slate-100">
        {report.imageSrc ? (
          <img src={report.imageSrc} alt={report.title} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-slate-400">No photo attached</div>
        )}
      </div>
      <div className="p-5">
        <div className="mb-3 flex flex-wrap gap-1.5">
          {report.verified && <Badge variant="verified">Verified</Badge>}
          <Badge variant={alertBadgeVariant(report.alertLevel)}>{alertBadgeLabel(report.alertLevel)}</Badge>
          {report.pinned && <Badge variant="pinned">Pinned</Badge>}
        </div>
        <h2 className="text-lg font-bold text-[#0B1830]">{report.title}</h2>
        <p className="mt-2 text-sm text-slate-600">{report.description}</p>
        <div className="mt-4 space-y-2.5 text-sm text-slate-600">
          <p className="flex items-start gap-2"><MapPin size={15} className="mt-0.5 shrink-0 text-slate-400" />{report.address}</p>
          <p className="flex items-center gap-2"><Calendar size={15} className="shrink-0 text-slate-400" />{report.date} &nbsp; {report.time}</p>
          <p className="flex items-center gap-2"><User size={15} className="shrink-0 text-slate-400" />{report.reporterName}</p>
          <p className="flex items-center gap-2"><TriangleAlert size={15} className="shrink-0 text-slate-400" />{report.hazardType}</p>
        </div>
        <div className="mt-4 flex items-center gap-5 text-sm text-slate-500">
          <span className="flex items-center gap-1.5"><ThumbsUp size={14} /> {report.upvotes} Upvotes</span>
          <span className="flex items-center gap-1.5"><ThumbsDown size={14} /> {report.downvotes} downvotes</span>
        </div>
        <div className="mt-5 flex flex-col gap-2.5">
          <button type="button" onClick={() => onTogglePin(report)} className="flex items-center justify-center gap-2 rounded-lg bg-[#FDF3D9] py-2.5 text-sm font-semibold text-[#B45309] transition-colors hover:bg-[#FBEAC0]">
            <Pin size={15} />
            {report.pinned ? "Unpin Hazard Report" : "Pin Hazard Report"}
          </button>
          <button type="button" onClick={() => onUpdate(report)} className="flex items-center justify-center gap-2 rounded-lg bg-[#0B1830] py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#16264A]">
            <PenSquare size={15} />
            Update Hazard Report
          </button>
          <button type="button" onClick={onClose} className="rounded-lg bg-slate-100 py-2.5 text-sm font-semibold text-slate-500 transition-colors hover:bg-slate-200">
            Close Panel
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function AdminHazardReportsPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [severity, setSeverity] = useState("");
  const [status, setStatus] = useState("");
  const [date, setDate] = useState("");
  const [page, setPage] = useState(1);

  const [reports, setReports] = useState(adminHazardReports);
  const [selectedId, setSelectedId] = useState(adminHazardReports[0]?.id ?? null);

  const severityValueByLabel = useMemo(
    () => Object.fromEntries(alertLevelOptions.map((o) => [o.label, o.value])),
    []
  );

  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      if (search && !`${r.title} ${r.address}`.toLowerCase().includes(search.toLowerCase())) return false;
      if (category && r.hazardType !== category) return false;
      if (severity && r.alertLevel !== severityValueByLabel[severity]) return false;
      if (status === "Verified" && !r.verified) return false;
      if (status === "Pending" && r.verified) return false;
      return true;
    });
  }, [reports, search, category, severity, status, severityValueByLabel]);

  const selectedReport = reports.find((r) => r.id === selectedId) ?? null;

  const handleTogglePin = (report) => {
    setReports((prev) => prev.map((r) => (r.id === report.id ? { ...r, pinned: !r.pinned } : r)));
  };

  const handleUpdate = (report) => {
    // TODO: open an update/status-change modal for this report.
    console.log("update report", report.id);
  };

  const handleLogout = () => {
    // TODO: wire up to LogoutConfirmModal.jsx.
    console.log("logout clicked");
  };

  return (
    <div className="flex min-h-screen bg-[#EAF2FB]">
      <AdminSidebar onLogout={handleLogout} />

      <div className="flex min-w-0 flex-1 flex-col">
        <AdminHeader
          title="Hazard Reports"
          subtitle="Review, verify, and resolve hazard reports from the community."
        />

        <main className="flex-1 p-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <FilterBar
                search={search}
                onSearchChange={(v) => { setSearch(v); setPage(1); }}
                category={category}
                onCategoryChange={(v) => { setCategory(v); setPage(1); }}
                severity={severity}
                onSeverityChange={(v) => { setSeverity(v); setPage(1); }}
                status={status}
                onStatusChange={(v) => { setStatus(v); setPage(1); }}
                date={date}
                onDateChange={setDate}
              />
              <ReportsList
                reports={filteredReports}
                selectedId={selectedId}
                onSelect={setSelectedId}
                page={page}
                onPageChange={setPage}
              />
            </div>

            <div className="lg:col-span-1">
              <DetailPanel
                report={selectedReport}
                onTogglePin={handleTogglePin}
                onUpdate={handleUpdate}
                onClose={() => setSelectedId(null)}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
