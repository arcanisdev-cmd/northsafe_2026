import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, Download, Lightbulb, Info } from "lucide-react";
import StaffSidebar from "../layouts/StaffSidebar";
import StaffHeader from "../layouts/StaffHeader";
import {
  staffAnalyticsReports,
  staffAnalyticsConfig,
  staffPermissions,
  staffSiteCoords,
} from "../components/data/MockDashboardData";

// ---------------------------------------------------------------
// CONSTANTS + HELPERS
// ---------------------------------------------------------------
const TZ = "Asia/Manila";
const DAY = 86400000;

const CATEGORY_COLORS = {
  Flood: "#2563EB",
  "Road Damage": "#F97316",
  "Electrical Hazard": "#FACC15",
  "Fire Risk": "#EF4444",
  Waste: "#10B981",
  "Building Damage": "#8B5CF6",
  Other: "#94A3B8",
};
const CATEGORIES = Object.keys(CATEGORY_COLORS);
const SEVERITIES = ["High", "Medium", "Low"];
const SEVERITY_COLOR = { High: "#EF4444", Medium: "#F97316", Low: "#22C55E" };
const STATUS_ORDER = ["Under Review", "Needs Info", "Field Check", "Verified", "Forwarded", "In Progress", "Resolved", "Rejected"];
const STATUS_COLOR = {
  "Under Review": "#3B82F6", "Needs Info": "#F59E0B", "Field Check": "#8B5CF6", Verified: "#10B981",
  Forwarded: "#6366F1", "In Progress": "#0EA5E9", Resolved: "#64748B", Rejected: "#EF4444",
};
const AREAS = Object.keys(staffSiteCoords);

const PRESETS = [
  { value: "7", label: "7 days" },
  { value: "30", label: "30 days" },
  { value: "90", label: "90 days" },
  { value: "all", label: "All time" },
];
const GRANULARITIES = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
];

const INITIAL_FILTERS = { category: "All", severity: "All", status: "All", area: "All" };
const INITIAL_RANGE = { preset: "30", from: "", to: "" };

const DONUT_R = 60;
const DONUT_C = 2 * Math.PI * DONUT_R;

// Day keys are Manila calendar days (YYYY-MM-DD)
const dayKey = (isoOrDate) => new Date(isoOrDate).toLocaleDateString("en-CA", { timeZone: TZ });
const keyToMs = (k) => Date.parse(k + "T00:00:00Z");
const msToKey = (ms) => new Date(ms).toISOString().slice(0, 10);

const DATA = staffAnalyticsReports.map((r) => ({
  ...r,
  day: dayKey(r.submittedAt),
  resolvedDay: r.resolvedAt ? dayKey(r.resolvedAt) : null,
}));
const MIN_KEY = DATA.reduce((min, r) => (r.day < min ? r.day : min), DATA[0].day);

const pct = (n, total) => (total ? Math.round((n / total) * 100) : 0);
const withAll = (values, allLabel) => [
  { value: "All", label: allLabel },
  ...values.map((v) => ({ value: v, label: v })),
];
const fmtDuration = (hours) =>
  hours < 48 ? hours.toFixed(1) + " h" : (hours / 24).toFixed(1) + " days";
const fmtMinutes = (m) => (m < 60 ? Math.round(m) + " min" : (m / 60).toFixed(1) + " h");
const fmtKey = (k) =>
  new Date(keyToMs(k)).toLocaleDateString("en-PH", { timeZone: "UTC", month: "short", day: "numeric", year: "numeric" });

function weekStartKey(k) {
  const ms = keyToMs(k);
  const dow = (new Date(ms).getUTCDay() + 6) % 7; // Monday = 0
  return msToKey(ms - dow * DAY);
}

function bucketKey(k, gran) {
  if (gran === "weekly") return weekStartKey(k);
  if (gran === "monthly") return k.slice(0, 7);
  return k;
}

function bucketLabel(key, gran) {
  if (gran === "monthly") {
    return new Date(Date.parse(key + "-01T00:00:00Z")).toLocaleDateString("en-PH", {
      timeZone: "UTC", month: "short", year: "2-digit",
    });
  }
  return new Date(keyToMs(key)).toLocaleDateString("en-PH", { timeZone: "UTC", month: "short", day: "numeric" });
}

function periodOf(range) {
  const today = dayKey(new Date());
  if (range.from || range.to) return { start: range.from || MIN_KEY, end: range.to || today };
  if (range.preset === "all") return { start: MIN_KEY, end: today };
  return { start: dayKey(new Date(Date.now() - (Number(range.preset) - 1) * DAY)), end: today };
}

function autoGranularity(days) {
  if (days <= 31) return "daily";
  if (days <= 120) return "weekly";
  return "monthly";
}

function toCsv(rows) {
  return rows
    .map((r) => r.map((c) => '"' + String(c).replace(/"/g, '""') + '"').join(","))
    .join("\r\n");
}

// ---------------------------------------------------------------
// SMALL LOCAL COMPONENTS
// ---------------------------------------------------------------
function FilterSelect({ label, value, onChange, options, disabled }) {
  return (
    <label className="block min-w-0">
      <span className="mb-1 block text-xs font-semibold text-slate-500">{label}</span>
      <div className="relative">
        <select
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none rounded-xl border border-[#E3E8F4] bg-white py-2 pl-3 pr-9 text-sm text-[#0F1B4D] focus:border-[#1B2A8E] focus:outline-none focus:ring-2 focus:ring-[#1B2A8E]/15 disabled:bg-[#F7F8FD] disabled:text-slate-500"
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
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

function Card({ title, subtitle, right, children }) {
  return (
    <section className="min-w-0 rounded-2xl border border-[#E3E8F4] bg-white p-5">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-[#0F1B4D]">{title}</h2>
          {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
        </div>
        {right}
      </div>
      {children}
    </section>
  );
}

function Stat({ label, value, note, labelClass }) {
  return (
    <div className="rounded-2xl border border-[#E3E8F4] bg-white p-4">
      <p className={["text-[11px] font-semibold uppercase tracking-[0.12em]", labelClass].join(" ")}>{label}</p>
      <p className="mt-2 text-3xl font-bold text-[#0F1B4D]">{value.toLocaleString("en-PH")}</p>
      <p className="mt-1 text-xs font-medium text-slate-500">{note}</p>
    </div>
  );
}

function HBar({ label, value, max, color, right }) {
  return (
    <li>
      <div className="flex items-center justify-between gap-2 text-xs">
        <span className="truncate text-slate-600">{label}</span>
        <span className="shrink-0 font-semibold text-[#0F1B4D]">{right !== undefined ? right : value}</span>
      </div>
      <div className="mt-1 h-2 rounded-full bg-[#E8EBFA]">
        <div className="h-2 rounded-full" style={{ width: (max ? Math.round((value / max) * 100) : 0) + "%", backgroundColor: color }} />
      </div>
    </li>
  );
}

function MiniMetric({ label, value, note }) {
  return (
    <div className="rounded-xl border border-[#E3E8F4] bg-[#F7F8FD] p-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-400">{label}</p>
      <p className="mt-1 text-xl font-bold text-[#0F1B4D]">{value}</p>
      <p className="text-[11px] text-slate-500">{note}</p>
    </div>
  );
}

function Empty({ children }) {
  return <p className="rounded-xl border border-dashed border-[#E3E8F4] p-4 text-center text-sm text-slate-500">{children}</p>;
}

function TrendChart({ buckets, gran }) {
  const W = 640;
  const H = 240;
  const padL = 36;
  const padR = 12;
  const padT = 12;
  const padB = 28;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;

  const rawMax = Math.max(1, ...buckets.map((b) => Math.max(b.submitted, b.resolved)));
  const step = Math.pow(10, Math.floor(Math.log10(rawMax)));
  const niceMax = Math.ceil(rawMax / step) * step;
  const ticks = [0, 1, 2, 3, 4].map((i) => Math.round((niceMax / 4) * i));

  const slot = innerW / buckets.length;
  const barW = Math.max(2, slot * 0.62);
  const y = (v) => padT + innerH - (v / niceMax) * innerH;
  const cx = (i) => padL + slot * i + slot / 2;
  const labelEvery = Math.ceil(buckets.length / 8);

  const linePoints = buckets.map((b, i) => cx(i) + "," + y(b.resolved)).join(" ");

  return (
    <svg viewBox={"0 0 " + W + " " + H} className="h-auto w-full" role="img" aria-label="Report trend chart">
      {ticks.map((t) => (
        <g key={t}>
          <line x1={padL} x2={W - padR} y1={y(t)} y2={y(t)} stroke="#E3E8F4" strokeWidth="1" />
          <text x={padL - 6} y={y(t) + 3} textAnchor="end" fontSize="10" fill="#94A3B8">{t}</text>
        </g>
      ))}

      {buckets.map((b, i) => (
        <rect key={b.key} x={cx(i) - barW / 2} y={y(b.submitted)} width={barW} height={Math.max(0, padT + innerH - y(b.submitted))} rx="2" fill="#1B2A8E">
          <title>{bucketLabel(b.key, gran) + ": " + b.submitted + " submitted, " + b.resolved + " resolved"}</title>
        </rect>
      ))}

      <polyline points={linePoints} fill="none" stroke="#10B981" strokeWidth="2" strokeLinejoin="round" />

      {buckets.map((b, i) =>
        i % labelEvery === 0 ? (
          <text key={b.key} x={cx(i)} y={H - 8} textAnchor="middle" fontSize="10" fill="#94A3B8">
            {bucketLabel(b.key, gran)}
          </text>
        ) : null
      )}
    </svg>
  );
}

// ---------------------------------------------------------------
// PAGE
// ---------------------------------------------------------------
export default function StaffAnalyticsPage() {
  const navigate = useNavigate();

  const [range, setRange] = useState(INITIAL_RANGE);
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [gran, setGran] = useState(null); // null = automatic
  const [exporting, setExporting] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => {
    if (!toast) return undefined;
    const id = setTimeout(() => setToast(""), 3500);
    return () => clearTimeout(id);
  }, [toast]);

  const setFilter = (key, value) => setFilters((f) => ({ ...f, [key]: value }));
  const pickPreset = (value) => {
    setRange({ preset: value, from: "", to: "" });
    setGran(null);
  };
  const setCustom = (key, value) => {
    setRange((r) => ({ ...r, [key]: value }));
    setGran(null);
  };
  const clearAll = () => {
    setRange(INITIAL_RANGE);
    setFilters(INITIAL_FILTERS);
    setGran(null);
  };

  const target = staffAnalyticsConfig.reviewTargetMinutes;

  // ---- everything below is derived from the filtered list ----
  const view = useMemo(() => {
    const { start, end } = periodOf(range);
    const days = Math.round((keyToMs(end) - keyToMs(start)) / DAY) + 1;

    const attr = DATA.filter(
      (r) =>
        (filters.category === "All" || r.category === filters.category) &&
        (filters.severity === "All" || r.severity === filters.severity) &&
        (filters.status === "All" || r.status === filters.status) &&
        (filters.area === "All" || r.area === filters.area)
    );

    const P = attr.filter((r) => r.day >= start && r.day <= end);

    // previous period of the same length (not available for "All time")
    let prev = null;
    if (range.from || range.to || range.preset !== "all") {
      const prevEnd = msToKey(keyToMs(start) - DAY);
      const prevStart = msToKey(keyToMs(start) - days * DAY);
      prev = attr.filter((r) => r.day >= prevStart && r.day <= prevEnd);
    }

    const count = (list, fn) => list.filter(fn).length;
    const tally = (list, keyFn) => {
      const t = {};
      list.forEach((r) => {
        const k = keyFn(r);
        t[k] = (t[k] || 0) + 1;
      });
      return t;
    };

    const byStatus = tally(P, (r) => r.status);
    const byCategory = tally(P, (r) => r.category);
    const bySeverity = tally(P, (r) => r.severity);
    const byArea = tally(P, (r) => r.area);

    // trend
    const effGran = gran || autoGranularity(days);
    const bucketKeys = [];
    for (let ms = keyToMs(start); ms <= keyToMs(end); ms += DAY) {
      const k = bucketKey(msToKey(ms), effGran);
      if (bucketKeys[bucketKeys.length - 1] !== k) bucketKeys.push(k);
    }
    const buckets = bucketKeys.map((k) => ({ key: k, submitted: 0, resolved: 0 }));
    const index = {};
    buckets.forEach((b, i) => {
      index[b.key] = i;
    });
    attr.forEach((r) => {
      if (r.day >= start && r.day <= end) buckets[index[bucketKey(r.day, effGran)]].submitted += 1;
      if (r.resolvedDay && r.resolvedDay >= start && r.resolvedDay <= end) {
        buckets[index[bucketKey(r.resolvedDay, effGran)]].resolved += 1;
      }
    });

    // verification (rejected reports were never verified, so they are excluded)
    const nonRejected = P.filter((r) => r.status !== "Rejected");
    const desk = count(nonRejected, (r) => r.verification === "Desk");
    const field = count(nonRejected, (r) => r.verification === "Field");
    const unverified = nonRejected.length - desk - field;

    // resolution performance: reports resolved inside the period
    const R = attr.filter((r) => r.resolvedDay && r.resolvedDay >= start && r.resolvedDay <= end);
    const hours = R.map((r) => (new Date(r.resolvedAt) - new Date(r.submittedAt)) / 3600000).filter((h) => h > 0);
    const avgResolveHours = hours.length ? hours.reduce((s, h) => s + h, 0) / hours.length : null;
    const within24 = hours.length ? Math.round((hours.filter((h) => h <= 24).length / hours.length) * 100) : 0;

    // review target
    const reviewed = P.filter((r) => r.reviewedAt);
    const delays = reviewed.map((r) => (new Date(r.reviewedAt) - new Date(r.submittedAt)) / 60000);
    const avgReviewMin = delays.length ? delays.reduce((s, m) => s + m, 0) / delays.length : null;
    const withinTarget = target && delays.length ? Math.round((delays.filter((m) => m <= target).length / delays.length) * 100) : null;

    // field checks
    const stage = tally(P.filter((r) => r.fieldCheckStage), (r) => r.fieldCheckStage);
    const outcomes = tally(P.filter((r) => r.fieldOutcome), (r) => r.fieldOutcome);

    // forwarding
    const F = P.filter((r) => r.forwardedTo);
    const byOffice = tally(F, (r) => r.forwardedTo);
    const byResponse = tally(F, (r) => r.forwardResponse);
    const forwardedResolved = count(F, (r) => r.status === "Resolved");

    // insights (descriptive only)
    const insights = [];
    if (prev) {
      const prevTally = tally(prev, (r) => r.category);
      let best = null;
      CATEGORIES.forEach((c) => {
        const cur = byCategory[c] || 0;
        const before = prevTally[c] || 0;
        if (before >= 5 && cur > before && (!best || cur - before > best.cur - best.before)) best = { c, cur, before };
      });
      insights.push(
        best
          ? best.c + " reports rose " + pct(best.cur - best.before, best.before) + "% (" + best.before + " → " + best.cur + ") compared with the previous " + days + " days."
          : "No category increased compared with the previous " + days + " days."
      );
    }
    const topArea = Object.entries(byArea).sort((a, b) => b[1] - a[1])[0];
    if (topArea) insights.push(topArea[0] + " accounts for " + pct(topArea[1], P.length) + "% of reports in this period (" + topArea[1] + " of " + P.length + ").");
    const topCategory = Object.entries(byCategory).sort((a, b) => b[1] - a[1])[0];
    if (topCategory) insights.push(topCategory[0] + " is the most reported category (" + pct(topCategory[1], P.length) + "% of reports).");
    if (P.length) insights.push((bySeverity.High || 0) + " of " + P.length + " reports (" + pct(bySeverity.High || 0, P.length) + "%) are High severity.");
    if (P.length >= 20) {
      const dow = [0, 0, 0, 0, 0, 0, 0];
      P.forEach((r) => {
        dow[new Date(keyToMs(r.day)).getUTCDay()] += 1;
      });
      const names = ["Sundays", "Mondays", "Tuesdays", "Wednesdays", "Thursdays", "Fridays", "Saturdays"];
      const top = dow.indexOf(Math.max(...dow));
      insights.push("Reports are submitted most often on " + names[top] + " (" + pct(dow[top], P.length) + "% of the period).");
    }
    const openField = byStatus["Field Check"] || 0;
    if (unverified > 0) insights.push(unverified + " reports are still unverified, and " + openField + " of them need a field check.");

    return {
      start, end, days, P, effGran, buckets, byStatus, byCategory, bySeverity, byArea,
      desk, field, unverified, nonRejectedCount: nonRejected.length,
      resolvedCount: R.length, avgResolveHours, within24, hoursCount: hours.length,
      reviewedCount: reviewed.length, avgReviewMin, withinTarget,
      stage, outcomes, F, byOffice, byResponse, forwardedResolved,
      insights: insights.slice(0, 5),
      overview: {
        submitted: P.length,
        verified: count(P, (r) => r.verification !== "None"),
        fieldChecks: byStatus["Field Check"] || 0,
        inProgress: byStatus["In Progress"] || 0,
        resolved: byStatus.Resolved || 0,
        rejected: byStatus.Rejected || 0,
      },
    };
  }, [range, filters, gran, target]);

  const v = view;
  const periodLabel = fmtKey(v.start) + " – " + fmtKey(v.end);
  const customRange = Boolean(range.from || range.to);

  // donut segments
  let donutOffset = 0;
  const donutSegments = CATEGORIES.map((c) => {
    const n = v.byCategory[c] || 0;
    const len = v.P.length ? (n / v.P.length) * DONUT_C : 0;
    const seg = { label: c, n, len, offset: donutOffset, color: CATEGORY_COLORS[c] };
    donutOffset += len;
    return seg;
  });

  const areaRows = AREAS.map((a) => ({
    name: a,
    count: v.byArea[a] || 0,
    high: v.P.filter((r) => r.area === a && r.severity === "High").length,
  })).sort((a, b) => b.count - a.count);
  const areaMax = areaRows[0] ? areaRows[0].count : 0;
  const officeRows = Object.entries(v.byOffice).sort((a, b) => b[1] - a[1]);

  // fake async to mimic latency until the Laravel API is wired
  const handleExport = async () => {
    setExporting(true);
    await new Promise((resolve) => setTimeout(resolve, 500));

    const rows = [
      ["NORTHSAFE Staff Analytics"],
      ["Barangay", "Barangay 171 (Bagumbong)"],
      ["Period", periodLabel],
      ["Category filter", filters.category],
      ["Severity filter", filters.severity],
      ["Status filter", filters.status],
      ["Area filter", filters.area],
      ["Generated", new Date().toLocaleString("en-PH", { timeZone: TZ })],
      [],
      ["Section", "Item", "Count"],
      ["Overview", "Submitted", v.overview.submitted],
      ["Overview", "Verified (desk or field)", v.overview.verified],
      ["Overview", "Field check required", v.overview.fieldChecks],
      ["Overview", "In progress", v.overview.inProgress],
      ["Overview", "Resolved", v.overview.resolved],
      ["Overview", "Rejected", v.overview.rejected],
      ...CATEGORIES.map((c) => ["Category", c, v.byCategory[c] || 0]),
      ...SEVERITIES.map((s) => ["Severity", s, v.bySeverity[s] || 0]),
      ...STATUS_ORDER.map((s) => ["Status", s, v.byStatus[s] || 0]),
      ["Verification", "Desk-verified", v.desk],
      ["Verification", "Field-verified", v.field],
      ["Verification", "Unverified", v.unverified],
      ["Resolution", "Resolved in period", v.resolvedCount],
      ["Resolution", "Average hours to resolution", v.avgResolveHours === null ? "n/a" : v.avgResolveHours.toFixed(1)],
      ...areaRows.map((a) => ["Area", a.name, a.count]),
      ...officeRows.map(([o, n]) => ["Forwarded to", o, n]),
      ["Forwarding", "Forwarded reports that are resolved", v.forwardedResolved],
    ];

    const blob = new Blob(["\uFEFF" + toCsv(rows)], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "northsafe-staff-analytics-" + dayKey(new Date()) + ".csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setExporting(false);
    setToast("Analytics summary exported (" + v.overview.submitted + " reports in period).");
  };

  const overviewCards = [
    { label: "Submitted", value: v.overview.submitted, note: "Reports in this period", labelClass: "text-slate-500" },
    { label: "Verified", value: v.overview.verified, note: "Desk or field verified", labelClass: "text-emerald-600" },
    { label: "Field Checks", value: v.overview.fieldChecks, note: "Field check required", labelClass: "text-violet-600" },
    { label: "In Progress", value: v.overview.inProgress, note: "Being handled", labelClass: "text-sky-600" },
    { label: "Resolved", value: v.overview.resolved, note: "Documented closure", labelClass: "text-emerald-600" },
    { label: "Rejected", value: v.overview.rejected, note: "Not accepted", labelClass: "text-red-600" },
  ];

  return (
    <div className="flex min-h-screen bg-[#F2F4FB]">
      <StaffSidebar onLogout={() => navigate("/signin")} />

      <div className="min-w-0 flex-1">
        <StaffHeader />

        <main className="space-y-6 p-8">
          {/* TITLE */}
          <section className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-[#0F1B4D]">Analytics</h1>
              <p className="mt-1.5 max-w-2xl text-sm text-slate-500">
                What the report data tells us over time: volume, verification, resolution, and
                recurring problem areas in your barangay.
              </p>
            </div>

            <div className="flex flex-col items-end gap-1">
              <button
                type="button"
                onClick={handleExport}
                disabled={!staffPermissions.exportAnalytics || exporting}
                title={staffPermissions.exportAnalytics ? "Export the filtered summary as CSV" : "You do not have permission to export"}
                className="flex items-center gap-2 rounded-xl bg-[#1B2A8E] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#16237A] disabled:opacity-50"
              >
                <Download size={15} strokeWidth={2.2} />
                <span>{exporting ? "Preparing..." : "Export CSV"}</span>
              </button>
              <p className="text-xs text-slate-400">{periodLabel}</p>
            </div>
          </section>

          {/* FILTERS */}
          <section className="space-y-4 rounded-2xl border border-[#E3E8F4] bg-white p-4">
            <div className="flex flex-wrap items-end gap-4">
              <div>
                <span className="mb-1 block text-xs font-semibold text-slate-500">Period</span>
                <div className="flex overflow-hidden rounded-xl border border-[#E3E8F4]">
                  {PRESETS.map((p) => {
                    const on = !customRange && range.preset === p.value;
                    return (
                      <button
                        key={p.value}
                        type="button"
                        onClick={() => pickPreset(p.value)}
                        aria-pressed={on}
                        className={[
                          "px-3 py-2 text-sm font-semibold transition-colors",
                          on ? "bg-[#1B2A8E] text-white" : "bg-white text-slate-600 hover:bg-slate-50",
                        ].join(" ")}
                      >
                        {p.label}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="w-40">
                <DateField label="From" value={range.from} onChange={(val) => setCustom("from", val)} />
              </div>
              <div className="w-40">
                <DateField label="To" value={range.to} onChange={(val) => setCustom("to", val)} />
              </div>
              {customRange && <p className="pb-2 text-xs font-medium text-[#1B2A8E]">Custom range</p>}
            </div>

            <div className="grid grid-cols-2 items-end gap-4 md:grid-cols-6">
              <FilterSelect
                label="Barangay"
                value="Barangay 171 (Bagumbong)"
                onChange={() => {}}
                disabled
                options={[{ value: "Barangay 171 (Bagumbong)", label: "Brgy 171 (Bagumbong)" }]}
              />
              <FilterSelect label="Area" value={filters.area} onChange={(val) => setFilter("area", val)} options={withAll(AREAS, "All Areas")} />
              <FilterSelect label="Category" value={filters.category} onChange={(val) => setFilter("category", val)} options={withAll(CATEGORIES, "All Categories")} />
              <FilterSelect label="Severity" value={filters.severity} onChange={(val) => setFilter("severity", val)} options={withAll(SEVERITIES, "All Severities")} />
              <FilterSelect label="Status" value={filters.status} onChange={(val) => setFilter("status", val)} options={withAll(STATUS_ORDER, "All Statuses")} />
              <button
                type="button"
                onClick={clearAll}
                className="rounded-xl border border-[#E3E8F4] bg-white px-3 py-2 text-sm font-semibold text-[#1B2A8E] transition-colors hover:bg-slate-50"
              >
                Clear filters
              </button>
            </div>
          </section>

          {/* 1. REPORTING OVERVIEW */}
          <section className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
            {overviewCards.map((c) => (
              <Stat key={c.label} {...c} />
            ))}
          </section>

          {/* 14. INSIGHTS */}
          <Card title="Data-Based Insights" subtitle="Descriptive observations from the reports in this view">
            {v.insights.length === 0 ? (
              <Empty>Not enough reports in this view to describe a pattern.</Empty>
            ) : (
              <ul className="space-y-2">
                {v.insights.map((text) => (
                  <li key={text} className="flex items-start gap-3 rounded-xl bg-[#F7F8FD] px-3 py-2.5 text-sm text-slate-700">
                    <Lightbulb size={16} className="mt-0.5 shrink-0 text-amber-500" />
                    <span>{text}</span>
                  </li>
                ))}
              </ul>
            )}
            <p className="mt-3 text-[11px] text-slate-400">
              These are observations from submitted reports, not predictions.
            </p>
          </Card>

          {/* 4 + 2: TREND + CATEGORY */}
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
            <Card
              title="Report Trends Over Time"
              subtitle="Submitted reports (bars) and resolved reports (line)"
              right={
                <div className="flex overflow-hidden rounded-lg border border-[#E3E8F4]">
                  {GRANULARITIES.map((g) => (
                    <button
                      key={g.value}
                      type="button"
                      onClick={() => setGran(g.value)}
                      aria-pressed={v.effGran === g.value}
                      className={[
                        "px-2.5 py-1 text-xs font-semibold",
                        v.effGran === g.value ? "bg-[#1B2A8E] text-white" : "bg-white text-slate-600 hover:bg-slate-50",
                      ].join(" ")}
                    >
                      {g.label}
                    </button>
                  ))}
                </div>
              }
            >
              {v.overview.submitted === 0 && v.resolvedCount === 0 ? (
                <Empty>No reports in this period.</Empty>
              ) : (
                <>
                  <TrendChart buckets={v.buckets} gran={v.effGran} />
                  <div className="mt-2 flex gap-4 text-xs text-slate-500">
                    <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-[#1B2A8E]" />Submitted</span>
                    <span className="flex items-center gap-1.5"><span className="h-0.5 w-4 bg-emerald-500" />Resolved</span>
                  </div>
                </>
              )}
            </Card>

            <Card title="Hazard Category Distribution" subtitle="Share of reports by category">
              {v.P.length === 0 ? (
                <Empty>No reports in this period.</Empty>
              ) : (
                <div className="flex items-center gap-4">
                  <div className="relative h-32 w-32 shrink-0">
                    <svg viewBox="0 0 160 160" className="h-full w-full -rotate-90">
                      {donutSegments.map((s) => (
                        <circle
                          key={s.label}
                          cx="80"
                          cy="80"
                          r={DONUT_R}
                          fill="none"
                          stroke={s.color}
                          strokeWidth="22"
                          strokeDasharray={s.len + " " + (DONUT_C - s.len)}
                          strokeDashoffset={-s.offset}
                        />
                      ))}
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <p className="text-lg font-bold text-[#0F1B4D]">{v.P.length.toLocaleString("en-PH")}</p>
                      <p className="text-[11px] text-slate-500">reports</p>
                    </div>
                  </div>
                  <ul className="min-w-0 flex-1 space-y-1.5">
                    {donutSegments.map((s) => (
                      <li key={s.label} className="flex items-center justify-between gap-2 text-xs">
                        <span className="flex min-w-0 items-center gap-2 text-slate-600">
                          <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: s.color }} />
                          <span className="truncate">{s.label}</span>
                        </span>
                        <span className="shrink-0 text-slate-500">{pct(s.n, v.P.length) + "% (" + s.n + ")"}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </Card>
          </div>

          {/* 3 + 6 + 7 */}
          <div className="grid gap-6 xl:grid-cols-3">
            <Card title="Hazard Severity Distribution" subtitle="Reported risk levels">
              <div className="grid grid-cols-3 gap-3">
                {SEVERITIES.map((s) => (
                  <div key={s} className="rounded-xl border border-[#E3E8F4] p-3 text-center">
                    <span className="mx-auto mb-1 block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: SEVERITY_COLOR[s] }} />
                    <p className="text-xl font-bold text-[#0F1B4D]">{v.bySeverity[s] || 0}</p>
                    <p className="text-xs text-slate-500">{s}</p>
                    <p className="text-[11px] text-slate-400">{pct(v.bySeverity[s] || 0, v.P.length) + "%"}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex h-2.5 overflow-hidden rounded-full bg-[#E8EBFA]">
                {SEVERITIES.map((s) => (
                  <div key={s} style={{ width: pct(v.bySeverity[s] || 0, v.P.length) + "%", backgroundColor: SEVERITY_COLOR[s] }} />
                ))}
              </div>
            </Card>

            <Card title="Report Status Distribution" subtitle="Current status of reports in this period">
              <ul className="space-y-2.5">
                {STATUS_ORDER.map((s) => (
                  <HBar
                    key={s}
                    label={s}
                    value={v.byStatus[s] || 0}
                    max={Math.max(1, ...STATUS_ORDER.map((x) => v.byStatus[x] || 0))}
                    color={STATUS_COLOR[s]}
                  />
                ))}
              </ul>
            </Card>

            <Card title="Verification Performance" subtitle="How reports were verified">
              {v.nonRejectedCount === 0 ? (
                <Empty>No reports in this period.</Empty>
              ) : (
                <>
                  <ul className="space-y-2.5">
                    <HBar label="Desk-verified" value={v.desk} max={v.nonRejectedCount} color="#10B981" right={v.desk + " (" + pct(v.desk, v.nonRejectedCount) + "%)"} />
                    <HBar label="Field-verified" value={v.field} max={v.nonRejectedCount} color="#8B5CF6" right={v.field + " (" + pct(v.field, v.nonRejectedCount) + "%)"} />
                    <HBar label="Unverified" value={v.unverified} max={v.nonRejectedCount} color="#F59E0B" right={v.unverified + " (" + pct(v.unverified, v.nonRejectedCount) + "%)"} />
                  </ul>
                  <p className="mt-3 text-[11px] text-slate-400">
                    Rejected reports are not counted because they were never verified.
                  </p>
                </>
              )}
            </Card>
          </div>

          {/* 8 + 11 + 9 */}
          <div className="grid gap-6 xl:grid-cols-3">
            <Card title="Resolution Performance" subtitle="Reports with a documented resolution">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 xl:grid-cols-1 2xl:grid-cols-3">
                <MiniMetric label="Resolved" value={v.resolvedCount} note="Closed in this period" />
                <MiniMetric label="Avg time" value={v.avgResolveHours === null ? "n/a" : fmtDuration(v.avgResolveHours)} note="Submission to closure" />
                <MiniMetric label="Within 24 h" value={v.hoursCount ? v.within24 + "%" : "n/a"} note="Of resolved reports" />
              </div>
              <p className="mt-3 text-[11px] text-slate-400">
                {"Average based on " + v.hoursCount + " reports with reliable timestamps."}
              </p>
            </Card>

            <Card title="Review Target Performance" subtitle="Time from submission to first review">
              {target === null ? (
                <Empty>No review target is configured. Average time to first review is shown instead.</Empty>
              ) : (
                <div className="rounded-xl border border-[#E3E8F4] bg-[#F7F8FD] p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-400">
                    {"Reviewed within " + fmtMinutes(target)}
                  </p>
                  <p className="mt-1 text-3xl font-bold text-[#0F1B4D]">
                    {v.withinTarget === null ? "n/a" : v.withinTarget + "%"}
                  </p>
                  <div className="mt-2 h-2 rounded-full bg-[#E8EBFA]">
                    <div className="h-2 rounded-full bg-[#1B2A8E]" style={{ width: (v.withinTarget || 0) + "%" }} />
                  </div>
                </div>
              )}
              <div className="mt-3 grid grid-cols-2 gap-3">
                <MiniMetric label="Avg first review" value={v.avgReviewMin === null ? "n/a" : fmtMinutes(v.avgReviewMin)} note="Reviewed reports" />
                <MiniMetric label="Reviewed" value={v.reviewedCount} note="Have a review timestamp" />
              </div>
            </Card>

            <Card title="Field Check Statistics" subtitle="Open checks and completed outcomes">
              <div className="grid grid-cols-3 gap-3">
                {[
                  ["Awaiting", "Awaiting action"],
                  ["In Progress", "In progress"],
                  ["Findings Recorded", "Findings recorded"],
                ].map(([key, label]) => (
                  <div key={key} className="rounded-xl border border-[#E3E8F4] bg-[#F7F8FD] p-3">
                    <p className="text-2xl font-bold text-[#0F1B4D]">{v.stage[key] || 0}</p>
                    <p className="text-[11px] leading-4 text-slate-500">{label}</p>
                  </div>
                ))}
              </div>
              <p className="mb-2 mt-4 text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-400">Completed outcomes</p>
              {Object.keys(v.outcomes).length === 0 ? (
                <p className="text-xs text-slate-500">No completed field checks in this view.</p>
              ) : (
                <ul className="space-y-2">
                  {["Hazard confirmed", "Needs follow-up", "Hazard not found"].map((o) => (
                    <HBar key={o} label={o} value={v.outcomes[o] || 0} max={Math.max(1, ...Object.values(v.outcomes))} color="#8B5CF6" />
                  ))}
                </ul>
              )}
            </Card>
          </div>

          {/* 5 + 10 */}
          <div className="grid gap-6 xl:grid-cols-2">
            <Card title="Area Comparison" subtitle="Reports by area within Barangay 171 (Bagumbong)">
              {v.P.length === 0 ? (
                <Empty>No reports in this period.</Empty>
              ) : (
                <ul className="space-y-3">
                  {areaRows.map((a) => (
                    <HBar key={a.name} label={a.name} value={a.count} max={areaMax} color="#1B2A8E" right={a.count + " reports · " + a.high + " high"} />
                  ))}
                </ul>
              )}
              <p className="mt-3 text-[11px] text-slate-400">
                Staff see their assigned barangay only. Comparing barangays is available to administrators.
              </p>
            </Card>

            <Card title="External LGU Forwarding" subtitle="Reports forwarded to receiving offices">
              <div className="flex items-start gap-2 rounded-xl border border-[#C9D3F5] bg-[#F3F6FE] p-3 text-xs leading-5 text-slate-600">
                <Info size={15} className="mt-0.5 shrink-0 text-[#1B2A8E]" />
                <p>
                  Forwarding is not resolution.{" "}
                  {v.forwardedResolved + " of " + v.F.length + " forwarded reports are resolved; " + (v.F.length - v.forwardedResolved) + " are still open."}
                </p>
              </div>

              {v.F.length === 0 ? (
                <div className="mt-3"><Empty>No forwarded reports in this view.</Empty></div>
              ) : (
                <div className="mt-4 grid gap-5 md:grid-cols-2">
                  <div>
                    <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-400">Receiving office</p>
                    <ul className="space-y-2">
                      {officeRows.map(([office, n]) => (
                        <HBar key={office} label={office} value={n} max={officeRows[0][1]} color="#6366F1" />
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-400">Recorded response</p>
                    <ul className="space-y-2">
                      {["Follow-up received", "Acknowledged", "No response yet"].map((r) => (
                        <HBar key={r} label={r} value={v.byResponse[r] || 0} max={v.F.length} color="#0EA5E9" right={(v.byResponse[r] || 0) + " (" + pct(v.byResponse[r] || 0, v.F.length) + "%)"} />
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </main>
      </div>

      {toast && (
        <div className="fixed bottom-6 right-6 z-40 max-w-sm rounded-xl bg-[#0F1B4D] px-4 py-3 text-sm font-medium text-white shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}