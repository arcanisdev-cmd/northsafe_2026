import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CircleCheck,
  RotateCcw,
  CalendarDays,
  Percent,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  X,
  MapPin,
  Info,
  Image as ImageIcon,
} from "lucide-react";
import StaffSidebar from "../layouts/StaffSidebar";
import StaffHeader from "../layouts/StaffHeader";
import {
  staffOfficer,
  staffResolvedReports,
  returnReportToReview,
  keepReportResolved,
} from "../components/data/MockDashboardData";
import { SEVERITY_STYLE, useNow, timeAgo } from "../utils/staffHelpers";

// ---------------------------------------------------------------
// CONSTANTS + FORMATTERS
// ---------------------------------------------------------------
const TZ = "Asia/Manila";
const PAGE_SIZE = 10;

const ROW_GRID =
  "grid grid-cols-[minmax(0,1fr)_130px_84px_150px_110px_20px] items-center gap-4";

const INITIAL_FILTERS = { category: "All", severity: "All", status: "All", from: "", to: "" };

const STATUS_STYLE = {
  Resolved: "border-emerald-200 bg-emerald-50 text-emerald-700",
  Reopened: "border-orange-200 bg-orange-50 text-orange-700",
};

const HISTORY_STYLE = {
  Submitted: "border-slate-200 bg-slate-50 text-slate-600",
  "Under Review": "border-blue-200 bg-blue-50 text-blue-700",
  "Field Check": "border-amber-200 bg-amber-50 text-amber-700",
  Verified: "border-emerald-200 bg-emerald-50 text-emerald-700",
  Forwarded: "border-indigo-200 bg-indigo-50 text-indigo-700",
  "In Progress": "border-violet-200 bg-violet-50 text-violet-700",
  Resolved: "border-emerald-200 bg-emerald-50 text-emerald-700",
  Reopened: "border-orange-200 bg-orange-50 text-orange-700",
  Reassessed: "border-violet-200 bg-violet-50 text-violet-700",
};

const fmtDateTime = (iso) =>
  new Date(iso).toLocaleString("en-PH", {
    timeZone: TZ,
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

const fmtDate = (iso) =>
  new Date(iso).toLocaleDateString("en-PH", {
    timeZone: TZ,
    month: "short",
    day: "numeric",
    year: "numeric",
  });

// YYYY-MM-DD in Manila time, comparable with <input type="date"> values
const dayKey = (iso) => new Date(iso).toLocaleDateString("en-CA", { timeZone: TZ });

// Derived from the documented steps, not stored
const verificationOf = (r) =>
  r.history.some((h) => h.status === "Field Check") ? "Field verified" : "Staff verified";

const withAll = (values, allLabel) => [
  { value: "All", label: allLabel },
  ...values.map((v) => ({ value: v, label: v })),
];

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

function DateField({ label, value, onChange }) {
  return (
    <label className="block min-w-0">
      <span className="mb-1 block text-xs font-semibold text-slate-500">{label}</span>
      <input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-[#E3E8F4] bg-white px-3 py-2 text-sm text-[#0F1B4D] focus:border-[#1B2A8E] focus:outline-none focus:ring-2 focus:ring-[#1B2A8E]/15"
      />
    </label>
  );
}

function Pill({ className, children }) {
  return (
    <span
      className={["inline-block rounded-full border px-2.5 py-0.5 text-xs font-medium", className].join(" ")}
    >
      {children}
    </span>
  );
}

function SummaryCard({ label, value, note, icon: Icon, labelClass, iconClass }) {
  return (
    <div className="rounded-2xl border border-[#E3E8F4] bg-white p-4">
      <div className="flex items-start justify-between gap-2">
        <p className={["text-[11px] font-semibold uppercase tracking-[0.12em]", labelClass].join(" ")}>
          {label}
        </p>
        <Icon size={18} strokeWidth={1.9} className={iconClass} />
      </div>
      <p className="mt-2 text-3xl font-bold text-[#0F1B4D]">{value}</p>
      <p className="mt-1 text-xs font-medium text-slate-500">{note}</p>
    </div>
  );
}

function Block({ title, children }) {
  return (
    <section>
      <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
        {title}
      </h3>
      <div className="rounded-xl border border-[#E3E8F4] bg-white p-4">{children}</div>
    </section>
  );
}

function Row({ label, children }) {
  return (
    <div className="flex items-start justify-between gap-4 py-1.5 text-sm">
      <span className="shrink-0 text-slate-500">{label}</span>
      <span className="text-right font-medium text-[#0F1B4D]">{children}</span>
    </div>
  );
}

function PhotoGrid({ count, label }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          className="flex h-24 flex-col items-center justify-center gap-1 rounded-lg bg-slate-100 text-slate-400"
        >
          <ImageIcon size={20} strokeWidth={1.7} />
          <span className="text-[11px]">{label + " " + (i + 1)}</span>
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------
// DETAIL DRAWER
// ---------------------------------------------------------------
function ReportDrawer({ report, now, onClose, onReassess }) {
  const isReopened = report.status === "Reopened";
  const [tab, setTab] = useState("details");
  const [decision, setDecision] = useState("return");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const tabs = [
    { key: "details", label: "Details" },
    { key: "resolution", label: "Resolution" },
    { key: "forwarding", label: "Forwarding" },
    { key: "history", label: "History" },
    ...(isReopened ? [{ key: "reassess", label: "Reassess" }] : []),
  ];

  const submit = async () => {
    if (note.trim().length < 10) {
      setError("Please document your reasoning (at least 10 characters).");
      return;
    }
    setError("");
    setSubmitting(true);
    await onReassess(report, decision, note.trim());
  };

  return (
    <div className="fixed inset-0 z-30 flex justify-end">
      <div className="absolute inset-0 bg-[#0F1B4D]/30" onClick={onClose} />

      <aside className="relative flex h-full w-full max-w-xl flex-col bg-[#F7F8FD] shadow-2xl">
        {/* HEADER */}
        <div className="border-b border-[#E3E8F4] bg-white px-5 pt-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-semibold text-[#1B2A8E]">{report.id}</p>
              <h2 className="truncate text-lg font-bold text-[#0F1B4D]">{report.title}</h2>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <Pill className={STATUS_STYLE[report.status]}>{report.status}</Pill>
                <span
                  className={[
                    "rounded-md px-2.5 py-0.5 text-xs font-semibold",
                    SEVERITY_STYLE[report.severity],
                  ].join(" ")}
                >
                  {report.severity}
                </span>
                <span className="text-xs text-slate-500">{report.category}</span>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-[#1B2A8E]"
            >
              <X size={18} />
            </button>
          </div>

          <div className="mt-3 flex gap-1 overflow-x-auto">
            {tabs.map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => setTab(t.key)}
                className={[
                  "whitespace-nowrap border-b-2 px-3 py-2 text-sm font-semibold transition-colors",
                  tab === t.key
                    ? "border-[#1B2A8E] text-[#1B2A8E]"
                    : "border-transparent text-slate-500 hover:text-[#1B2A8E]",
                ].join(" ")}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* BODY */}
        <div className="flex-1 space-y-5 overflow-y-auto p-5">
          {isReopened && tab !== "reassess" && (
            <div className="flex items-start gap-3 rounded-xl border border-orange-200 bg-orange-50 p-3 text-sm text-orange-800">
              <RotateCcw size={16} className="mt-0.5 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="font-semibold">
                  {"Reopened " + timeAgo(report.reopened.at, now).toLowerCase()}
                </p>
                <p className="text-xs">{report.reopened.source + ": " + report.reopened.note}</p>
              </div>
              <button
                type="button"
                onClick={() => setTab("reassess")}
                className="shrink-0 rounded-lg bg-orange-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-orange-600"
              >
                Start reassessment
              </button>
            </div>
          )}

          {tab === "details" && (
            <>
              <Block title="Original Hazard Description">
                <p className="text-sm leading-6 text-slate-700">{report.description}</p>
              </Block>

              <Block title="Submitted Photos">
                <PhotoGrid count={report.photos} label="Photo" />
              </Block>

              <Block title="Location">
                <div className="mb-3 flex h-28 items-center justify-center rounded-lg bg-[#E8EBFA] text-[#1B2A8E]">
                  <div className="flex flex-col items-center gap-1">
                    <MapPin size={28} strokeWidth={1.9} />
                    <span className="text-xs font-semibold">Map pin</span>
                  </div>
                </div>
                <Row label="Barangay">{report.barangay}</Row>
                <Row label="Location">{report.location}</Row>
                <Row label="Coordinates">
                  {report.lat.toFixed(4) + ", " + report.lng.toFixed(4)}
                </Row>
              </Block>

              <Block title="Verification">
                <Row label="Verification level">{verificationOf(report)}</Row>
                <Row label="Community confirmations">{report.confirmations}</Row>
                <Row label="Community disputes">{report.disputes}</Row>
                <Row label="AI credibility (suggestion)">{report.credibility + "/100"}</Row>
              </Block>
            </>
          )}

          {tab === "resolution" && (
            <>
              <Block title="Resolution Record">
                <Row label="Recorded by">{report.record.by}</Row>
                <Row label="Date and time">{fmtDateTime(report.record.at)}</Row>
                <div className="mt-2 border-t border-[#E3E8F4] pt-3">
                  <p className="text-xs font-semibold text-slate-500">Reason for closure</p>
                  <p className="mt-1 text-sm leading-6 text-slate-700">{report.record.reason}</p>
                </div>
              </Block>

              <Block title="Resolution Evidence">
                <PhotoGrid count={report.evidence.afterPhotos} label="After-photo" />
                <div className="mt-3 border-t border-[#E3E8F4] pt-3">
                  <p className="text-xs font-semibold text-slate-500">Staff notes</p>
                  <p className="mt-1 text-sm leading-6 text-slate-700">{report.evidence.notes}</p>
                </div>
              </Block>
            </>
          )}

          {tab === "forwarding" && (
            <>
              <div className="flex items-start gap-2 rounded-xl border border-[#C9D3F5] bg-[#F3F6FE] p-3 text-xs leading-5 text-slate-600">
                <Info size={15} className="mt-0.5 shrink-0 text-[#1B2A8E]" />
                <p>
                  Forwarding alone does not mean a report is resolved. These entries record
                  what staff logged after contacting the receiving office.
                </p>
              </div>

              {report.forwarding.length === 0 && (
                <p className="rounded-xl border border-dashed border-[#E3E8F4] bg-white p-6 text-center text-sm text-slate-500">
                  No forwarding was recorded. This report was handled within the barangay.
                </p>
              )}

              {report.forwarding.map((f, i) => (
                <Block key={i} title={"Forwarded to " + f.office}>
                  <Row label="Forwarding date">{fmtDateTime(f.at)}</Row>
                  <Row label="Method">{f.method}</Row>
                  <Row label="Acknowledgement">{f.acknowledgement}</Row>
                  <div className="mt-2 border-t border-[#E3E8F4] pt-3">
                    <p className="text-xs font-semibold text-slate-500">Follow-up update</p>
                    <p className="mt-1 text-sm text-slate-700">{f.followUp}</p>
                  </div>
                </Block>
              ))}
            </>
          )}

          {tab === "history" && (
            <Block title="Status History">
              <ol className="space-y-4">
                {report.history.map((h, i) => (
                  <li key={i} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <span className="mt-1.5 h-2.5 w-2.5 rounded-full bg-[#1B2A8E]" />
                      {i < report.history.length - 1 && (
                        <span className="mt-1 w-px flex-1 bg-[#E3E8F4]" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1 pb-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Pill className={HISTORY_STYLE[h.status] || HISTORY_STYLE.Submitted}>
                          {h.status}
                        </Pill>
                        <span className="text-xs text-slate-500">{h.by}</span>
                      </div>
                      <p className="mt-1 text-sm text-slate-700">{h.note}</p>
                      <p className="text-xs text-slate-400">{fmtDateTime(h.at)}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </Block>
          )}

          {tab === "reassess" && isReopened && (
            <>
              <Block title="New Information">
                <Row label="Source">{report.reopened.source}</Row>
                <Row label="Raised by">{report.reopened.by}</Row>
                <Row label="When">{fmtDateTime(report.reopened.at)}</Row>
                <Row label="New community disputes">{report.reopened.newDisputes}</Row>
                <p className="mt-2 border-t border-[#E3E8F4] pt-3 text-sm leading-6 text-slate-700">
                  {report.reopened.note}
                </p>
              </Block>

              <Block title="Previous Resolution">
                <Row label="Recorded by">{report.record.by}</Row>
                <Row label="Closed on">{fmtDateTime(report.record.at)}</Row>
                <p className="mt-2 border-t border-[#E3E8F4] pt-3 text-sm leading-6 text-slate-700">
                  {report.record.reason}
                </p>
                <p className="mt-2 text-xs text-slate-500">
                  {"Evidence on file: " + report.evidence.afterPhotos + " after-photo(s). Check the Resolution tab for the full record."}
                </p>
              </Block>

              <Block title="Your Reassessment">
                <div className="space-y-2">
                  {[
                    {
                      value: "return",
                      title: "Return to Review Queue",
                      text: "The hazard may still exist. The report goes back to the review workflow for re-verification.",
                    },
                    {
                      value: "keep",
                      title: "Keep as Resolved",
                      text: "The new information does not change the outcome. Your note is added to the record.",
                    },
                  ].map((o) => (
                    <label
                      key={o.value}
                      className={[
                        "flex cursor-pointer items-start gap-3 rounded-xl border p-3",
                        decision === o.value
                          ? "border-[#1B2A8E] bg-[#F3F6FE]"
                          : "border-[#E3E8F4] bg-white hover:bg-slate-50",
                      ].join(" ")}
                    >
                      <input
                        type="radio"
                        name="decision"
                        value={o.value}
                        checked={decision === o.value}
                        onChange={() => setDecision(o.value)}
                        className="mt-1 accent-[#1B2A8E]"
                      />
                      <span>
                        <span className="block text-sm font-semibold text-[#0F1B4D]">{o.title}</span>
                        <span className="block text-xs leading-5 text-slate-500">{o.text}</span>
                      </span>
                    </label>
                  ))}
                </div>

                <label className="mt-4 block">
                  <span className="mb-1 block text-xs font-semibold text-slate-500">
                    Reassessment notes (required)
                  </span>
                  <textarea
                    rows={4}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Document what you reviewed and why you made this decision."
                    className="w-full rounded-xl border border-[#E3E8F4] bg-white px-3 py-2 text-sm text-[#0F1B4D] placeholder:text-slate-400 focus:border-[#1B2A8E] focus:outline-none focus:ring-2 focus:ring-[#1B2A8E]/15"
                  />
                </label>

                {error && <p className="mt-1 text-xs font-medium text-red-600">{error}</p>}

                <button
                  type="button"
                  onClick={submit}
                  disabled={submitting}
                  className="mt-3 w-full rounded-xl bg-[#1B2A8E] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#16237A] disabled:opacity-60"
                >
                  {submitting ? "Saving..." : "Submit reassessment"}
                </button>
              </Block>
            </>
          )}
        </div>
      </aside>
    </div>
  );
}

// ---------------------------------------------------------------
// PAGE
// ---------------------------------------------------------------
export default function StaffResolvedReportsPage() {
  const navigate = useNavigate();
  const now = useNow();

  const [reports, setReports] = useState(() => [...staffResolvedReports]);
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState(null);
  const [toast, setToast] = useState("");

  useEffect(() => {
    if (!toast) return undefined;
    const id = setTimeout(() => setToast(""), 3500);
    return () => clearTimeout(id);
  }, [toast]);

  const setFilter = (key, value) => {
    setFilters((f) => ({ ...f, [key]: value }));
    setPage(1);
  };

  const clearAll = () => {
    setFilters(INITIAL_FILTERS);
    setSearch("");
    setPage(1);
  };

  // Fake async to mimic latency until the Laravel API is wired
  const handleReassess = async (report, decision, note) => {
    await new Promise((resolve) => setTimeout(resolve, 700));

    if (decision === "return") {
      returnReportToReview(report.id);
      setToast(report.id + " was returned to the Review Queue.");
    } else {
      keepReportResolved(report.id, note, staffOfficer.name);
      setToast(report.id + " stays resolved. Reassessment recorded.");
    }

    setReports([...staffResolvedReports]);
    setSelectedId(null);
  };

  // ---- derive ----
  const categories = [...new Set(reports.map((r) => r.category))].sort();
  const q = search.toLowerCase();

  const filtered = reports
    .filter((r) => {
      if (filters.category !== "All" && r.category !== filters.category) return false;
      if (filters.severity !== "All" && r.severity !== filters.severity) return false;
      if (filters.status !== "All" && r.status !== filters.status) return false;
      if (filters.from && dayKey(r.resolvedAt) < filters.from) return false;
      if (filters.to && dayKey(r.resolvedAt) > filters.to) return false;
      if (q) {
        const haystack = [r.id, r.title, r.location, r.category, r.status].join(" ").toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    })
    .sort(
      (a, b) =>
        (a.status === "Reopened" ? 0 : 1) - (b.status === "Reopened" ? 0 : 1) ||
        new Date(b.resolvedAt) - new Date(a.resolvedAt)
    );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * PAGE_SIZE;
  const rows = filtered.slice(start, start + PAGE_SIZE);

  const selected = reports.find((r) => r.id === selectedId) || null;

  const reopenedCount = reports.filter((r) => r.status === "Reopened").length;
  const resolvedCount = reports.length - reopenedCount;
  const lastWeekCount = reports.filter(
    (r) => r.status === "Resolved" && now - new Date(r.resolvedAt) <= 7 * 86400000
  ).length;
  const reopenRate = reports.length ? Math.round((reopenedCount / reports.length) * 100) : 0;

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
          {/* TITLE */}
          <section>
            <h1 className="text-3xl font-bold text-[#0F1B4D]">Resolved Reports</h1>
            <p className="mt-1.5 max-w-2xl text-sm text-slate-500">
              Review closed cases, check the resolution record, and reassess reports that
              were reopened because the hazard may still exist.
            </p>
          </section>

          {/* SUMMARY */}
          <section className="grid grid-cols-2 gap-4 xl:grid-cols-4">
            <SummaryCard
              label="Resolved"
              value={resolvedCount}
              note="Closed with a documented reason"
              icon={CircleCheck}
              labelClass="text-emerald-600"
              iconClass="text-emerald-600"
            />
            <SummaryCard
              label="Reopened"
              value={reopenedCount}
              note={reopenedCount > 0 ? "Needs reassessment" : "Nothing needs attention"}
              icon={RotateCcw}
              labelClass="text-orange-500"
              iconClass="text-orange-500"
            />
            <SummaryCard
              label="Resolved (7 days)"
              value={lastWeekCount}
              note="Recently closed cases"
              icon={CalendarDays}
              labelClass="text-slate-500"
              iconClass="text-[#1B2A8E]"
            />
            <SummaryCard
              label="Reopen rate"
              value={reopenRate + "%"}
              note="Of all closed cases"
              icon={Percent}
              labelClass="text-violet-600"
              iconClass="text-violet-600"
            />
          </section>

          {/* FILTERS */}
          <section className="rounded-2xl border border-[#E3E8F4] bg-white p-4">
            <div className="grid grid-cols-2 items-end gap-4 md:grid-cols-6">
              <FilterSelect
                label="Category"
                value={filters.category}
                onChange={(v) => setFilter("category", v)}
                options={withAll(categories, "All Categories")}
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
                options={withAll(["Resolved", "Reopened"], "All Statuses")}
              />
              <DateField
                label="Resolved from"
                value={filters.from}
                onChange={(v) => setFilter("from", v)}
              />
              <DateField
                label="Resolved to"
                value={filters.to}
                onChange={(v) => setFilter("to", v)}
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

          <div className="flex flex-wrap items-center justify-between gap-2 px-1">
            <p className="text-sm font-semibold text-[#0F1B4D]">
              {filtered.length + (filtered.length === 1 ? " report" : " reports")}
            </p>
            <p className="text-xs text-slate-500">
              Sort by: Reopened first, then most recently resolved
            </p>
          </div>

          {/* LIST */}
          <section className="overflow-hidden rounded-2xl border border-[#E3E8F4] bg-white">
            <div className="overflow-x-auto">
              <div className="min-w-[820px]">
                <div
                  className={[
                    ROW_GRID,
                    "bg-[#F7F8FD] px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-400",
                  ].join(" ")}
                >
                  <span>Report</span>
                  <span>Category</span>
                  <span>Severity</span>
                  <span>Resolved On</span>
                  <span>Status</span>
                  <span />
                </div>

                {rows.length === 0 && (
                  <div className="border-t border-[#E3E8F4] px-5 py-10 text-center">
                    <p className="text-sm text-slate-500">No reports match your filters.</p>
                    <button
                      type="button"
                      onClick={clearAll}
                      className="mt-2 text-sm font-semibold text-[#1B2A8E] hover:underline"
                    >
                      Clear filters
                    </button>
                  </div>
                )}

                {rows.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setSelectedId(r.id)}
                    className={[
                      ROW_GRID,
                      "w-full border-t border-[#E3E8F4] px-5 py-3 text-left transition-colors hover:bg-slate-50",
                      r.status === "Reopened" ? "bg-orange-50/40" : "",
                    ].join(" ")}
                  >
                    <div className="min-w-0">
                      <p className="text-[11px] font-semibold text-[#1B2A8E]">{r.id}</p>
                      <p className="truncate text-sm font-semibold text-[#0F1B4D]">{r.title}</p>
                      <p className="truncate text-xs text-slate-500">{r.location + " · Brgy 171"}</p>
                    </div>

                    <span className="text-sm text-slate-600">{r.category}</span>

                    <span
                      className={[
                        "w-fit rounded-md px-2.5 py-1 text-xs font-semibold",
                        SEVERITY_STYLE[r.severity],
                      ].join(" ")}
                    >
                      {r.severity}
                    </span>

                    <div>
                      <p className="text-sm text-[#0F1B4D]">{fmtDate(r.resolvedAt)}</p>
                      <p className="text-xs text-slate-400">{timeAgo(r.resolvedAt, now)}</p>
                    </div>

                    <Pill className={STATUS_STYLE[r.status]}>{r.status}</Pill>

                    <ChevronRight size={16} className="text-slate-400" />
                  </button>
                ))}
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
                      n === safePage ? "bg-[#1B2A8E] text-white" : "text-slate-600 hover:bg-slate-50",
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

              <p className="text-xs text-slate-500">
                {filtered.length === 0
                  ? "Showing 0 of 0"
                  : "Showing " + (start + 1) + "–" + (start + rows.length) + " of " + filtered.length}
              </p>
            </div>
          </section>
        </main>
      </div>

      {selected && (
        <ReportDrawer
          key={selected.id}
          report={selected}
          now={now}
          onClose={() => setSelectedId(null)}
          onReassess={handleReassess}
        />
      )}

      {toast && (
        <div className="fixed bottom-6 right-6 z-40 max-w-sm rounded-xl bg-[#0F1B4D] px-4 py-3 text-sm font-medium text-white shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}