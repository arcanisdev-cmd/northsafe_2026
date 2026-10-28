import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ChevronLeft,
  ChevronDown,
  MapPin,
  Navigation,
  Calendar,
  User,
  Tag,
  Cpu,
  Image as ImageIcon,
  CheckCircle2,
  HelpCircle,
  XCircle,
  Flag,
  UserX,
  Send,
  Loader2,
  Check,
  X,
  TriangleAlert,
  MinusCircle,
  Info,
} from "lucide-react";
import StaffSidebar from "../layouts/StaffSidebar";
import StaffHeader from "../layouts/StaffHeader";
import {
  staffOfficer,
  staffReviewQueue,
  staffReceivingOffices,
  staffForwardMethods,
  staffRoutingSuggestions,
  staffRejectReasons,
  staffSuspiciousReasons,
  staffDeactivationReasons,
  staffReporterHistory,
} from "../components/data/MockDashboardData";
import {
  SEVERITY_STYLE,
  STATUS_CHIP,
  mapSrc,
  credibilityOf,
  formatDateTime,
} from "../utils/staffHelpers";

// ---------------------------------------------------------------
// CONSTANTS
// ---------------------------------------------------------------
const CARD = "rounded-2xl border border-[#E3E8F4] bg-white p-5";
const LABEL = "text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400";
const INPUT =
  "w-full rounded-xl border border-[#E3E8F4] bg-white p-2.5 text-sm text-[#0F1B4D] focus:border-[#1B2A8E] focus:outline-none focus:ring-2 focus:ring-[#1B2A8E]/15";

const DECIDABLE = ["Under Review", "Needs Info", "Field Check"];

// Every staff action in one place: fields, resulting status, timeline entry
const ACTIONS = {
  verify: {
    title: "Verify report",
    blurb: "Confirm that this report is genuine. It will be ready to forward to a receiving office.",
    confirm: "Verify report",
    status: "Verified",
    flag: null,
    toast: "Report verified. You can now forward it.",
    fields: [],
    entry: () => ({
      label: "Verified by staff",
      detail: "Ready to forward to the receiving office.",
    }),
  },
  info: {
    title: "Request additional information",
    blurb: "The reporter will be notified and asked to add more details.",
    confirm: "Send request",
    status: "Needs Info",
    flag: null,
    toast: "Request sent. Status set to Needs Info.",
    fields: [
      {
        key: "note",
        label: "What should the reporter add?",
        type: "textarea",
        required: true,
        placeholder: "e.g. A clearer photo of the flooded area",
      },
    ],
    entry: (v) => ({ label: "Additional info requested", detail: v.note }),
  },
  field: {
    title: "Flag for field check",
    blurb: "Evidence is not enough or conflicts. Staff will check the location and record findings.",
    confirm: "Flag for field check",
    status: "Field Check",
    flag: null,
    toast: "Flagged for field check.",
    fields: [{ key: "note", label: "Note for the field check", type: "textarea", required: false }],
    entry: (v) => ({
      label: "Flagged for field check",
      detail: v.note || "On-site check needed before a decision.",
    }),
  },
  reject: {
    title: "Reject report",
    blurb: "The reporter will be told the report was not accepted. A reason is required.",
    confirm: "Reject report",
    status: "Rejected",
    flag: null,
    toast: "Report rejected.",
    fields: [
      { key: "reason", label: "Reason for rejection", type: "select", options: staffRejectReasons, required: true },
      { key: "note", label: "Notes", type: "textarea", required: false },
    ],
    entry: (v) => ({
      label: "Rejected",
      detail: v.reason + (v.note ? ": " + v.note : ""),
    }),
  },
  suspicious: {
    title: "Flag as suspicious",
    blurb: "Flagged reports are sent to Admin for review. This does not change the report status.",
    confirm: "Flag report",
    status: null,
    flag: "suspicious",
    toast: "Report flagged as suspicious and sent to Admin.",
    fields: [
      { key: "reason", label: "Why is it suspicious?", type: "select", options: staffSuspiciousReasons, required: true },
      { key: "note", label: "Notes", type: "textarea", required: false },
    ],
    entry: (v) => ({
      label: "Flagged as suspicious",
      detail: v.reason + (v.note ? ": " + v.note : ""),
    }),
  },
  deactivate: {
    title: "Report user account",
    blurb: "Send the reporter's account to Admin for deactivation review. Only Admin can deactivate accounts.",
    confirm: "Send to Admin",
    status: null,
    flag: "deactivation",
    toast: "Account reported to Admin for review.",
    fields: [
      { key: "reason", label: "Reason", type: "select", options: staffDeactivationReasons, required: true },
      { key: "note", label: "Details", type: "textarea", required: true },
    ],
    entry: (v) => ({
      label: "Reporter account sent to Admin",
      detail: v.reason + ": " + v.note,
    }),
  },
  forward: {
    title: "Forward report",
    blurb: "Forwarding is done outside the system. Record who you contacted and how.",
    confirm: "Record forwarding",
    status: "Forwarded",
    flag: null,
    toast: "Forwarding recorded. Status set to Forwarded.",
    fields: [
      { key: "office", label: "Receiving office", type: "select", options: staffReceivingOffices, required: true },
      { key: "method", label: "Method", type: "select", options: staffForwardMethods, required: true },
      { key: "contact", label: "Person contacted", type: "text", required: false, placeholder: "Optional" },
      { key: "note", label: "Notes", type: "textarea", required: true, placeholder: "What was shared with the office" },
    ],
    entry: (v) => ({
      label: "Forwarded to " + v.office,
      detail:
        "Via " + v.method + (v.contact ? " (" + v.contact + ")" : "") + ". " + v.note,
    }),
  },
};

const DECISIONS = [
  { kind: "verify", label: "Verify", icon: CheckCircle2, style: "border-[#1B2A8E] bg-[#1B2A8E] text-white hover:bg-[#16237A]" },
  { kind: "info", label: "Request additional info", icon: HelpCircle, style: "border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100" },
  { kind: "field", label: "Flag for field check", icon: MapPin, style: "border-sky-300 bg-sky-50 text-sky-700 hover:bg-sky-100" },
  { kind: "reject", label: "Reject", icon: XCircle, style: "border-red-300 bg-red-50 text-red-700 hover:bg-red-100" },
];

const FLAG_BUTTONS = [
  { kind: "suspicious", label: "Flag as suspicious", icon: Flag, flag: "suspicious" },
  { kind: "deactivate", label: "Report user account", icon: UserX, flag: "deactivation" },
];

const TONE = {
  pass: { Icon: CheckCircle2, icon: "text-emerald-600", chip: "border-emerald-200 bg-emerald-50 text-emerald-700", label: "Looks fine" },
  warn: { Icon: TriangleAlert, icon: "text-amber-600", chip: "border-amber-200 bg-amber-50 text-amber-700", label: "Check" },
  fail: { Icon: XCircle, icon: "text-red-600", chip: "border-red-200 bg-red-50 text-red-700", label: "Concern" },
  neutral: { Icon: MinusCircle, icon: "text-slate-400", chip: "border-slate-200 bg-slate-50 text-slate-500", label: "No data" },
};

// ---------------------------------------------------------------
// DERIVED DATA
// ---------------------------------------------------------------
function buildIndicators(r) {
  const h = staffReporterHistory[r.reporter];
  const rate = h ? Math.round((h.verified / h.submitted) * 100) : null;

  let communityTone = "neutral";
  let communityText = "No community input yet.";
  if (r.confirmations || r.disputes) {
    communityTone = r.disputes > 0 ? "warn" : "pass";
    communityText = r.confirmations + " confirmed, " + r.disputes + " disputed.";
  }

  return [
    {
      key: "photo",
      label: "Photo check",
      tone: r.aiMatch ? "pass" : "warn",
      text: r.aiMatch
        ? "Photo is consistent with the reported category."
        : "Photo does not clearly match the reported category.",
    },
    {
      key: "reused",
      label: "Reused-photo detection",
      tone: r.reusedPhoto ? "fail" : "pass",
      text: r.reusedPhoto
        ? "This photo may have been used in an earlier report."
        : "No matching photo found in earlier reports.",
    },
    {
      key: "location",
      label: "Location",
      tone: "pass",
      text: "Pin is inside Barangay 171 (Bagumbong).",
    },
    { key: "community", label: "Community confirmations", tone: communityTone, text: communityText },
    {
      key: "history",
      label: "Reporter history",
      tone: !h ? "neutral" : rate >= 70 ? "pass" : "warn",
      text: h
        ? h.submitted + " reports, " + h.verified + " verified, " + h.rejected + " rejected (" + rate + "% verified)."
        : "No earlier reports from this account.",
    },
  ];
}

function buildTimeline(r) {
  const t = new Date(r.submittedAt).getTime();
  const at = (m) => new Date(t + m * 60000).toISOString();
  const items = [
    { label: "Report submitted", detail: "By " + r.reporter, at: at(0), by: "Reporter" },
    {
      label: "AI assessment completed",
      detail: r.aiCategory + ", " + r.aiSeverity + " severity (suggestion only)",
      at: at(1),
      by: "System",
    },
    { label: "Added to Review Queue", detail: "Status: Under Review", at: at(2), by: "System" },
  ];
  if (r.status === "Needs Info") {
    items.push({ label: "Additional info requested", detail: "Waiting on the reporter.", at: at(8), by: staffOfficer.name });
  }
  if (r.status === "Field Check") {
    items.push({ label: "Flagged for field check", detail: "On-site check needed before a decision.", at: at(8), by: staffOfficer.name });
  }
  return items;
}

// ---------------------------------------------------------------
// LOCAL COMPONENTS
// ---------------------------------------------------------------
function Shell({ children }) {
  const navigate = useNavigate();
  return (
    <div className="flex min-h-screen bg-[#F2F4FB]">
      <StaffSidebar onLogout={() => navigate("/signin")} />
      <div className="min-w-0 flex-1">
        <StaffHeader onSearch={() => {}} />
        <main className="space-y-6 p-8">{children}</main>
      </div>
    </div>
  );
}

function DetailRow({ icon: Icon, children }) {
  return (
    <li className="flex items-start gap-2 text-sm text-slate-600">
      <Icon size={15} strokeWidth={2} className="mt-0.5 shrink-0 text-slate-400" />
      <span className="min-w-0">{children}</span>
    </li>
  );
}

function ActionDialog({ kind, suggestedOffice, onClose, onSubmit }) {
  const cfg = ACTIONS[kind];
  const [values, setValues] = useState(
    kind === "forward" ? { office: suggestedOffice || "" } : {}
  );
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
              {f.type === "select" && (
                <div className="relative">
                  <select
                    value={values[f.key] || ""}
                    onChange={(e) => setValue(f.key, e.target.value)}
                    className={INPUT + " appearance-none pr-9"}
                  >
                    <option value="">Select an option</option>
                    {f.options.map((o) => (
                      <option key={o} value={o}>
                        {o + (f.key === "office" && o === suggestedOffice ? " (suggested)" : "")}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={16}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                </div>
              )}
              {f.type === "textarea" && (
                <textarea
                  value={values[f.key] || ""}
                  onChange={(e) => setValue(f.key, e.target.value)}
                  rows={3}
                  placeholder={f.placeholder}
                  className={INPUT + " resize-none"}
                />
              )}
              {f.type === "text" && (
                <input
                  type="text"
                  value={values[f.key] || ""}
                  onChange={(e) => setValue(f.key, e.target.value)}
                  placeholder={f.placeholder}
                  className={INPUT}
                />
              )}
            </label>
          ))}
        </div>

        {kind === "forward" && (
          <div className="mt-3 flex gap-2 rounded-xl border border-[#C9D3F5] bg-[#F3F6FE] p-3 text-xs leading-5 text-slate-600">
            <Info size={15} className="mt-0.5 shrink-0 text-[#1B2A8E]" />
            <p>The suggested office follows Admin routing rules. You can choose another office.</p>
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
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------
// DETAIL VIEW
// ---------------------------------------------------------------
function DetailView({ initial }) {
  const [report, setReport] = useState(initial);
  const [timeline, setTimeline] = useState(() => buildTimeline(initial));
  const [flags, setFlags] = useState({ suspicious: false, deactivation: false });
  const [dialog, setDialog] = useState(null);
  const [toast, setToast] = useState("");

  useEffect(() => {
    if (!toast) return undefined;
    const t = setTimeout(() => setToast(""), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  // Fake async save. Swap for POST /staff/reports/:id/actions when Laravel is ready.
  const submitAction = (kind, values) =>
    new Promise((resolve) => {
      setTimeout(() => {
        const cfg = ACTIONS[kind];
        const entry = cfg.entry(values);
        if (cfg.status) setReport((r) => ({ ...r, status: cfg.status }));
        if (cfg.flag) setFlags((f) => ({ ...f, [cfg.flag]: true }));
        setTimeline((t) => [
          ...t,
          { ...entry, at: new Date().toISOString(), by: staffOfficer.name },
        ]);
        setToast(cfg.toast);
        resolve();
      }, 800);
    });

  const canDecide = DECIDABLE.includes(report.status);
  const canForward = report.status === "Verified";
  const indicators = buildIndicators(report);
  const cred = credibilityOf(report.credibility);
  const suggestedOffice = staffRoutingSuggestions[report.category] || "";
  const lastIndex = timeline.length - 1;

  return (
    <>
      <Link
        to="/staff/review-queue"
        className="inline-flex items-center gap-1 text-sm font-semibold text-[#1B2A8E] hover:underline"
      >
        <ChevronLeft size={16} />
        <span>Back to Review Queue</span>
      </Link>

      {/* TITLE ROW */}
      <section className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-semibold text-[#1B2A8E]">{report.id}</span>
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
          {flags.suspicious && (
            <span className="rounded-full border border-pink-200 bg-pink-50 px-2.5 py-0.5 text-xs font-semibold text-pink-700">
              Flagged suspicious
            </span>
          )}
          {flags.deactivation && (
            <span className="rounded-full border border-violet-200 bg-violet-50 px-2.5 py-0.5 text-xs font-semibold text-violet-700">
              Account reported to Admin
            </span>
          )}
        </div>
        <h1 className="text-3xl font-bold text-[#0F1B4D]">{report.title}</h1>
      </section>

      {report.category === "Fire Risk" && (
        <div className="flex gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          <TriangleAlert size={16} className="mt-0.5 shrink-0" />
          <p>
            Fire Risk covers risks only. If there is an active fire, the reporter should
            call the emergency hotlines right away.
          </p>
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        {/* LEFT: EVIDENCE */}
        <div className="min-w-0 space-y-6">
          <section className={CARD + " space-y-4"}>
            <h2 className={LABEL}>Evidence</h2>
            <div className="flex h-64 items-center justify-center overflow-hidden rounded-xl border border-[#E3E8F4] bg-slate-100 text-slate-400">
              {report.thumbnailUrl ? (
                <img src={report.thumbnailUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="flex flex-col items-center gap-1 text-xs">
                  <ImageIcon size={28} strokeWidth={1.7} />
                  <span>No photo in mock data</span>
                </div>
              )}
            </div>
            <p className="text-sm leading-6 text-slate-600">{report.description}</p>
            <ul className="grid gap-2 sm:grid-cols-2">
              <DetailRow icon={Tag}>{report.category}</DetailRow>
              <DetailRow icon={User}>{"Reported by " + report.reporter}</DetailRow>
              <DetailRow icon={MapPin}>{report.location}</DetailRow>
              <DetailRow icon={Calendar}>{formatDateTime(report.submittedAt)}</DetailRow>
              <DetailRow icon={Navigation}>
                {report.lat.toFixed(5) + ", " + report.lng.toFixed(5)}
              </DetailRow>
            </ul>
          </section>

          <div className="grid gap-6 md:grid-cols-2">
            <section className={CARD + " space-y-3"}>
              <h2 className={LABEL}>Map Location</h2>
              <div className="h-56 overflow-hidden rounded-xl border border-[#E3E8F4]">
                <iframe
                  title="Report location"
                  src={mapSrc(report.lat, report.lng)}
                  className="h-full w-full border-0"
                  loading="lazy"
                />
              </div>
              <p className="text-xs text-slate-500">Barangay 171 (Bagumbong), Caloocan City</p>
            </section>

            <section className={CARD + " space-y-3"}>
              <h2 className={LABEL}>AI Assessment</h2>
              <dl className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <dt className="text-slate-500">Suggested category</dt>
                  <dd className="font-semibold text-[#0F1B4D]">{report.aiCategory}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-slate-500">Suggested severity</dt>
                  <dd className="font-semibold text-[#0F1B4D]">{report.aiSeverity}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-slate-500">Category match</dt>
                  <dd
                    className={[
                      "rounded-full border px-2 py-0.5 text-xs font-medium",
                      report.aiMatch
                        ? "border-slate-200 bg-slate-50 text-slate-600"
                        : "border-violet-200 bg-violet-50 text-violet-700",
                    ].join(" ")}
                  >
                    {report.aiMatch ? "AI match" : "AI mismatch"}
                  </dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-slate-500">Credibility</dt>
                  <dd
                    className={[
                      "rounded-full border px-2 py-0.5 text-xs font-medium",
                      cred.style,
                    ].join(" ")}
                  >
                    {cred.label + " · " + report.credibility + "/100"}
                  </dd>
                </div>
              </dl>
              <div className="flex gap-2 rounded-xl border border-[#C9D3F5] bg-[#F3F6FE] p-3 text-xs leading-5 text-slate-600">
                <Cpu size={15} className="mt-0.5 shrink-0 text-[#1B2A8E]" />
                <p>AI results are suggestions only. You make the final decision.</p>
              </div>
            </section>
          </div>

          <section className={CARD}>
            <h2 className={LABEL}>Credibility Indicators</h2>
            <ul className="mt-3 divide-y divide-[#E3E8F4]">
              {indicators.map((i) => {
                const tone = TONE[i.tone];
                const Icon = tone.Icon;
                return (
                  <li key={i.key} className="flex items-start gap-3 py-3">
                    <Icon size={18} strokeWidth={2} className={["mt-0.5 shrink-0", tone.icon].join(" ")} />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-[#0F1B4D]">{i.label}</p>
                      <p className="text-xs text-slate-500">{i.text}</p>
                    </div>
                    <span
                      className={[
                        "shrink-0 rounded-full border px-2 py-0.5 text-[11px] font-medium",
                        tone.chip,
                      ].join(" ")}
                    >
                      {tone.label}
                    </span>
                  </li>
                );
              })}
            </ul>
          </section>
        </div>

        {/* RIGHT: ACTIONS + TIMELINE */}
        <aside className="min-w-0 space-y-6 self-start">
          <section className={CARD + " space-y-3"}>
            <h2 className={LABEL}>Decision</h2>
            {!canDecide && (
              <p className="text-xs text-slate-500">
                {canForward
                  ? "This report is verified. Forward it to a receiving office below."
                  : "A decision has already been recorded for this report."}
              </p>
            )}
            <div className="space-y-2">
              {DECISIONS.map((d) => {
                const Icon = d.icon;
                const disabled = !canDecide || report.status === ACTIONS[d.kind].status;
                return (
                  <button
                    key={d.kind}
                    type="button"
                    disabled={disabled}
                    onClick={() => setDialog(d.kind)}
                    className={[
                      "flex w-full items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-40",
                      d.style,
                    ].join(" ")}
                  >
                    <Icon size={15} strokeWidth={2.2} />
                    <span>{d.label}</span>
                  </button>
                );
              })}
            </div>
          </section>

          <section className={CARD + " space-y-3"}>
            <h2 className={LABEL}>Forward</h2>
            <p className="text-xs text-slate-500">
              {canForward
                ? "Suggested office: " + suggestedOffice + "."
                : report.status === "Forwarded"
                ? "Forwarded. Track progress on the In Progress page."
                : "Verify the report first to enable forwarding."}
            </p>
            <button
              type="button"
              disabled={!canForward}
              onClick={() => setDialog("forward")}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-indigo-300 bg-indigo-50 px-3 py-2 text-sm font-semibold text-indigo-700 transition-colors hover:bg-indigo-100 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Send size={15} strokeWidth={2.2} />
              <span>Forward report</span>
            </button>
          </section>

          <section className={CARD + " space-y-3"}>
            <h2 className={LABEL}>Report to Admin</h2>
            <div className="space-y-2">
              {FLAG_BUTTONS.map((b) => {
                const Icon = b.icon;
                const done = flags[b.flag];
                return (
                  <button
                    key={b.kind}
                    type="button"
                    disabled={done}
                    onClick={() => setDialog(b.kind)}
                    className="flex w-full items-center justify-center gap-2 rounded-lg border border-[#E3E8F4] bg-white px-3 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Icon size={15} strokeWidth={2.2} />
                    <span>{done ? b.label + " (sent)" : b.label}</span>
                  </button>
                );
              })}
            </div>
          </section>

          <section className={CARD}>
            <h2 className={LABEL}>Status Timeline</h2>
            <ol className="relative mt-4 space-y-5 border-l border-[#E3E8F4] pl-5">
              {timeline.map((t, idx) => (
                <li key={t.at + t.label} className="relative">
                  <span
                    className={[
                      "absolute -left-[26px] top-1 h-2.5 w-2.5 rounded-full",
                      idx === lastIndex ? "bg-[#1B2A8E]" : "bg-[#C9D3F5]",
                    ].join(" ")}
                  />
                  <p className="text-sm font-semibold text-[#0F1B4D]">{t.label}</p>
                  {t.detail && <p className="text-xs text-slate-500">{t.detail}</p>}
                  <p className="mt-0.5 text-[11px] text-slate-400">
                    {formatDateTime(t.at) + " · " + t.by}
                  </p>
                </li>
              ))}
            </ol>
          </section>
        </aside>
      </div>

      {dialog && (
        <ActionDialog
          key={dialog}
          kind={dialog}
          suggestedOffice={suggestedOffice}
          onClose={() => setDialog(null)}
          onSubmit={submitAction}
        />
      )}

      {toast && (
        <div className="fixed bottom-6 right-6 z-[70] flex items-center gap-2 rounded-xl border border-[#E3E8F4] bg-white px-4 py-3 text-sm font-medium text-[#0F1B4D] shadow-lg">
          <CheckCircle2 size={16} className="text-emerald-600" />
          <span>{toast}</span>
        </div>
      )}
    </>
  );
}

// ---------------------------------------------------------------
// PAGE
// ---------------------------------------------------------------
export default function StaffReportDetailPage() {
  const { id } = useParams();
  const found = staffReviewQueue.find((r) => r.id === id);

  return (
    <Shell>
      {found ? (
        <DetailView key={found.id} initial={found} />
      ) : (
        <div className={CARD + " text-center"}>
          <p className="text-sm text-slate-500">
            {"No report with ID " + id + " was found in your barangay."}
          </p>
          <Link
            to="/staff/review-queue"
            className="mt-2 inline-block text-sm font-semibold text-[#1B2A8E] hover:underline"
          >
            Back to Review Queue
          </Link>
        </div>
      )}
    </Shell>
  );
}