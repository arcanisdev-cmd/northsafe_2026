import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Sunrise,
  Sun,
  Sunset,
  Moon,
  CalendarDays,
  CloudRain,
  FileText,
  Hourglass,
  TriangleAlert,
  CircleCheck,
  Flag,
  MapPin,
  TrendingUp,
  ChevronRight,
  ArrowRight,
  Image as ImageIcon,
  Activity,
  PieChart,
  Zap,
  ClipboardList,
  Map as MapIcon,
  BarChart2,
} from "lucide-react";
import StaffSidebar from "../layouts/StaffSidebar";
import StaffHeader from "../layouts/StaffHeader";
import {
  staffOfficer,
  staffDashboardStats,
  staffWeather,
  staffFieldChecks,
  staffPriorityReports,
  staffHazardCategories,
  staffRecentActivity,
  staffReviewQueue,
} from "../components/data/MockDashboardData";

const TZ = "Asia/Manila";

// ---------------------------------------------------------------
// HELPERS
// ---------------------------------------------------------------
function useNow() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(id);
  }, []);

  return now;
}

function getGreeting(now) {
  const hour = Number(
    new Intl.DateTimeFormat("en-PH", {
      hour: "numeric",
      hourCycle: "h23",
      timeZone: TZ,
    }).format(now)
  );

  if (hour >= 5 && hour < 12)
    return { text: "Good morning", Icon: Sunrise, tone: "text-amber-500", late: false };
  if (hour >= 12 && hour < 18)
    return { text: "Good afternoon", Icon: Sun, tone: "text-orange-500", late: false };
  if (hour >= 18 && hour < 22)
    return { text: "Good evening", Icon: Sunset, tone: "text-orange-600", late: false };
  return { text: "Good evening", Icon: Moon, tone: "text-[#1B2A8E]", late: true };
}

function timeAgo(iso, now) {
  const mins = Math.max(0, Math.floor((now - new Date(iso)) / 60000));
  if (mins < 1) return "Just now";
  if (mins < 60) return mins + " min ago";
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return hrs + " hr ago";
  return Math.floor(hrs / 24) + " d ago";
}

function credibilityOf(score) {
  return score >= 70
    ? { label: "Likely credible", style: "border-emerald-200 bg-emerald-50 text-emerald-700" }
    : { label: "Needs staff check", style: "border-amber-200 bg-amber-50 text-amber-700" };
}

// Full class names so Tailwind can detect them
const TONES = {
  navy: { label: "text-slate-500", icon: "text-[#1B2A8E]", note: "text-emerald-600" },
  orange: { label: "text-orange-500", icon: "text-orange-500", note: "text-slate-500" },
  red: { label: "text-red-600", icon: "text-red-600", note: "text-slate-500" },
  green: { label: "text-emerald-600", icon: "text-emerald-600", note: "text-emerald-600" },
  violet: { label: "text-violet-600", icon: "text-violet-600", note: "text-slate-500" },
};

const SEVERITY_RANK = { High: 0, Medium: 1, Low: 2 };

const SEVERITY_STYLE = {
  High: "bg-red-500 text-white",
  Medium: "bg-orange-500 text-white",
  Low: "bg-emerald-500 text-white",
};

const ROW_GRID =
  "grid grid-cols-[minmax(0,1fr)_84px_140px_96px_20px] items-center gap-4";

const ACTIVITY_GRID =
  "grid grid-cols-[104px_128px_minmax(0,1fr)_96px_140px] items-center gap-4";

const ACTIVITY_STYLE = {
  Verified: "border-emerald-200 bg-emerald-50 text-emerald-700",
  "Field Check": "border-amber-200 bg-amber-50 text-amber-700",
  Forwarded: "border-blue-200 bg-blue-50 text-blue-700",
  Rejected: "border-red-200 bg-red-50 text-red-700",
};

const FIELD_TILES = [
  {
    key: "awaitingCheck",
    label: "Awaiting Check",
    box: "border-amber-200 bg-amber-50",
    num: "text-amber-700",
  },
  {
    key: "inProgress",
    label: "In Progress",
    box: "border-violet-200 bg-violet-50",
    num: "text-violet-700",
  },
  {
    key: "findingsToRecord",
    label: "Findings to Record",
    box: "border-emerald-200 bg-emerald-50",
    num: "text-emerald-700",
  },
];

// Donut geometry
const DONUT_R = 60;
const DONUT_C = 2 * Math.PI * DONUT_R;

// ---------------------------------------------------------------
// SMALL LOCAL COMPONENTS
// ---------------------------------------------------------------
function InfoPill({ icon: Icon, iconClass, children }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-[#E3E8F4] bg-white px-4 py-3">
      <Icon size={22} strokeWidth={1.8} className={iconClass} />
      <div className="leading-tight">{children}</div>
    </div>
  );
}

function StaffStatCard({ label, value, note, noteIcon: NoteIcon, icon: Icon, tone }) {
  const t = TONES[tone];

  return (
    <div className="rounded-2xl border border-[#E3E8F4] bg-white p-4">
      <div className="flex items-start justify-between gap-2">
        <p
          className={[
            "min-h-8 text-[11px] font-semibold uppercase leading-4 tracking-[0.12em]",
            t.label,
          ].join(" ")}
        >
          {label}
        </p>
        <Icon size={18} strokeWidth={1.9} className={["shrink-0", t.icon].join(" ")} />
      </div>

      <p className="mt-2 text-3xl font-bold text-[#0F1B4D]">
        {value.toLocaleString("en-PH")}
      </p>

      <p className={["mt-1 flex items-center gap-1 text-xs font-medium", t.note].join(" ")}>
        {NoteIcon && <NoteIcon size={12} strokeWidth={2.2} />}
        <span>{note}</span>
      </p>
    </div>
  );
}

function SectionCard({
  icon: Icon,
  iconWrap,
  title,
  subtitle,
  actionTo,
  actionLabel,
  children,
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-[#E3E8F4] bg-white">
      <div className="flex items-start justify-between gap-4 px-5 py-4">
        <div className="flex items-center gap-3">
          <div
            className={[
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
              iconWrap,
            ].join(" ")}
          >
            <Icon size={20} strokeWidth={2} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#0F1B4D]">{title}</h2>
            <p className="text-xs text-slate-500">{subtitle}</p>
          </div>
        </div>

        {actionTo && (
          <Link
            to={actionTo}
            className="flex shrink-0 items-center gap-1 text-xs font-semibold text-[#1B2A8E] hover:underline"
          >
            {actionLabel}
            <ArrowRight size={13} strokeWidth={2.2} />
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}

function QuickAction({ to, icon: Icon, title, sub, primary }) {
  return (
    <Link
      to={to}
      className={[
        "flex items-center gap-3 rounded-xl border p-3 transition-colors",
        primary
          ? "border-[#1B2A8E] bg-[#1B2A8E] text-white hover:bg-[#16237A]"
          : "border-[#E3E8F4] bg-white text-[#0F1B4D] hover:bg-slate-50",
      ].join(" ")}
    >
      <div
        className={[
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
          primary ? "bg-white/15 text-white" : "bg-[#E8EBFA] text-[#1B2A8E]",
        ].join(" ")}
      >
        <Icon size={18} strokeWidth={1.9} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold">{title}</p>
        <p
          className={[
            "truncate text-xs",
            primary ? "text-white/80" : "text-slate-500",
          ].join(" ")}
        >
          {sub}
        </p>
      </div>

      <ChevronRight
        size={16}
        className={primary ? "text-white/80" : "text-slate-400"}
      />
    </Link>
  );
}

// ---------------------------------------------------------------
// PAGE
// ---------------------------------------------------------------
export default function StaffDashboardPage() {
  const navigate = useNavigate();
  const now = useNow();

  const stats = staffDashboardStats;
  const greeting = getGreeting(now);
  const firstName = staffOfficer.name.split(" ")[0];
  const resolutionRate = ((stats.resolved / stats.totalReports) * 100).toFixed(1);

    const priorityReports = [...staffReviewQueue]
    .sort(
      (a, b) =>
        SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity] ||
        new Date(a.submittedAt) - new Date(b.submittedAt)
    )
    .slice(0, 5);

  // Donut segments (derived from counts)
  const categoryTotal = staffHazardCategories.reduce((sum, c) => sum + c.count, 0);
  let donutOffset = 0;
  const donutSegments = staffHazardCategories.map((c) => {
    const len = (c.count / categoryTotal) * DONUT_C;
    const segment = { ...c, len, offset: donutOffset };
    donutOffset += len;
    return segment;
  });

  const subline = greeting.late
    ? "Working late? Here's what's happening in your barangay tonight."
    : "Here's what's happening with hazard reports in your barangay today.";

  const pendingLine =
    stats.pendingReview > 0
      ? stats.pendingReview +
        (stats.pendingReview === 1 ? " report is" : " reports are") +
        " waiting for your review."
      : "Nothing is waiting for your review. Nice work!";

  const dateText = now.toLocaleDateString("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: TZ,
  });
  const timeText = now
    .toLocaleTimeString("en-PH", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      timeZone: TZ,
    })
    .toUpperCase();

  const cards = [
    {
      key: "total",
      label: "Total Reports",
      value: stats.totalReports,
      note: stats.weeklyChangePct + "% this week",
      noteIcon: TrendingUp,
      icon: FileText,
      tone: "navy",
    },
    {
      key: "pending",
      label: "Pending Review",
      value: stats.pendingReview,
      note: "Awaiting evaluation",
      icon: Hourglass,
      tone: "orange",
    },
    {
      key: "high",
      label: "High Severity",
      value: stats.highSeverity,
      note: "Needs priority review",
      icon: TriangleAlert,
      tone: "red",
    },
    {
      key: "resolved",
      label: "Resolved Reports",
      value: stats.resolved,
      note: resolutionRate + "% resolution rate",
      icon: CircleCheck,
      tone: "green",
    },
    {
      key: "flagged",
      label: "Flagged Reports",
      value: stats.flagged,
      note: "Needs field check",
      icon: Flag,
      tone: "red",
    },
    {
      key: "field",
      label: "Field Checks Pending",
      value: stats.fieldChecksPending,
      note: "Awaiting on-site check",
      icon: MapPin,
      tone: "violet",
    },
  ];

  return (
    <div className="flex min-h-screen bg-[#F2F4FB]">
      <StaffSidebar onLogout={() => navigate("/signin")} />

      <div className="min-w-0 flex-1">
        <StaffHeader />

        <main className="space-y-6 p-8">
          {/* GREETING ROW */}
          <section className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="flex items-center gap-3 text-3xl font-bold text-[#0F1B4D]">
                <greeting.Icon size={30} strokeWidth={1.8} className={greeting.tone} />
                <span>{greeting.text + ", " + firstName + "!"}</span>
              </h1>
              <p className="mt-1.5 max-w-xl text-sm text-slate-500">
                {subline + " " + pendingLine}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <InfoPill icon={CalendarDays} iconClass="text-slate-400">
                <p className="text-xs text-slate-500">{dateText}</p>
                <p className="text-sm font-semibold text-[#0F1B4D]">{timeText}</p>
              </InfoPill>

              <InfoPill icon={CloudRain} iconClass="text-[#1B2A8E]">
                <p className="text-lg font-bold text-[#0F1B4D]">
                  {staffWeather.tempC + "°C"}
                </p>
                <p className="text-xs text-slate-500">
                  {staffWeather.condition + " · " + staffWeather.location}
                </p>
              </InfoPill>
            </div>
          </section>

          {/* STAT CARDS */}
          <section className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
            {cards.map(({ key, ...card }) => (
              <StaffStatCard key={key} {...card} />
            ))}
          </section>

          {/* MAIN GRID */}
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
            {/* LEFT COLUMN */}
            <div className="min-w-0 space-y-6">
              {/* PRIORITY REPORTS */}
              <SectionCard
                icon={TriangleAlert}
                iconWrap="bg-red-100 text-red-600"
                title="Priority Reports"
                subtitle="High severity first · AI-assisted, staff make the final call"
                actionTo="/staff/review-queue"
                actionLabel="View all"
              >
                <div className="overflow-x-auto">
                  <div className="min-w-[640px]">
                    <div
                      className={[
                        ROW_GRID,
                        "border-t border-[#E3E8F4] bg-[#F7F8FD] px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-400",
                      ].join(" ")}
                    >
                      <span>Report</span>
                      <span>Severity</span>
                      <span>AI Credibility</span>
                      <span>Submitted</span>
                      <span />
                    </div>

                    {priorityReports.length === 0 && (
                      <p className="border-t border-[#E3E8F4] px-5 py-8 text-center text-sm text-slate-500">
                        No priority reports right now.
                      </p>
                    )}

                    {priorityReports.map((r) => {
                      const cred = credibilityOf(r.credibility);

                      return (
                        <button
                          key={r.id}
                          type="button"
                          onClick={() => navigate("/staff/review-queue/" + r.id)}
                          className={[
                            ROW_GRID,
                            "w-full border-t border-[#E3E8F4] px-5 py-3 text-left transition-colors hover:bg-slate-50",
                          ].join(" ")}
                        >
                          <div className="flex min-w-0 items-center gap-3">
                            <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-slate-100 text-slate-400">
                              {r.thumbnailUrl ? (
                                <img
                                  src={r.thumbnailUrl}
                                  alt=""
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <ImageIcon size={20} strokeWidth={1.7} />
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="text-[11px] font-semibold text-slate-400">
                                {r.id}
                              </p>
                              <p className="truncate text-sm font-semibold text-[#0F1B4D]">
                                {r.title}
                              </p>
                              <p className="truncate text-xs text-slate-500">
                                {r.location}
                              </p>
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

                          <span className="text-sm text-slate-600">
                            {timeAgo(r.submittedAt, now)}
                          </span>

                          <ChevronRight size={16} className="text-slate-400" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              </SectionCard>

              {/* RECENT ACTIVITY */}
              <SectionCard
                icon={Activity}
                iconWrap="bg-[#E8EBFA] text-[#1B2A8E]"
                title="Recent Activity"
                subtitle="Latest reports and actions"
              >
                <div className="overflow-x-auto">
                  <div className="min-w-[680px]">
                    {staffRecentActivity.map((a) => (
                      <div
                        key={a.id}
                        className={[
                          ACTIVITY_GRID,
                          "border-t border-[#E3E8F4] px-5 py-3 text-sm",
                        ].join(" ")}
                      >
                        <span
                          className={[
                            "w-fit rounded-full border px-2.5 py-0.5 text-xs font-medium",
                            ACTIVITY_STYLE[a.type],
                          ].join(" ")}
                        >
                          {a.type}
                        </span>
                        <span className="font-semibold text-[#0F1B4D]">{a.id}</span>
                        <span className="truncate text-slate-500">
                          {a.hazard + " · " + a.location}
                        </span>
                        <span className="text-xs text-slate-400">
                          {timeAgo(a.at, now)}
                        </span>
                        <span className="truncate text-xs text-slate-600">
                          {a.note}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </SectionCard>
            </div>

            {/* RIGHT COLUMN */}
            <div className="min-w-0 space-y-6">
              {/* FIELD INSPECTION OVERVIEW */}
              <SectionCard
                icon={MapPin}
                iconWrap="bg-[#E8EBFA] text-[#1B2A8E]"
                title="Field Inspection Overview"
                subtitle="Cases requiring on-site verification"
                actionTo="/staff/field-checks"
                actionLabel="View all"
              >
                <div className="grid grid-cols-3 gap-3 px-5 pb-5">
                  {FIELD_TILES.map(({ key, label, box, num }) => (
                    <div
                      key={key}
                      className={["rounded-xl border p-3", box].join(" ")}
                    >
                      <p className="min-h-8 text-xs font-medium leading-4 text-slate-600">
                        {label}
                      </p>
                      <p className={["mt-1 text-2xl font-bold", num].join(" ")}>
                        {staffFieldChecks[key]}
                      </p>
                    </div>
                  ))}
                </div>
              </SectionCard>

              {/* HAZARD CATEGORY DISTRIBUTION */}
              <SectionCard
                icon={PieChart}
                iconWrap="bg-[#E8EBFA] text-[#1B2A8E]"
                title="Hazard Category Distribution"
                subtitle="Based on submitted reports"
              >
                <div className="flex items-center gap-5 px-5 pb-5">
                  <div className="relative h-36 w-36 shrink-0">
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
                      <p className="text-xl font-bold text-[#0F1B4D]">
                        {categoryTotal.toLocaleString("en-PH")}
                      </p>
                      <p className="text-xs text-slate-500">reports</p>
                    </div>
                  </div>

                  <ul className="min-w-0 flex-1 space-y-2">
                    {staffHazardCategories.map((c) => (
                      <li
                        key={c.label}
                        className="flex items-center justify-between gap-2 text-xs"
                      >
                        <span className="flex min-w-0 items-center gap-2 text-slate-600">
                          <span
                            className="h-2.5 w-2.5 shrink-0 rounded-full"
                            style={{ backgroundColor: c.color }}
                          />
                          <span className="truncate">{c.label}</span>
                        </span>
                        <span className="shrink-0 text-slate-500">
                          {Math.round((c.count / categoryTotal) * 100) +
                            "% (" +
                            c.count +
                            ")"}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </SectionCard>

              {/* QUICK ACTIONS */}
              <SectionCard
                icon={Zap}
                iconWrap="bg-[#E8EBFA] text-[#1B2A8E]"
                title="Quick Actions"
                subtitle="Common tasks for staff"
              >
                <div className="grid grid-cols-1 gap-3 px-5 pb-5 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
                  <QuickAction
                    primary
                    to="/staff/review-queue"
                    icon={ClipboardList}
                    title="Go to Review Queue"
                    sub={stats.pendingReview + " pending reports"}
                  />
                  <QuickAction
                    to="/staff/field-checks"
                    icon={MapPin}
                    title="View Field Checks"
                    sub={stats.fieldChecksPending + " pending checks"}
                  />
                  <QuickAction
                    to="/staff/map"
                    icon={MapIcon}
                    title="Open Map Monitor"
                    sub="View hazard locations"
                  />
                  <QuickAction
                    to="/staff/analytics"
                    icon={BarChart2}
                    title="View Analytics"
                    sub="Reports & insights"
                  />
                </div>
              </SectionCard>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}