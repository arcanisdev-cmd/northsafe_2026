import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  RefreshCw,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  TriangleAlert,
  MapPin,
  Cpu,
  Copy,
  Info,
  Image as ImageIcon,
  X,
  CheckCircle2,
  HelpCircle,
  XCircle,
  Calendar,
  User,
  Tag,
  Navigation,
  ThumbsUp,
  ThumbsDown,
  Loader2,
  Check,
} from "lucide-react";
import StaffSidebar from "../layouts/StaffSidebar";
import StaffHeader from "../layouts/StaffHeader";
import {
  staffReviewQueue,
  staffReportStatuses,
} from "../components/data/MockDashboardData";
import {
  SEVERITY_RANK,
  SEVERITY_STYLE,
  useNow,
  timeAgo,
  credibilityOf,
} from "../utils/staffHelpers";

// ---------------------------------------------------------------
// CONSTANTS
// ---------------------------------------------------------------
const ROW_GRID =
  "grid grid-cols-[28px_minmax(0,1fr)_84px_150px_120px_96px_84px] items-center gap-4";

const INITIAL_FILTERS = {
  category: "All",
  severity: "All",
  status: "All",
  credibility: "All",
  submitted: "any",
};

const QUICK_FILTERS = [
  { key: "high", label: "High Severity", icon: TriangleAlert, test: (r) => r.severity === "High" },
  { key: "fieldCheck", label: "Needs Field Check", icon: MapPin, test: (r) => r.status === "Field Check" },
  { key: "aiMismatch", label: "AI Mismatch", icon: Cpu, test: (r) => !r.aiMatch },
  { key: "reused", label: "Reused Photo", icon: Copy, test: (r) => r.reusedPhoto },
];

const SUBMITTED_OPTIONS = [
  { value: "any", label: "Any time" },
  { value: "60", label: "Last hour" },
  { value: "1440", label: "Last 24 hours" },
];

const CATEGORIES = [...new Set(staffReviewQueue.map((r) => r.category))].sort();

const withAll = (values, allLabel) => [
  { value: "All", label: allLabel },
  ...values.map((v) => ({ value: v, label: v })),
];

// Status chips (full class names, never built dynamically)
const STATUS_CHIP = {
  "Under Review": "border-slate-200 bg-slate-50 text-slate-600",
  "Needs Info": "border-amber-200 bg-amber-50 text-amber-700",
  "Field Check": "border-sky-200 bg-sky-50 text-sky-700",
  Verified: "border-violet-200 bg-violet-50 text-violet-700",
  Rejected: "border-red-200 bg-red-50 text-red-700",
};

const SEVERITY_ACTIVE = {
  High: "border-red-300 bg-red-50 text-red-700",
  Medium: "border-orange-300 bg-orange-50 text-orange-700",
  Low: "border-emerald-300 bg-emerald-50 text-emerald-700",
};

// Decisions staff can make from the queue. Verified and Rejected leave the queue.
const STATUS_ACTIONS = [
  {
    status: "Verified",
    label: "Verify Report",
    icon: CheckCircle2,
    needs: null,
    style: "border-[#1B2A8E] bg-[#1B2A8E] text-white hover:bg-[#16237A]",
  },
  {
    status: "Needs Info",
    label: "Request Info",
    icon: HelpCircle,
    needs: "info",
    style: "border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100",
  },
  {
    status: "Field Check",
    label: "Flag for Field Check",
    icon: MapPin,
    needs: "field",
    style: "border-sky-300 bg-sky-50 text-sky-700 hover:bg-sky-100",
  },
  {
    status: "Rejected",
    label: "Reject Report",
    icon: XCircle,
    needs: "reason",
    style: "border-red-300 bg-red-50 text-red-700 hover:bg-red-100",
  },
];

const LEAVES_QUEUE = ["Verified", "Rejected"];

const REJECT_REASONS = [
  "Reused or stolen photo",
  "Location does not match the report",
  "Not a physical or environmental hazard",
  "Duplicate report",
  "Outside Barangay 171 coverage",
  "Other",
];

const mapSrc = (lat, lng) =>
  "https://www.openstreetmap.org/export/embed.html?bbox=" +
  [lng - 0.003, lat - 0.0015, lng + 0.003, lat + 0.0015].map((n) => n.toFixed(5)).join("%2C") +
  "&layer=mapnik&marker=" +
  lat.toFixed(5) +
  "%2C" +
  lng.toFixed(5);

// ---------------------------------------------------------------
// SMALL LOCAL COMPONENTS
// ---------------------------------------------------------------
function FilterSelect({ label, value, onChange, options }) {
  return (
    <label className="block min-w-0">
      <span className="mb-1 block text-xs font-semibold text-slate-500">{label}</span>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none rounded-xl border border-[#E3E8F4] bg-white py-2 pl-3 pr-9 text-sm text-[#0F1B4D] focus:border-[#1B2A8E] focus:outline-none focus:ring-2 focus:ring-[#1B2A8E]/15"
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDown
          size={16}
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
        />
      </div>
    </label>
  );
}

function CommunityCell({ confirmations, disputes }) {
  if (!confirmations && !disputes) {
    return <span className="text-xs text-slate-400">No input</span>;
  }
  return (
    <div className="space-y-0.5 text-xs font-medium">
      {confirmations > 0 && (
        <p className="text-emerald-600">{confirmations + " confirmed"}</p>
      )}
      {disputes > 0 && <p className="text-red-600">{disputes + " disputed"}</p>}
    </div>
  );
}

function DetailRow({ icon: Icon, children }) {
  return (
    <li className="flex items-start gap-2 text-xs text-slate-600">
      <Icon size={14} strokeWidth={2} className="mt-0.5 shrink-0 text-slate-400" />
      <span className="min-w-0">{children}</span>
    </li>
  );
}

// Quick-update modal: severity + status, each behind a confirmation step
function ReviewModal({ report, onClose, onApply }) {
  const [pending, setPending] = useState(null);
  const [reason, setReason] = useState("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== "Escape" || saving) return;
      if (pending) setPending(null);
      else onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [pending, saving, onClose]);

  const choose = (next) => {
    setPending(next);
    setReason("");
    setNote("");
    setError("");
  };

  const needsReason = pending && pending.needs === "reason";
  const needsInfoNote = pending && pending.needs === "info";
  const canConfirm =
    !saving &&
    pending &&
    (!needsReason || reason !== "") &&
    (!needsInfoNote || note.trim() !== "");

  const confirm = async () => {
    setSaving(true);
    setError("");
    try {
      await onApply(report.id, pending, { reason, note });
      setPending(null);
    } catch (err) {
      setError("Could not save the update. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const cred = credibilityOf(report.credibility);
  const submitted = new Date(report.submittedAt).toLocaleString("en-PH", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#0F1B4D]/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Review report"
    >
      <div className="relative w-full max-w-5xl rounded-2xl border border-[#E3E8F4] bg-white p-6 shadow-xl">
        {/* HEADER */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
              Report Review
            </p>
            <h2 className="mt-1 text-xl font-bold text-[#0F1B4D]">Hazard Report</h2>
            <p className="mt-1 text-sm text-slate-500">
              Review the details and map before updating this report.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-1.5 rounded-lg border border-[#E3E8F4] px-3 py-1.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
          >
            <X size={15} />
            <span>Close Panel</span>
          </button>
        </div>

        <div className="mt-5 grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)_230px]">
          {/* DETAILS */}
          <div className="min-w-0 space-y-3">
            <div className="flex flex-wrap gap-1.5">
              <span
                className={[
                  "rounded-full border px-2.5 py-0.5 text-xs font-semibold",
                  STATUS_CHIP[report.status],
                ].join(" ")}
              >
                {report.status}
              </span>
              <span
                className={[
                  "rounded-md px-2.5 py-0.5 text-xs font-semibold",
                  SEVERITY_STYLE[report.severity],
                ].join(" ")}
              >
                {report.severity}
              </span>
              <span
                className={[
                  "rounded-full border px-2.5 py-0.5 text-xs font-medium",
                  cred.style,
                ].join(" ")}
              >
                {cred.label + " · " + report.credibility + "/100"}
              </span>
              {report.reusedPhoto && (
                <span className="rounded-full border border-pink-200 bg-pink-50 px-2.5 py-0.5 text-xs font-medium text-pink-700">
                  Reused photo
                </span>
              )}
            </div>

            <div>
              <p className="text-[11px] font-semibold text-[#1B2A8E]">{report.id}</p>
              <h3 className="text-lg font-bold text-[#0F1B4D]">{report.title}</h3>
              <p className="mt-1 text-sm text-slate-600">{report.description}</p>
            </div>

            <div className="flex h-28 items-center justify-center overflow-hidden rounded-xl border border-[#E3E8F4] bg-slate-100 text-slate-400">
              {report.thumbnailUrl ? (
                <img src={report.thumbnailUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="flex flex-col items-center gap-1 text-xs">
                  <ImageIcon size={22} strokeWidth={1.7} />
                  <span>No photo in mock data</span>
                </div>
              )}
            </div>

            <ul className="space-y-1.5">
              <DetailRow icon={MapPin}>
                {report.location + ", Barangay 171 (Bagumbong), Caloocan City"}
              </DetailRow>
              <DetailRow icon={Navigation}>
                {"Coordinates: " + report.lat.toFixed(5) + ", " + report.lng.toFixed(5)}
              </DetailRow>
              <DetailRow icon={Calendar}>{submitted}</DetailRow>
              <DetailRow icon={User}>{"Reported by " + report.reporter}</DetailRow>
              <DetailRow icon={Tag}>{report.category}</DetailRow>
              <DetailRow icon={ThumbsUp}>
                <span className="text-emerald-600">{report.confirmations + " confirmed"}</span>
                <span className="mx-1.5 text-slate-300">|</span>
                <ThumbsDown size={12} className="mr-1 inline text-red-500" />
                <span className="text-red-600">{report.disputes + " disputed"}</span>
              </DetailRow>
            </ul>

            <div className="flex gap-2 rounded-xl border border-[#C9D3F5] bg-[#F3F6FE] p-3 text-xs leading-5 text-slate-600">
              <Cpu size={15} className="mt-0.5 shrink-0 text-[#1B2A8E]" />
              <p>
                {"AI suggested: " +
                  report.aiCategory +
                  " · " +
                  report.aiSeverity +
                  " severity. This is a suggestion only, and you make the final decision."}
              </p>
            </div>
          </div>

          {/* MAP */}
          <div className="min-w-0">
            <div className="h-64 overflow-hidden rounded-xl border border-[#E3E8F4] lg:h-full lg:min-h-[320px]">
              <iframe
                title="Report location"
                src={mapSrc(report.lat, report.lng)}
                className="h-full w-full border-0"
                loading="lazy"
              />
            </div>
          </div>

          {/* ACTIONS */}
          <div className="min-w-0 space-y-5">
            <div>
              <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                Update Severity
              </h3>
              <div className="flex gap-2">
                {["High", "Medium", "Low"].map((level) => {
                  const active = report.severity === level;
                  return (
                    <button
                      key={level}
                      type="button"
                      disabled={active}
                      onClick={() => choose({ kind: "severity", value: level })}
                      className={[
                        "flex-1 rounded-lg border px-2 py-1.5 text-xs font-semibold transition-colors",
                        active
                          ? SEVERITY_ACTIVE[level]
                          : "border-[#E3E8F4] bg-white text-slate-600 hover:bg-slate-50",
                      ].join(" ")}
                    >
                      {level}
                    </button>
                  );
                })}
              </div>
              <p className="mt-1.5 text-[11px] text-slate-400">
                {"AI suggested " + report.aiSeverity + "."}
              </p>
            </div>

            <div>
              <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                Update Status
              </h3>
              <div className="space-y-2">
                {STATUS_ACTIONS.map((a) => {
                  const Icon = a.icon;
                  const current = report.status === a.status;
                  return (
                    <button
                      key={a.status}
                      type="button"
                      disabled={current}
                      onClick={() =>
                        choose({ kind: "status", value: a.status, needs: a.needs })
                      }
                      className={[
                        "flex w-full items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-40",
                        a.style,
                      ].join(" ")}
                    >
                      <Icon size={15} strokeWidth={2.2} />
                      <span>{a.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <Link
              to={"/staff/review-queue/" + report.id}
              className="block text-center text-xs font-semibold text-[#1B2A8E] hover:underline"
            >
              Open full evidence review
            </Link>
          </div>
        </div>
      </div>

      {/* CONFIRMATION */}
      {pending && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#0F1B4D]/40 p-4">
          <div className="w-full max-w-sm rounded-2xl border border-[#E3E8F4] bg-white p-6 text-center shadow-xl">
            <h3 className="text-lg font-bold text-[#0F1B4D]">Are you sure?</h3>
            <p className="mt-2 text-sm text-slate-500">
              {pending.kind === "severity"
                ? "By doing this action, report severity will be updated to"
                : "By doing this action, report status will be updated to"}
            </p>
            <span
              className={[
                "mt-3 inline-block rounded-full border px-3 py-1 text-xs font-semibold",
                pending.kind === "severity"
                  ? SEVERITY_ACTIVE[pending.value]
                  : STATUS_CHIP[pending.value],
              ].join(" ")}
            >
              {pending.value}
            </span>

            {needsInfoNote && (
              <label className="mt-4 block text-left">
                <span className="mb-1 block text-xs font-semibold text-slate-500">
                  What should the reporter add?
                </span>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={3}
                  placeholder="e.g. A clearer photo of the flooded area"
                  className="w-full resize-none rounded-xl border border-[#E3E8F4] p-2.5 text-sm text-[#0F1B4D] focus:border-[#1B2A8E] focus:outline-none focus:ring-2 focus:ring-[#1B2A8E]/15"
                />
              </label>
            )}

            {needsReason && (
              <div className="mt-4 space-y-3 text-left">
                <FilterSelect
                  label="Reason for rejection"
                  value={reason}
                  onChange={setReason}
                  options={[
                    { value: "", label: "Select a reason" },
                    ...REJECT_REASONS.map((r) => ({ value: r, label: r })),
                  ]}
                />
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold text-slate-500">
                    Notes (optional)
                  </span>
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    rows={2}
                    className="w-full resize-none rounded-xl border border-[#E3E8F4] p-2.5 text-sm text-[#0F1B4D] focus:border-[#1B2A8E] focus:outline-none focus:ring-2 focus:ring-[#1B2A8E]/15"
                  />
                </label>
              </div>
            )}

            {pending.needs === "field" && (
              <label className="mt-4 block text-left">
                <span className="mb-1 block text-xs font-semibold text-slate-500">
                  Note for the field check (optional)
                </span>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={2}
                  className="w-full resize-none rounded-xl border border-[#E3E8F4] p-2.5 text-sm text-[#0F1B4D] focus:border-[#1B2A8E] focus:outline-none focus:ring-2 focus:ring-[#1B2A8E]/15"
                />
              </label>
            )}

            {error && <p className="mt-3 text-xs font-medium text-red-600">{error}</p>}

            <div className="mt-5 flex gap-2">
              <button
                type="button"
                onClick={confirm}
                disabled={!canConfirm}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#1B2A8E] px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#16237A] disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : (
                  <Check size={15} strokeWidth={2.4} />
                )}
                <span>{saving ? "Saving..." : "Update Report"}</span>
              </button>
              <button
                type="button"
                onClick={() => setPending(null)}
                disabled={saving}
                className="flex-1 rounded-lg bg-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-300 disabled:opacity-50"
              >
                Cancel Action
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------
// PAGE
// ---------------------------------------------------------------
export default function StaffReviewQueuePage() {
  const navigate = useNavigate();
  const now = useNow();

  const [reports, setReports] = useState(staffReviewQueue);
  const [selectedId, setSelectedId] = useState(null);
  const [toast, setToast] = useState("");

  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [quick, setQuick] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [refreshing, setRefreshing] = useState(false);
  const [updatedAt, setUpdatedAt] = useState(() => new Date().toISOString());

  const selected = reports.find((r) => r.id === selectedId) || null;

  useEffect(() => {
    if (!toast) return undefined;
    const t = setTimeout(() => setToast(""), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  const setFilter = (key, value) => {
    setFilters((f) => ({ ...f, [key]: value }));
    setPage(1);
  };

  const toggleQuick = (key) => {
    setQuick((q) => (q.includes(key) ? q.filter((k) => k !== key) : [...q, key]));
    setPage(1);
  };

  const clearAll = () => {
    setFilters(INITIAL_FILTERS);
    setQuick([]);
    setSearch("");
    setPage(1);
  };

  // Fake async to mimic real latency until the Laravel API is wired
  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setUpdatedAt(new Date().toISOString());
      setRefreshing(false);
    }, 700);
  };

  // Fake async save. Swap the body for PATCH /staff/reports/:id when Laravel is ready.
  const applyChange = (id, change) =>
    new Promise((resolve) => {
      setTimeout(() => {
        if (change.kind === "severity") {
          setReports((prev) =>
            prev.map((r) => (r.id === id ? { ...r, severity: change.value } : r))
          );
          setToast(id + " severity set to " + change.value + ".");
        } else if (LEAVES_QUEUE.includes(change.value)) {
          setReports((prev) => prev.filter((r) => r.id !== id));
          setSelectedId(null);
          setToast(
            id +
              (change.value === "Verified"
                ? " verified. It is ready to be forwarded."
                : " rejected and removed from the queue.")
          );
        } else {
          setReports((prev) =>
            prev.map((r) => (r.id === id ? { ...r, status: change.value } : r))
          );
          setToast(id + " status set to " + change.value + ".");
        }
        resolve();
      }, 800);
    });

  // ---- derive: filter -> sort -> paginate ----
  const q = search.toLowerCase();
  const activeQuick = QUICK_FILTERS.filter((f) => quick.includes(f.key));

  const filtered = reports
    .filter((r) => {
      if (filters.category !== "All" && r.category !== filters.category) return false;
      if (filters.severity !== "All" && r.severity !== filters.severity) return false;
      if (filters.status !== "All" && r.status !== filters.status) return false;
      if (
        filters.credibility !== "All" &&
        credibilityOf(r.credibility).label !== filters.credibility
      )
        return false;
      if (
        filters.submitted !== "any" &&
        (now - new Date(r.submittedAt)) / 60000 > Number(filters.submitted)
      )
        return false;
      if (!activeQuick.every((f) => f.test(r))) return false;
      if (q) {
        const haystack = [r.id, r.title, r.location, r.category].join(" ").toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    })
    .sort(
      (a, b) =>
        SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity] ||
        new Date(a.submittedAt) - new Date(b.submittedAt)
    );

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * pageSize;
  const rows = filtered.slice(start, start + pageSize);

  const summary = ["High", "Medium", "Low"].map((level) => ({
    level,
    count: reports.filter((r) => r.severity === level).length,
  }));
  const DOT = { High: "bg-red-500", Medium: "bg-orange-500", Low: "bg-emerald-500" };

  return (
    <div className="flex min-h-screen bg-[#F2F4FB]">
      <StaffSidebar onLogout={() => navigate("/signin")} />

      <div className="min-w-0 flex-1">
        <StaffHeader
          onSearch={(value) => {
            setSearch(value);
            setPage(1);
          }}
        />

        <main className="space-y-6 p-8">
          {/* TITLE ROW */}
          <section className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-[#0F1B4D]">Review Queue</h1>
              <p className="mt-1.5 max-w-xl text-sm text-slate-500">
                Review and verify hazard reports from your barangay. Use the filters to
                find specific reports.
              </p>
            </div>

            <div className="flex flex-col items-end gap-1">
              <button
                type="button"
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center gap-2 rounded-xl border border-[#E3E8F4] bg-white px-4 py-2.5 text-sm font-semibold text-[#1B2A8E] transition-colors hover:bg-slate-50 disabled:opacity-60"
              >
                <RefreshCw
                  size={15}
                  strokeWidth={2.2}
                  className={refreshing ? "animate-spin" : ""}
                />
                <span>Refresh</span>
              </button>
              <p className="text-xs text-slate-400">
                {"Updated " + timeAgo(updatedAt, now).toLowerCase()}
              </p>
            </div>
          </section>

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_300px]">
            {/* LEFT: FILTER BAR + TABLE */}
            <div className="min-w-0 space-y-4">
              <section className="rounded-2xl border border-[#E3E8F4] bg-white p-4">
                <div className="grid grid-cols-2 items-end gap-4 md:grid-cols-5">
                  <FilterSelect
                    label="Category"
                    value={filters.category}
                    onChange={(v) => setFilter("category", v)}
                    options={withAll(CATEGORIES, "All Categories")}
                  />
                  <FilterSelect
                    label="Severity"
                    value={filters.severity}
                    onChange={(v) => setFilter("severity", v)}
                    options={withAll(["High", "Medium", "Low"], "All Severities")}
                  />
                  <FilterSelect
                    label="Status"
                    value={filters.status}
                    onChange={(v) => setFilter("status", v)}
                    options={withAll(staffReportStatuses, "All Statuses")}
                  />
                  <FilterSelect
                    label="Credibility"
                    value={filters.credibility}
                    onChange={(v) => setFilter("credibility", v)}
                    options={withAll(["Likely credible", "Needs staff check"], "All Labels")}
                  />
                  <button
                    type="button"
                    onClick={clearAll}
                    className="rounded-xl border border-[#E3E8F4] bg-white px-3 py-2 text-sm font-semibold text-[#1B2A8E] transition-colors hover:bg-slate-50"
                  >
                    Clear filters
                  </button>
                </div>
              </section>

              <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-sm">
                <p className="font-semibold text-[#0F1B4D]">
                  {filtered.length + (filtered.length === 1 ? " report" : " reports")}
                </p>
                <p className="text-xs text-slate-500">
                  Sort by: Severity (High → Low), then oldest first
                </p>
              </div>

              <section className="overflow-hidden rounded-2xl border border-[#E3E8F4] bg-white">
                <div className="overflow-x-auto">
                  <div className="min-w-[860px]">
                    <div
                      className={[
                        ROW_GRID,
                        "bg-[#F7F8FD] px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-400",
                      ].join(" ")}
                    >
                      <span>#</span>
                      <span>Report Details</span>
                      <span>Severity</span>
                      <span>AI Credibility</span>
                      <span>Community</span>
                      <span>Submitted</span>
                      <span>Action</span>
                    </div>

                    {rows.length === 0 && (
                      <div className="border-t border-[#E3E8F4] px-5 py-10 text-center">
                        <p className="text-sm text-slate-500">
                          No reports match your filters.
                        </p>
                        <button
                          type="button"
                          onClick={clearAll}
                          className="mt-2 text-sm font-semibold text-[#1B2A8E] hover:underline"
                        >
                          Clear filters
                        </button>
                      </div>
                    )}

                    {rows.map((r, idx) => {
                      const cred = credibilityOf(r.credibility);

                      return (
                        <div
                          key={r.id}
                          className={[ROW_GRID, "border-t border-[#E3E8F4] px-5 py-3"].join(" ")}
                        >
                          <span className="text-sm text-slate-400">{start + idx + 1}</span>

                          <div className="flex min-w-0 items-center gap-3">
                            <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-slate-100 text-slate-400">
                              {r.thumbnailUrl ? (
                                <img src={r.thumbnailUrl} alt="" className="h-full w-full object-cover" />
                              ) : (
                                <ImageIcon size={20} strokeWidth={1.7} />
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="text-[11px] font-semibold text-[#1B2A8E]">{r.id}</p>
                              <p className="truncate text-sm font-semibold text-[#0F1B4D]">
                                {r.title}
                              </p>
                              <p className="truncate text-xs text-slate-500">
                                {r.category + " · " + r.location}
                              </p>
                              <div className="mt-1 flex flex-wrap gap-1">
                                <span
                                  className={[
                                    "rounded-full border px-2 py-0.5 text-[10px] font-medium",
                                    STATUS_CHIP[r.status],
                                  ].join(" ")}
                                >
                                  {r.status}
                                </span>
                                {r.reusedPhoto && (
                                  <span className="rounded-full border border-pink-200 bg-pink-50 px-2 py-0.5 text-[10px] font-medium text-pink-700">
                                    Reused photo
                                  </span>
                                )}
                                <span
                                  className={[
                                    "rounded-full border px-2 py-0.5 text-[10px] font-medium",
                                    r.aiMatch
                                      ? "border-slate-200 bg-slate-50 text-slate-600"
                                      : "border-violet-200 bg-violet-50 text-violet-700",
                                  ].join(" ")}
                                >
                                  {r.aiMatch ? "AI match" : "AI mismatch"}
                                </span>
                              </div>
                            </div>
                          </div>

                          <span
                            className={[
                              "w-fit rounded-md px-2.5 py-1 text-xs font-semibold",
                              SEVERITY_STYLE[r.severity],
                            ].join(" ")}
                          >
                            {r.severity}
                          </span>

                          <div>
                            <span
                              className={[
                                "inline-block rounded-full border px-2.5 py-0.5 text-xs font-medium",
                                cred.style,
                              ].join(" ")}
                            >
                              {cred.label}
                            </span>
                            <p className="mt-1 pl-1 text-xs text-slate-500">
                              {r.credibility + "/100"}
                            </p>
                          </div>

                          <CommunityCell confirmations={r.confirmations} disputes={r.disputes} />

                          <span className="text-sm text-slate-600">
                            {timeAgo(r.submittedAt, now)}
                          </span>

                          <button
                            type="button"
                            onClick={() => setSelectedId(r.id)}
                            className="w-fit rounded-lg bg-[#1B2A8E] px-4 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-[#16237A]"
                          >
                            Review
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* PAGINATION */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#E3E8F4] px-5 py-3">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setPage(Math.max(1, safePage - 1))}
                      disabled={safePage === 1}
                      aria-label="Previous page"
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#E3E8F4] text-slate-500 hover:bg-slate-50 disabled:opacity-40"
                    >
                      <ChevronLeft size={16} />
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setPage(n)}
                        className={[
                          "h-8 min-w-8 rounded-lg px-2 text-sm font-semibold",
                          n === safePage
                            ? "bg-[#1B2A8E] text-white"
                            : "text-slate-600 hover:bg-slate-50",
                        ].join(" ")}
                      >
                        {n}
                      </button>
                    ))}

                    <button
                      type="button"
                      onClick={() => setPage(Math.min(totalPages, safePage + 1))}
                      disabled={safePage === totalPages}
                      aria-label="Next page"
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#E3E8F4] text-slate-500 hover:bg-slate-50 disabled:opacity-40"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span>Show</span>
                    <select
                      value={pageSize}
                      onChange={(e) => {
                        setPageSize(Number(e.target.value));
                        setPage(1);
                      }}
                      className="rounded-lg border border-[#E3E8F4] bg-white px-2 py-1 text-sm text-[#0F1B4D] focus:outline-none"
                    >
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                    </select>
                    <span>per page</span>
                  </div>
                </div>
              </section>
            </div>

            {/* RIGHT: FILTERS PANEL */}
            <aside className="min-w-0 space-y-6 self-start rounded-2xl border border-[#E3E8F4] bg-white p-5">
              <div className="flex items-center gap-2 text-[#0F1B4D]">
                <SlidersHorizontal size={18} strokeWidth={2} />
                <h2 className="text-lg font-bold">Filters</h2>
              </div>

              <div>
                <h3 className="mb-3 text-sm font-bold text-[#0F1B4D]">Quick Filters</h3>
                <div className="flex flex-wrap gap-2">
                  {QUICK_FILTERS.map(({ key, label, icon: Icon }) => {
                    const on = quick.includes(key);
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => toggleQuick(key)}
                        aria-pressed={on}
                        className={[
                          "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
                          on
                            ? "border-[#1B2A8E] bg-[#1B2A8E] text-white"
                            : "border-[#E3E8F4] bg-white text-slate-600 hover:bg-slate-50",
                        ].join(" ")}
                      >
                        <Icon size={13} strokeWidth={2.2} />
                        <span>{label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <h3 className="mb-3 text-sm font-bold text-[#0F1B4D]">Additional Filters</h3>
                <FilterSelect
                  label="Submitted"
                  value={filters.submitted}
                  onChange={(v) => setFilter("submitted", v)}
                  options={SUBMITTED_OPTIONS}
                />
              </div>

              <div>
                <h3 className="mb-3 text-sm font-bold text-[#0F1B4D]">Report Summary</h3>
                <ul className="space-y-2">
                  {summary.map(({ level, count }) => (
                    <li key={level} className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2 text-slate-600">
                        <span className={["h-2.5 w-2.5 rounded-full", DOT[level]].join(" ")} />
                        {level}
                      </span>
                      <span className="font-semibold text-[#0F1B4D]">{count}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex gap-2 rounded-xl border border-[#C9D3F5] bg-[#F3F6FE] p-3 text-xs leading-5 text-slate-600">
                <Info size={15} className="mt-0.5 shrink-0 text-[#1B2A8E]" />
                <p>
                  Reports are prioritized by severity, then by how long they have been
                  waiting. AI results are suggestions, and you make the final call.
                </p>
              </div>
            </aside>
          </div>
        </main>
      </div>

      {selected && (
        <ReviewModal
          key={selected.id}
          report={selected}
          onClose={() => setSelectedId(null)}
          onApply={applyChange}
        />
      )}

      {toast && (
        <div className="fixed bottom-6 right-6 z-[70] flex items-center gap-2 rounded-xl border border-[#E3E8F4] bg-white px-4 py-3 text-sm font-medium text-[#0F1B4D] shadow-lg">
          <CheckCircle2 size={16} className="text-emerald-600" />
          <span>{toast}</span>
        </div>
      )}
    </div>
  );
}