import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  RefreshCw,
  ChevronDown,
  Clock,
  Play,
  ClipboardCheck,
  CheckCircle2,
  Image as ImageIcon,
  MapPin,
  ArrowLeft,
  ListChecks,
  Info,
  Loader2,
  Check,
  X,
} from "lucide-react";
import StaffSidebar from "../layouts/StaffSidebar";
import StaffHeader from "../layouts/StaffHeader";
import {
  staffFieldChecklists,
  staffFieldOutcomes,
} from "../components/data/MockDashboardData";
import {
  useStaffReports,
  FIELD_STAGES,
  fieldStageOf,
} from "../utils/StaffReportsContext.jsx";
import {
  SEVERITY_RANK,
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
const PANEL_TABS = ["Details", "Timeline"];

const STAGE_META = {
  "Awaiting Check": {
    icon: Clock,
    tint: "bg-amber-50 text-amber-600",
    hint: "Flagged, not visited yet",
    next: "Start the check once you are at the location.",
  },
  "In Progress": {
    icon: Play,
    tint: "bg-sky-50 text-sky-600",
    hint: "Check under way",
    next: "Finish the visit when you are done observing the location.",
  },
  "Findings to Record": {
    icon: ClipboardCheck,
    tint: "bg-violet-50 text-violet-600",
    hint: "Visit done, notes pending",
    next: "Record what you found. Your findings decide the next status.",
  },
};

const PRIMARY = {
  "Awaiting Check": { label: "Start field check", icon: Play },
  "In Progress": { label: "Finish visit", icon: CheckCircle2 },
  "Findings to Record": { label: "Record findings", icon: ClipboardCheck },
};

const lastAt = (r) => r.timeline[r.timeline.length - 1].at;

function checkReasons(r) {
  const out = [];
  if (!r.aiMatch) out.push("AI category does not match the photo");
  if (r.reusedPhoto) out.push("Photo may have been used in an earlier report");
  if (r.disputes > 0) out.push(r.disputes + " community disputes");
  if (r.credibility < 70) out.push("Credibility is " + r.credibility + "/100");
  if (out.length === 0) out.push("Evidence is not enough to decide remotely");
  return out;
}

function dialogConfig(kind, report) {
  if (kind === "cancel") {
    return {
      title: "Cancel field check",
      blurb: "The report goes back to the Review Queue as Under Review.",
      confirm: "Cancel check",
      fields: [
        { key: "note", label: "Why is the check no longer needed?", type: "textarea", required: true, placeholder: "e.g. Resident sent a clearer photo" },
      ],
    };
  }
  return {
    title: "Record findings",
    blurb: "Describe what you saw on site. Your outcome decides the next status.",
    confirm: "Save findings",
    fields: [
      { key: "outcome", label: "Outcome", type: "select", options: staffFieldOutcomes.map((o) => o.value), required: true },
      { key: "severity", label: "Severity seen on site", type: "select", options: ["High", "Medium", "Low"], blank: "Keep current (" + report.severity + ")", required: false },
      { key: "conditions", label: "Conditions observed", type: "textarea", required: true, placeholder: "What you saw, measured or heard on site" },
      { key: "note", label: "Follow-up notes", type: "textarea", required: false },
    ],
  };
}

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

function Stepper({ stage }) {
  const current = FIELD_STAGES.indexOf(stage);
  return (
    <div className="flex">
      {FIELD_STAGES.map((s, i) => {
        const circle =
          i < current
            ? "border-[#1B2A8E] bg-[#1B2A8E] text-white"
            : i === current
            ? "border-[#1B2A8E] bg-white text-[#1B2A8E]"
            : "border-[#E3E8F4] bg-white text-slate-300";
        return (
          <div key={s} className="relative flex flex-1 flex-col items-center">
            {i < FIELD_STAGES.length - 1 && (
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

function BoardCard({ report, active, now, onSelect }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={[
        "w-full rounded-xl border bg-white p-3 text-left transition-colors",
        active ? "border-[#1B2A8E] ring-2 ring-[#1B2A8E]/15" : "border-[#E3E8F4] hover:bg-slate-50",
      ].join(" ")}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-[11px] font-semibold text-[#1B2A8E]">{report.id}</p>
        <span
          className={["rounded px-1.5 py-0.5 text-[10px] font-semibold", SEVERITY_STYLE[report.severity]].join(" ")}
        >
          {report.severity}
        </span>
      </div>
      <p className="mt-1 truncate text-sm font-semibold text-[#0F1B4D]">{report.title}</p>
      <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-slate-500">
        <MapPin size={11} className="shrink-0" />
        {report.location}
      </p>
      <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
        <span>{report.category}</span>
        <span>{timeAgo(lastAt(report), now)}</span>
      </div>
    </button>
  );
}

function ActionDialog({ kind, report, onClose, onSubmit }) {
  const cfg = dialogConfig(kind, report);
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
  const outcome = staffFieldOutcomes.find((o) => o.value === values.outcome);

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
                    <option value="">{f.blank || "Select an option"}</option>
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

        {outcome && (
          <div className="mt-3 flex gap-2 rounded-xl border border-[#C9D3F5] bg-[#F3F6FE] p-3 text-xs leading-5 text-slate-600">
            <Info size={15} className="mt-0.5 shrink-0 text-[#1B2A8E]" />
            <p>{outcome.result}</p>
          </div>
        )}

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
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function DetailPanel({ report, busy, onPrimary, onCancel }) {
  const [tab, setTab] = useState("Details");
  const stage = fieldStageOf(report);
  const meta = STAGE_META[stage];
  const Primary = PRIMARY[stage];
  const PrimaryIcon = Primary.icon;
  const cred = credibilityOf(report.credibility);
  const guide = staffFieldChecklists[report.category] || staffFieldChecklists.Other;
  const flagged = [...report.timeline].reverse().find((t) => t.label === "Flagged for field check");

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
        </div>
      </div>

      <Stepper stage={stage} />

      <div className="rounded-xl border border-[#E3E8F4] p-3">
        <p className={LABEL}>Next step</p>
        <p className="mt-1.5 text-xs leading-5 text-slate-500">{meta.next}</p>
        <button
          type="button"
          onClick={onPrimary}
          disabled={busy}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-[#1B2A8E] px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#16237A] disabled:opacity-60"
        >
          {busy ? <Loader2 size={15} className="animate-spin" /> : <PrimaryIcon size={15} strokeWidth={2.2} />}
          <span>{busy ? "Saving..." : Primary.label}</span>
        </button>
        {stage === "Awaiting Check" && (
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg border border-[#E3E8F4] bg-white px-3 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-50"
          >
            <ArrowLeft size={15} strokeWidth={2.2} />
            <span>Back to Review Queue</span>
          </button>
        )}
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
            {t}
          </button>
        ))}
      </div>

      {tab === "Details" && (
        <div className="space-y-4">
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
            <p className="text-xs font-semibold text-amber-800">Why a check is needed</p>
            <ul className="mt-1.5 list-disc space-y-0.5 pl-4 text-xs text-amber-800">
              {checkReasons(report).map((x) => (
                <li key={x}>{x}</li>
              ))}
            </ul>
            {flagged && flagged.detail && (
              <p className="mt-2 text-xs text-amber-800">{"Staff note: " + flagged.detail}</p>
            )}
          </div>

          <div className="rounded-xl border border-[#E3E8F4] p-3">
            <p className="flex items-center gap-1.5 text-xs font-semibold text-[#0F1B4D]">
              <ListChecks size={14} className="text-[#1B2A8E]" />
              {"Field guide: " + report.category}
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-4 text-xs leading-5 text-slate-600">
              {guide.map((g) => (
                <li key={g}>{g}</li>
              ))}
            </ul>
          </div>

          <p className="text-sm leading-6 text-slate-600">{report.description}</p>

          <div className="flex flex-wrap gap-2 text-xs">
            <span className={["rounded-full border px-2 py-0.5 font-medium", cred.style].join(" ")}>
              {cred.label + " · " + report.credibility + "/100"}
            </span>
            <span className={["rounded-full border px-2 py-0.5 font-medium", STATUS_CHIP[report.status]].join(" ")}>
              {report.status}
            </span>
          </div>

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
    </aside>
  );
}

// ---------------------------------------------------------------
// PAGE
// ---------------------------------------------------------------
export default function StaffFieldChecksPage() {
  const navigate = useNavigate();
  const now = useNow();
  const { reports, recordAction } = useStaffReports();

  const [severity, setSeverity] = useState("All");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [dialog, setDialog] = useState(null);
  const [busy, setBusy] = useState(false);
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
  const fieldReports = reports
    .filter((r) => r.status === "Field Check")
    .sort(
      (a, b) =>
        SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity] ||
        new Date(a.submittedAt) - new Date(b.submittedAt)
    );

  const q = search.toLowerCase();
  const filtered = fieldReports.filter((r) => {
    if (severity !== "All" && r.severity !== severity) return false;
    if (q && ![r.id, r.title, r.location, r.category].join(" ").toLowerCase().indexOf(q) === -1) return true;
    return true;
  });

  const byStage = (stage) => filtered.filter((r) => fieldStageOf(r) === stage);
  const countStage = (stage) => fieldReports.filter((r) => fieldStageOf(r) === stage).length;

  const recorded = reports
    .filter((r) => r.fieldCheck && r.fieldCheck.stage === "Completed" && r.fieldCheck.findings)
    .sort((a, b) => new Date(b.fieldCheck.findings.at) - new Date(a.fieldCheck.findings.at));

  const selected = fieldReports.find((r) => r.id === selectedId) || filtered[0] || null;

  const STATS = [
    ...FIELD_STAGES.map((s) => ({ key: s, label: s, value: countStage(s), hint: STAGE_META[s].hint, icon: STAGE_META[s].icon, tint: STAGE_META[s].tint })),
    { key: "recorded", label: "Findings Recorded", value: recorded.length, hint: "Completed field checks", icon: CheckCircle2, tint: "bg-emerald-50 text-emerald-600" },
  ];

  // Fake latency lives in the shared store. Swap for PATCH /staff/reports/:id/field-check later.
  const runStage = async () => {
    const r = selected;
    const stage = fieldStageOf(r);
    if (stage === "Findings to Record") {
      setDialog("findings");
      return;
    }
    setBusy(true);
    const iso = new Date().toISOString();
    if (stage === "Awaiting Check") {
      await recordAction(r.id, {
        fieldCheck: { stage: "In Progress", startedAt: iso },
        entry: { label: "Field check started", detail: "Check under way at the location." },
      });
      setToast("Field check started for " + r.id + ".");
    } else {
      await recordAction(r.id, {
        fieldCheck: { stage: "Findings to Record" },
        entry: { label: "Field visit completed", detail: "Findings are ready to be recorded." },
      });
      setToast("Visit finished. Record your findings for " + r.id + ".");
    }
    setBusy(false);
  };

  const submitDialog = async (kind, values) => {
    const r = selected;
    if (kind === "cancel") {
      await recordAction(r.id, {
        status: "Under Review",
        entry: { label: "Field check cancelled", detail: values.note },
      });
      setToast(r.id + " sent back to the Review Queue.");
      return;
    }

    const outcome = staffFieldOutcomes.find((o) => o.value === values.outcome);
    const patch = {
      status: outcome.status,
      fieldCheck: {
        stage: "Completed",
        findings: {
          outcome: outcome.value,
          conditions: values.conditions,
          note: values.note || "",
          severity: values.severity || "",
          at: new Date().toISOString(),
        },
      },
      entry: {
        label: outcome.status === "Rejected" ? "Rejected after field check" : "Field check findings recorded",
        detail: outcome.value + ": " + values.conditions,
      },
    };
    if (outcome.status === "Verified" && values.severity && values.severity !== r.severity) {
      patch.severity = values.severity;
    }
    await recordAction(r.id, patch);
    setToast(
      outcome.status === "Verified"
        ? "Findings saved. " + r.id + " is verified and ready to forward."
        : outcome.status === "Rejected"
        ? "Findings saved. " + r.id + " was rejected."
        : "Findings saved. " + r.id + " is back to Needs Info."
    );
  };

  return (
    <div className="flex min-h-screen bg-[#F2F4FB]">
      <StaffSidebar onLogout={() => navigate("/signin")} />

      <div className="min-w-0 flex-1">
        <StaffHeader onSearch={(value) => setSearch(value)} />

        <main className="space-y-6 p-8">
          {/* TITLE ROW */}
          <section className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-[#0F1B4D]">Field Checks</h1>
              <p className="mt-1.5 max-w-xl text-sm text-slate-500">
                Reports that need an on-site check. Visit the location, then record your
                findings to decide the next status.
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
            {STATS.map(({ key, label, value, hint, icon: Icon, tint }) => (
              <div key={key} className="flex items-center gap-4 rounded-2xl border border-[#E3E8F4] bg-white p-5">
                <span className={["flex h-12 w-12 shrink-0 items-center justify-center rounded-full", tint].join(" ")}>
                  <Icon size={22} strokeWidth={2} />
                </span>
                <div className="min-w-0">
                  <p className="text-sm text-slate-500">{label}</p>
                  <p className="text-3xl font-bold text-[#0F1B4D]">{value}</p>
                  <p className="truncate text-xs text-slate-400">{hint}</p>
                </div>
              </div>
            ))}
          </section>

          <div className="w-56">
            <FilterSelect
              label="Severity"
              value={severity}
              onChange={setSeverity}
              options={[
                { value: "All", label: "All severities" },
                { value: "High", label: "High" },
                { value: "Medium", label: "Medium" },
                { value: "Low", label: "Low" },
              ]}
            />
          </div>

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_390px]">
            <div className="min-w-0 space-y-6">
              {/* BOARD */}
              <section className="grid gap-4 md:grid-cols-3">
                {FIELD_STAGES.map((stage) => {
                  const list = byStage(stage);
                  const Icon = STAGE_META[stage].icon;
                  return (
                    <div key={stage} className="min-w-0 rounded-2xl border border-[#E3E8F4] bg-[#F7F8FD] p-3">
                      <div className="mb-3 flex items-center justify-between gap-2 px-1">
                        <p className="flex items-center gap-1.5 text-sm font-bold text-[#0F1B4D]">
                          <Icon size={15} className="text-[#1B2A8E]" />
                          {stage}
                        </p>
                        <span className="rounded-full bg-[#DDE3F8] px-2 py-0.5 text-xs font-semibold text-[#1B2A8E]">
                          {list.length}
                        </span>
                      </div>
                      <div className="space-y-3">
                        {list.length === 0 && (
                          <p className="rounded-xl border border-dashed border-[#E3E8F4] p-4 text-center text-xs text-slate-400">
                            Nothing here right now.
                          </p>
                        )}
                        {list.map((r) => (
                          <BoardCard
                            key={r.id}
                            report={r}
                            now={now}
                            active={selected && selected.id === r.id}
                            onSelect={() => setSelectedId(r.id)}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </section>

              {/* RECENTLY RECORDED */}
              <section className={CARD}>
                <h2 className={LABEL}>Recently Recorded Findings</h2>
                {recorded.length === 0 ? (
                  <p className="mt-3 text-sm text-slate-500">
                    No findings recorded yet. Completed checks will show here.
                  </p>
                ) : (
                  <ul className="mt-3 divide-y divide-[#E3E8F4]">
                    {recorded.slice(0, 4).map((r) => {
                      const f = r.fieldCheck.findings;
                      const o = staffFieldOutcomes.find((x) => x.value === f.outcome);
                      return (
                        <li key={r.id} className="flex flex-wrap items-center justify-between gap-2 py-2.5">
                          <div className="min-w-0">
                            <Link
                              to={"/staff/review-queue/" + r.id}
                              className="text-sm font-semibold text-[#1B2A8E] hover:underline"
                            >
                              {r.id}
                            </Link>
                            <p className="truncate text-xs text-slate-500">{r.title + " · " + f.outcome}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span
                              className={["rounded-full border px-2 py-0.5 text-[11px] font-medium", STATUS_CHIP[o ? o.status : r.status]].join(" ")}
                            >
                              {r.status}
                            </span>
                            <span className="text-xs text-slate-400">{timeAgo(f.at, now)}</span>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </section>
            </div>

            {/* DETAIL PANEL */}
            {selected ? (
              <DetailPanel
                key={selected.id}
                report={selected}
                busy={busy}
                onPrimary={runStage}
                onCancel={() => setDialog("cancel")}
              />
            ) : (
              <aside className={CARD + " flex gap-2 self-start text-sm text-slate-500"}>
                <Info size={16} className="mt-0.5 shrink-0 text-[#1B2A8E]" />
                <p>
                  No reports need a field check. Flag a report for a field check from the
                  Review Queue and it will appear here.
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
          report={selected}
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