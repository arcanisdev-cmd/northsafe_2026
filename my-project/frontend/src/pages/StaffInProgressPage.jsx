import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  RefreshCw,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  Send,
  Activity,
  CalendarCheck,
  Image as ImageIcon,
  MapPin,
  Calendar,
  Plus,
  CheckCircle2,
  Loader2,
  Check,
  X,
  Info,
} from "lucide-react";
import StaffSidebar from "../layouts/StaffSidebar";
import StaffHeader from "../layouts/StaffHeader";
import {
  staffReceivingOffices,
  staffForwardMethods,
} from "../components/data/MockDashboardData";
import { useStaffReports, IN_PROGRESS_STATUSES } from "../utils/StaffReportsContext";
import {
  SEVERITY_STYLE,
  STATUS_CHIP,
  useNow,
  timeAgo,
  credibilityOf,
  formatDateTime,
  mapSrc,
} from "../utils/staffHelpers";

// ---------------------------------------------------------------
// CONSTANTS
// ---------------------------------------------------------------
const CARD = "rounded-2xl border border-[#E3E8F4] bg-white p-5";
const LABEL = "text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400";
const INPUT =
  "w-full rounded-xl border border-[#E3E8F4] bg-white p-2.5 text-sm text-[#0F1B4D] focus:border-[#1B2A8E] focus:outline-none focus:ring-2 focus:ring-[#1B2A8E]/15";
const ROW_GRID =
  "grid grid-cols-[28px_minmax(0,1fr)_170px_110px_90px] items-center gap-4";
const PAGE_SIZE = 6;
const TABS = ["All", "Forwarded", "In Progress"];
const STEPS = ["Submitted", "Verified", "Forwarded", "In Progress", "Resolved"];
const PANEL_TABS = ["Details", "Timeline", "Updates"];

const NEXT_STEP = {
  Forwarded: "Follow up with the receiving office and record what they tell you.",
  "In Progress": "Keep recording updates until the hazard is addressed, then mark it resolved.",
};

const DIALOGS = {
  update: {
    title: "Record progress update",
    blurb: "Log what the receiving office told you. It stays on the report timeline.",
    confirm: "Save update",
    fields: [
      { key: "method", label: "How did you get this update?", type: "select", options: staffForwardMethods, required: true },
      { key: "note", label: "Progress update", type: "textarea", required: true, placeholder: "e.g. Office confirmed the drain will be cleared this afternoon" },
    ],
  },
  resolve: {
    title: "Mark as resolved",
    blurb: "Confirm the hazard has been addressed. The report moves to Resolved Reports, and the community can still dispute it.",
    confirm: "Mark resolved",
    fields: [
      { key: "note", label: "Resolution note", type: "textarea", required: true, placeholder: "What was done and who confirmed it" },
    ],
  },
};

const STAT_CARDS = [
  { key: "total", label: "Total In Progress", hint: "Forwarded and being handled", icon: Clock, tint: "bg-[#E8EBFA] text-[#1B2A8E]" },
  { key: "forwarded", label: "Forwarded", hint: "Waiting on the office", icon: Send, tint: "bg-indigo-50 text-indigo-600" },
  { key: "active", label: "In Progress", hint: "Office is acting on it", icon: Activity, tint: "bg-orange-50 text-orange-600" },
  { key: "today", label: "Updated Today", hint: "Activity in the last 24 hours", icon: CalendarCheck, tint: "bg-emerald-50 text-emerald-600" },
];

const lastAt = (r) => r.timeline[r.timeline.length - 1].at;
const officeOf = (r) => (r.forwarding ? r.forwarding.office : "Not recorded");

// ---------------------------------------------------------------
// LOCAL COMPONENTS
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

function Stepper({ status }) {
  const current = STEPS.indexOf(status);
  return (
    <div className="flex">
      {STEPS.map((s, i) => {
        const circle =
          i < current
            ? "border-[#1B2A8E] bg-[#1B2A8E] text-white"
            : i === current
            ? "border-[#1B2A8E] bg-white text-[#1B2A8E]"
            : "border-[#E3E8F4] bg-white text-slate-300";
        return (
          <div key={s} className="relative flex flex-1 flex-col items-center">
            {i < STEPS.length - 1 && (
              <span
                className={[
                  "absolute left-1/2 top-3 h-px w-full",
                  i < current ? "bg-[#1B2A8E]" : "bg-[#E3E8F4]",
                ].join(" ")}
              />
            )}
            <span
              className={[
                "relative z-10 flex h-6 w-6 items-center justify-center rounded-full border-2 text-[10px] font-bold",
                circle,
              ].join(" ")}
            >
              {i < current ? <Check size={12} strokeWidth={3} /> : i + 1}
            </span>
            <span
              className={[
                "mt-1.5 text-center text-[10px] font-medium",
                i === current ? "text-[#1B2A8E]" : "text-slate-400",
              ].join(" ")}
            >
              {s}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function InfoRow({ label, children }) {
  return (
    <div className="flex items-start justify-between gap-3 py-1.5 text-sm">
      <dt className="shrink-0 text-slate-500">{label}</dt>
      <dd className="min-w-0 text-right font-medium text-[#0F1B4D]">{children}</dd>
    </div>
  );
}

function ActionDialog({ kind, onClose, onSubmit }) {
  const cfg = DIALOGS[kind];
  const [values, setValues] = useState({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape" && !saving) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [saving, onClose]);

  const setValue = (key, value) => setValues((p) => ({ ...p, [key]: value }));
  const valid = cfg.fields.every(
    (f) => !f.required || String(values[f.key] || "").trim() !== ""
  );

  const submit = async () => {
    setSaving(true);
    setError("");
    try {
      await onSubmit(kind, values);
      onClose();
    } catch (err) {
      setError("Could not save. Please try again.");
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#0F1B4D]/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={cfg.title}
    >
      <div className="w-full max-w-md rounded-2xl border border-[#E3E8F4] bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-[#0F1B4D]">{cfg.title}</h3>
            <p className="mt-1 text-sm text-slate-500">{cfg.blurb}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            aria-label="Close"
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-50 disabled:opacity-40"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mt-4 space-y-3">
          {cfg.fields.map((f) => (
            <label key={f.key} className="block">
              <span className="mb-1 block text-xs font-semibold text-slate-500">
                {f.label + (f.required ? " *" : "")}
              </span>
              {f.type === "select" ? (
                <div className="relative">
                  <select
                    value={values[f.key] || ""}
                    onChange={(e) => setValue(f.key, e.target.value)}
                    className={INPUT + " appearance-none pr-9"}
                  >
                    <option value="">Select an option</option>
                    {f.options.map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={16}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                </div>
              ) : (
                <textarea
                  value={values[f.key] || ""}
                  onChange={(e) => setValue(f.key, e.target.value)}
                  rows={3}
                  placeholder={f.placeholder}
                  className={INPUT + " resize-none"}
                />
              )}
            </label>
          ))}
        </div>

        {error && <p className="mt-3 text-xs font-medium text-red-600">{error}</p>}

        <div className="mt-5 flex gap-2">
          <button
            type="button"
            onClick={submit}
            disabled={!valid || saving}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#1B2A8E] px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#16237A] disabled:opacity-50"
          >
            {saving ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} strokeWidth={2.4} />}
            <span>{saving ? "Saving..." : cfg.confirm}</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="flex-1 rounded-lg bg-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-300 disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

function DetailPanel({ report, onRecord, onResolve }) {
  const [tab, setTab] = useState("Details");
  const fwd = report.forwarding;
  const cred = credibilityOf(report.credibility);
  const updates = [...report.updates].reverse();

  return (
    <aside className={CARD + " min-w-0 space-y-5 self-start"}>
      <div className="flex gap-3">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-slate-100 text-slate-400">
          {report.thumbnailUrl ? (
            <img src={report.thumbnailUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <ImageIcon size={22} strokeWidth={1.7} />
          )}
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-bold text-[#1B2A8E]">{report.id}</p>
            <span
              className={["rounded-md px-2 py-0.5 text-[11px] font-semibold", SEVERITY_STYLE[report.severity]].join(" ")}
            >
              {report.severity}
            </span>
          </div>
          <p className="truncate text-sm font-semibold text-[#0F1B4D]">{report.title}</p>
          <p className="flex items-center gap-1 truncate text-xs text-slate-500">
            <MapPin size={12} className="shrink-0" />
            {report.location}
          </p>
          {fwd && (
            <p className="flex items-center gap-1 text-xs text-slate-500">
              <Calendar size={12} className="shrink-0" />
              {"Forwarded " + formatDateTime(fwd.at)}
            </p>
          )}
        </div>
      </div>

      <Stepper status={report.status} />

      <div className="flex gap-2">
        <button
          type="button"
          onClick={onRecord}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-[#1B2A8E] px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#16237A]"
        >
          <Plus size={15} strokeWidth={2.4} />
          <span>Record update</span>
        </button>
        <button
          type="button"
          onClick={onResolve}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700 transition-colors hover:bg-emerald-100"
        >
          <CheckCircle2 size={15} strokeWidth={2.2} />
          <span>Mark resolved</span>
        </button>
      </div>

      <div className="flex gap-4 border-b border-[#E3E8F4]">
        {PANEL_TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={[
              "-mb-px border-b-2 pb-2 text-sm font-semibold transition-colors",
              tab === t
                ? "border-[#1B2A8E] text-[#1B2A8E]"
                : "border-transparent text-slate-400 hover:text-slate-600",
            ].join(" ")}
          >
            {t === "Updates" ? "Updates (" + report.updates.length + ")" : t}
          </button>
        ))}
      </div>

      {tab === "Details" && (
        <div className="space-y-4">
          <div className="rounded-xl border border-[#E3E8F4] p-3">
            <p className={LABEL}>Current Status</p>
            <span
              className={["mt-2 inline-block rounded-full border px-2.5 py-0.5 text-xs font-semibold", STATUS_CHIP[report.status]].join(" ")}
            >
              {report.status}
            </span>
            <p className="mt-2 text-xs leading-5 text-slate-500">{NEXT_STEP[report.status]}</p>
          </div>

          <dl className="divide-y divide-[#E3E8F4] rounded-xl border border-[#E3E8F4] px-3">
            <InfoRow label="Category">{report.category}</InfoRow>
            <InfoRow label="Reporter">{report.reporter}</InfoRow>
            <InfoRow label="Credibility">
              <span className={["rounded-full border px-2 py-0.5 text-[11px] font-medium", cred.style].join(" ")}>
                {cred.label + " · " + report.credibility + "/100"}
              </span>
            </InfoRow>
            {fwd && (
              <>
                <InfoRow label="Forwarded to">{fwd.office}</InfoRow>
                <InfoRow label="Method">{fwd.method}</InfoRow>
                {fwd.contact && <InfoRow label="Contact">{fwd.contact}</InfoRow>}
              </>
            )}
          </dl>

          <p className="text-sm leading-6 text-slate-600">{report.description}</p>
          {fwd && fwd.note && (
            <p className="rounded-xl bg-[#F7F8FD] p-3 text-xs leading-5 text-slate-600">
              {"Forwarding note: " + fwd.note}
            </p>
          )}

          <div className="h-36 overflow-hidden rounded-xl border border-[#E3E8F4]">
            <iframe
              title="Report location"
              src={mapSrc(report.lat, report.lng)}
              className="h-full w-full border-0"
              loading="lazy"
            />
          </div>

          <Link
            to={"/staff/review-queue/" + report.id}
            className="block text-center text-xs font-semibold text-[#1B2A8E] hover:underline"
          >
            Open full report
          </Link>
        </div>
      )}

      {tab === "Timeline" && (
        <ol className="relative space-y-5 border-l border-[#E3E8F4] pl-5">
          {report.timeline.map((t, idx) => (
            <li key={t.at + t.label} className="relative">
              <span
                className={[
                  "absolute -left-[26px] top-1 h-2.5 w-2.5 rounded-full",
                  idx === report.timeline.length - 1 ? "bg-[#1B2A8E]" : "bg-[#C9D3F5]",
                ].join(" ")}
              />
              <p className="text-sm font-semibold text-[#0F1B4D]">{t.label}</p>
              {t.detail && <p className="text-xs text-slate-500">{t.detail}</p>}
              <p className="mt-0.5 text-[11px] text-slate-400">{formatDateTime(t.at) + " · " + t.by}</p>
            </li>
          ))}
        </ol>
      )}

      {tab === "Updates" && (
        <div className="space-y-3">
          {updates.length === 0 && (
            <p className="rounded-xl bg-[#F7F8FD] p-4 text-center text-xs text-slate-500">
              No progress updates yet. Record one after you hear from the receiving office.
            </p>
          )}
          {updates.map((u) => (
            <div key={u.at + u.note} className="rounded-xl border border-[#E3E8F4] p-3">
              <p className="text-sm text-[#0F1B4D]">{u.note}</p>
              <p className="mt-1 text-[11px] text-slate-400">
                {formatDateTime(u.at) + " · " + u.by + (u.method ? " · via " + u.method.toLowerCase() : "")}
              </p>
            </div>
          ))}
        </div>
      )}
    </aside>
  );
}

// ---------------------------------------------------------------
// PAGE
// ---------------------------------------------------------------
export default function StaffInProgressPage() {
  const navigate = useNavigate();
  const now = useNow();
  const { reports, recordAction } = useStaffReports();

  const [tab, setTab] = useState("All");
  const [office, setOffice] = useState("All");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState(null);
  const [dialog, setDialog] = useState(null);
  const [toast, setToast] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [updatedAt, setUpdatedAt] = useState(() => new Date().toISOString());

  useEffect(() => {
    if (!toast) return undefined;
    const t = setTimeout(() => setToast(""), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  // Fake async to mimic real latency until the Laravel API is wired
  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setUpdatedAt(new Date().toISOString());
      setRefreshing(false);
    }, 700);
  };

  // ---- derive everything from the shared list ----
  const inProgress = reports
    .filter((r) => IN_PROGRESS_STATUSES.includes(r.status))
    .sort((a, b) => new Date(lastAt(b)) - new Date(lastAt(a)));

  const countOf = (status) => inProgress.filter((r) => r.status === status).length;
  const statValues = {
    total: inProgress.length,
    forwarded: countOf("Forwarded"),
    active: countOf("In Progress"),
    today: inProgress.filter((r) => (now - new Date(lastAt(r))) / 3600000 <= 24).length,
  };

  const q = search.toLowerCase();
  const filtered = inProgress.filter((r) => {
    if (tab !== "All" && r.status !== tab) return false;
    if (office !== "All" && officeOf(r) !== office) return false;
    if (q) {
      const haystack = [r.id, r.title, r.location, r.category, officeOf(r)].join(" ").toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * PAGE_SIZE;
  const rows = filtered.slice(start, start + PAGE_SIZE);
  const selected = inProgress.find((r) => r.id === selectedId) || filtered[0] || null;

  const tabCount = (t) => (t === "All" ? inProgress.length : countOf(t));

  // Fake latency lives in the shared store. Swap for POST /staff/reports/:id/updates later.
  const submitDialog = async (kind, values) => {
    const r = selected;
    if (kind === "update") {
      await recordAction(r.id, {
        status: "In Progress",
        update: { note: values.note, method: values.method },
        entry: {
          label: "Progress update",
          detail: values.note + " (via " + values.method.toLowerCase() + ")",
        },
      });
      setToast("Progress update recorded for " + r.id + ".");
    } else {
      await recordAction(r.id, {
        status: "Resolved",
        resolution: { note: values.note },
        entry: { label: "Marked resolved", detail: values.note },
      });
      setToast(r.id + " marked resolved. It now appears under Resolved Reports.");
    }
  };

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
              <h1 className="text-3xl font-bold text-[#0F1B4D]">In Progress</h1>
              <p className="mt-1.5 max-w-xl text-sm text-slate-500">
                Reports forwarded to receiving offices. Record progress updates until the
                hazard is resolved.
              </p>
            </div>
            <div className="flex flex-col items-end gap-1">
              <button
                type="button"
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center gap-2 rounded-xl border border-[#E3E8F4] bg-white px-4 py-2.5 text-sm font-semibold text-[#1B2A8E] transition-colors hover:bg-slate-50 disabled:opacity-60"
              >
                <RefreshCw size={15} strokeWidth={2.2} className={refreshing ? "animate-spin" : ""} />
                <span>Refresh</span>
              </button>
              <p className="text-xs text-slate-400">{"Updated " + timeAgo(updatedAt, now).toLowerCase()}</p>
            </div>
          </section>

          {/* STAT CARDS */}
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {STAT_CARDS.map(({ key, label, hint, icon: Icon, tint }) => (
              <div key={key} className="flex items-center gap-4 rounded-2xl border border-[#E3E8F4] bg-white p-5">
                <span className={["flex h-12 w-12 shrink-0 items-center justify-center rounded-full", tint].join(" ")}>
                  <Icon size={22} strokeWidth={2} />
                </span>
                <div className="min-w-0">
                  <p className="text-sm text-slate-500">{label}</p>
                  <p className="text-3xl font-bold text-[#0F1B4D]">{statValues[key]}</p>
                  <p className="truncate text-xs text-slate-400">{hint}</p>
                </div>
              </div>
            ))}
          </section>

          {/* TABS + OFFICE FILTER */}
          <section className="flex flex-wrap items-end justify-between gap-4">
            <div className="flex flex-wrap gap-2">
              {TABS.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => {
                    setTab(t);
                    setPage(1);
                  }}
                  aria-pressed={tab === t}
                  className={[
                    "rounded-full border px-4 py-2 text-sm font-semibold transition-colors",
                    tab === t
                      ? "border-[#1B2A8E] bg-[#1B2A8E] text-white"
                      : "border-[#E3E8F4] bg-white text-slate-600 hover:bg-slate-50",
                  ].join(" ")}
                >
                  {t + " (" + tabCount(t) + ")"}
                </button>
              ))}
            </div>
            <div className="w-64">
              <FilterSelect
                label="Receiving office"
                value={office}
                onChange={(v) => {
                  setOffice(v);
                  setPage(1);
                }}
                options={[
                  { value: "All", label: "All offices" },
                  ...staffReceivingOffices.map((o) => ({ value: o, label: o })),
                ]}
              />
            </div>
          </section>

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_390px]">
            {/* TABLE */}
            <section className="min-w-0 self-start overflow-hidden rounded-2xl border border-[#E3E8F4] bg-white">
              <div className="overflow-x-auto">
                <div className="min-w-[760px]">
                  <div
                    className={[
                      ROW_GRID,
                      "bg-[#F7F8FD] px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-400",
                    ].join(" ")}
                  >
                    <span>#</span>
                    <span>Report Details</span>
                    <span>Forwarded To</span>
                    <span>Status</span>
                    <span>Updated</span>
                  </div>

                  {rows.length === 0 && (
                    <div className="border-t border-[#E3E8F4] px-5 py-10 text-center text-sm text-slate-500">
                      No forwarded or in-progress reports match these filters.
                    </div>
                  )}

                  {rows.map((r, idx) => {
                    const active = selected && selected.id === r.id;
                    return (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => setSelectedId(r.id)}
                        className={[
                          ROW_GRID,
                          "w-full border-t border-[#E3E8F4] px-5 py-3 text-left transition-colors",
                          active ? "bg-[#F3F6FE]" : "hover:bg-slate-50",
                        ].join(" ")}
                      >
                        <span className="text-sm text-slate-400">{start + idx + 1}</span>
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-slate-100 text-slate-400">
                            {r.thumbnailUrl ? (
                              <img src={r.thumbnailUrl} alt="" className="h-full w-full object-cover" />
                            ) : (
                              <ImageIcon size={18} strokeWidth={1.7} />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-[11px] font-semibold text-[#1B2A8E]">{r.id}</p>
                            <p className="truncate text-sm font-semibold text-[#0F1B4D]">{r.title}</p>
                            <p className="flex items-center gap-1.5 truncate text-xs text-slate-500">
                              <span>{r.category}</span>
                              <span
                                className={["rounded px-1.5 py-0.5 text-[10px] font-semibold", SEVERITY_STYLE[r.severity]].join(" ")}
                              >
                                {r.severity}
                              </span>
                            </p>
                          </div>
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-[#0F1B4D]">{officeOf(r)}</p>
                          <p className="truncate text-xs text-slate-500">
                            {r.forwarding ? "via " + r.forwarding.method.toLowerCase() : ""}
                          </p>
                        </div>
                        <span
                          className={["w-fit rounded-full border px-2.5 py-0.5 text-xs font-medium", STATUS_CHIP[r.status]].join(" ")}
                        >
                          {r.status}
                        </span>
                        <span className="text-sm text-slate-600">{timeAgo(lastAt(r), now)}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

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
                    ? "Showing 0 reports"
                    : "Showing " + (start + 1) + "–" + (start + rows.length) + " of " + filtered.length + " reports"}
                </p>
              </div>
            </section>

            {/* DETAIL PANEL */}
            {selected ? (
              <DetailPanel
                key={selected.id}
                report={selected}
                onRecord={() => setDialog("update")}
                onResolve={() => setDialog("resolve")}
              />
            ) : (
              <aside className={CARD + " flex gap-2 self-start text-sm text-slate-500"}>
                <Info size={16} className="mt-0.5 shrink-0 text-[#1B2A8E]" />
                <p>
                  Select a report to see its forwarding details, timeline and updates. Forward
                  a verified report from its detail page and it will appear here.
                </p>
              </aside>
            )}
          </div>
        </main>
      </div>

      {dialog && selected && (
        <ActionDialog
          key={dialog}
          kind={dialog}
          onClose={() => setDialog(null)}
          onSubmit={submitDialog}
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