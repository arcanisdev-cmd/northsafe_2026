import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  ChevronDown,
  RotateCcw,
  Download,
  FileText,
  ShieldCheck,
  CheckCircle2,
  Users,
  Waves,
  Construction,
  Flame,
  Zap,
  Mountain,
  MoreHorizontal,
  Star,
  Gift,
  Smartphone,
} from "lucide-react";
import AdminSidebar from "../layouts/AdminSidebar";
import AdminHeader from "../layouts/AdminHeader";

// ---------------------------------------------------------------------------
// Mock data — page-local, nothing here is reused elsewhere.
// ---------------------------------------------------------------------------

const filterOptions = {
  dateRange: ["Last 30 Days (Oct 15 - Nov 14, 2024)", "Last 7 Days", "Last 90 Days"],
  barangays: ["North Caloocan Barangays", "Brgy. 176", "Brgy. 178", "Brgy. 171"],
  categories: ["Hazard Category", "Flooding", "Fire", "Road Damage", "Power Line"],
  alertLevels: ["Alert Levels", "White Alert", "Blue Alert", "Red Alert"],
};

const kpis = [
  {
    key: "total",
    icon: FileText,
    iconColor: "#2F6FD9",
    label: "TOTAL REPORTS",
    value: "3,842",
    trend: "+12.4%",
    trendUp: true,
    trendLabel: "vs last month",
    note: "Total citizen submissions across 14 barangays",
  },
  {
    key: "verified",
    icon: ShieldCheck,
    iconColor: "#7C3AED",
    label: "VERIFIED REPORTS",
    value: "3,190",
    pill: "83.0% verification rate",
    pillColor: "#7C3AED",
    note: "AI Inference verified + Admin confirmed",
  },
  {
    key: "resolved",
    icon: CheckCircle2,
    iconColor: "#16A34A",
    label: "RESOLVED REPORTS",
    value: "2,845",
    pill: "4.2 hrs avg resolution turnaround",
    pillColor: "#16A34A",
    note: "Dispatched field units closed incidents",
  },
  {
    key: "activeUsers",
    icon: Users,
    iconColor: "#2F6FD9",
    label: "ACTIVE COMMUNITY USERS",
    value: "18,650",
    trend: "+1,420",
    trendUp: true,
    trendLabel: "new verified residents",
    note: "Validated registered citizens in Caloocan North",
  },
];

// Reports Over Time — daily volume across a 14-day window, peaking on the
// "Heavy Rain Event" (Nov 10) called out in the mockup's tooltip example.
const reportsOverTime = [
  { date: "Nov 01", submissions: 58, verified: 40, resolved: 22 },
  { date: "Nov 02", submissions: 72, verified: 55, resolved: 34 },
  { date: "Nov 03", submissions: 65, verified: 48, resolved: 30 },
  { date: "Nov 04", submissions: 90, verified: 70, resolved: 46 },
  { date: "Nov 05", submissions: 84, verified: 66, resolved: 50 },
  { date: "Nov 06", submissions: 110, verified: 88, resolved: 60 },
  { date: "Nov 07", submissions: 96, verified: 78, resolved: 64 },
  { date: "Nov 08", submissions: 120, verified: 95, resolved: 72 },
  { date: "Nov 09", submissions: 140, verified: 118, resolved: 90 },
  { date: "Nov 10", submissions: 172, verified: 154, resolved: 138 },
  { date: "Nov 11", submissions: 150, verified: 132, resolved: 110 },
  { date: "Nov 12", submissions: 165, verified: 140, resolved: 100 },
  { date: "Nov 13", submissions: 148, verified: 120, resolved: 95 },
  { date: "Nov 14", submissions: 155, verified: 128, resolved: 105 },
];

// Sums to the same 3,842 total shown in the KPI card / donut center.
const reportStatus = [
  { status: "Resolved", value: 2845, pct: 74.1, color: "#16A34A" },
  { status: "In Progress", value: 545, pct: 14.2, color: "#F5872E" },
  { status: "Verified", value: 336, pct: 8.7, color: "#7C3AED" },
  { status: "Rejected", value: 116, pct: 3.0, color: "#E11D2E" },
];

// Also sums to 3,842.
const alertDistribution = [
  { level: "White Alert", count: 2410, pct: 62.7, note: "Normal / Minor Attention", color: "#94A3B8", bg: "#F8FAFC" },
  { level: "Blue Alert", count: 1020, pct: 26.5, note: "Moderate / Preparedness", color: "#2F6FD9", bg: "#EFF6FF" },
  { level: "Red Alert", count: 412, pct: 10.8, note: "Severe / Emergency Evacuation", color: "#E11D2E", bg: "#FEF2F2" },
];

const hazardsByCategory = [
  { label: "Urban Flooding & Drainage", count: 1420, pct: 37, icon: Waves, color: "#2F6FD9" },
  { label: "Road Obstruction & Fallen Debris", count: 890, pct: 23, icon: Construction, color: "#F5872E" },
  { label: "Fire Hazard & Smoke", count: 512, pct: 13, icon: Flame, color: "#E11D2E" },
  { label: "Electrical & Power Line Damage", count: 480, pct: 12, icon: Zap, color: "#7C3AED" },
  { label: "Structural & Landslide Risk", count: 340, pct: 9, icon: Mountain, color: "#B45309" },
  { label: "Others", count: 200, pct: 5, icon: MoreHorizontal, color: "#94A3B8" },
];

const reportsByBarangay = [
  { barangay: "Brgy. 176 (Bagong Silang)", count: 1120, pct: 100, note: "Largest barangay in PH; primarily Phase 1-9 drainage reports" },
  { barangay: "Brgy. 178 (Camarin)", count: 780, pct: 70, note: "High incidence of power line hazards along Susano Road" },
  { barangay: "Brgy. 171 (Bagumbong)", count: 590, pct: 53, note: "Creek embankment monitoring near congressional boundary" },
  { barangay: "Brgy. 175 (Camarin Area D)", count: 430, pct: 38, note: "Road obstruction and low-hanging cable incidents" },
  { barangay: "Brgy. 177 (Cielito Homes)", count: 380, pct: 34, note: "Subdivision interior access blockages and fallen branches" },
];

const gamification = {
  availablePoints: 167300,
  totalEarned: 482500,
  redeemed: 315200,
  prepaidVouchers: 6304,
};

// ---------------------------------------------------------------------------
// Small local sub-components
// ---------------------------------------------------------------------------

function FilterSelect({ options }) {
  return (
    <div className="relative">
      <select className="appearance-none rounded-lg border border-[#E5EEF9] bg-white py-2.5 pl-3 pr-9 text-sm font-medium text-slate-600 outline-none focus:border-[#2F6FD9]">
        {options.map((opt) => (
          <option key={opt}>{opt}</option>
        ))}
      </select>
      <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
    </div>
  );
}

function FilterBar({ onReset, onExport }) {
  return (
    <div className="mb-4 flex flex-wrap items-center gap-3">
      <FilterSelect options={filterOptions.dateRange} />
      <FilterSelect options={filterOptions.barangays} />
      <FilterSelect options={filterOptions.categories} />
      <FilterSelect options={filterOptions.alertLevels} />
      <button
        type="button"
        onClick={onReset}
        className="flex items-center gap-2 rounded-lg bg-[#0B1830] px-3 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#16264A]"
      >
        <RotateCcw size={14} />
        Reset Filters
      </button>
      <button
        type="button"
        onClick={onExport}
        className="flex items-center gap-2 rounded-lg border border-[#16A34A] px-3 py-2.5 text-sm font-semibold text-[#16A34A] transition-colors hover:bg-[#E9F9EE]"
      >
        <Download size={14} />
        Export PDF
      </button>
    </div>
  );
}

function KpiCard({ icon: Icon, iconColor, label, value, trend, trendUp, trendLabel, pill, pillColor, note }) {
  return (
    <div className="rounded-2xl border border-[#E5EEF9] bg-white p-4 shadow-sm">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p>
        <span
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
          style={{ backgroundColor: `${iconColor}1A`, color: iconColor }}
        >
          <Icon size={16} />
        </span>
      </div>
      <p className="text-3xl font-bold text-[#0B1830]">{value}</p>
      <div className="mt-1.5 flex items-center gap-2 text-xs">
        {trend && (
          <span className={`font-semibold ${trendUp ? "text-green-600" : "text-red-600"}`}>
            {trendUp ? "↗" : "↘"}{trend}
          </span>
        )}
        {pill && (
          <span className="rounded px-1.5 py-0.5 text-xs font-semibold" style={{ backgroundColor: `${pillColor}1A`, color: pillColor }}>
            {pill}
          </span>
        )}
        {trendLabel && <span className="text-slate-400">{trendLabel}</span>}
      </div>
      <p className="mt-2 text-xs text-slate-500">{note}</p>
    </div>
  );
}

// Custom dark tooltip matching the mockup's "Nov 10, 2024 - Heavy Rain
// Event" callout style. NOTE: this shows on hover like a normal recharts
// tooltip — the mockup shows it "pinned" open by default, which would need
// extra state to replicate exactly; deferred as a minor simplification.
function ReportsTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const data = payload[0].payload;
  return (
    <div className="rounded-lg bg-[#0B1830] px-4 py-3 text-white shadow-lg">
      <p className="mb-2 text-xs font-semibold text-slate-300">{label}, 2024</p>
      <div className="space-y-1 text-xs">
        <p className="flex items-center justify-between gap-6">
          <span className="text-slate-300">Submissions:</span>
          <span className="font-bold">{data.submissions}</span>
        </p>
        <p className="flex items-center justify-between gap-6">
          <span className="text-slate-300">AI Verified:</span>
          <span className="font-bold">{data.verified}</span>
        </p>
        <p className="flex items-center justify-between gap-6">
          <span className="text-slate-300">Resolved:</span>
          <span className="font-bold">{data.resolved}</span>
        </p>
      </div>
    </div>
  );
}

function ReportsOverTimeChart() {
  return (
    <div className="rounded-2xl border border-[#E5EEF9] bg-white p-5 shadow-sm">
      <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-[#0B1830]">Reports Over Time</h2>
          <p className="text-xs text-slate-500">Daily volume trends and resolution progression across November</p>
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-500">
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-[#2F6FD9]" />Citizen Submissions</span>
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-[#7C3AED]" />AI Verified</span>
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-[#16A34A]" />Field Resolved</span>
        </div>
      </div>

      <div style={{ width: "100%", height: 260 }}>
        <ResponsiveContainer>
          <LineChart data={reportsOverTime} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="#F1F5F9" />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} interval={2} />
            <YAxis tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
            <Tooltip content={<ReportsTooltip />} />
            <Line type="monotone" dataKey="submissions" stroke="#2F6FD9" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="verified" stroke="#7C3AED" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="resolved" stroke="#16A34A" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs">
        <p className="text-slate-500">Peak reporting incident: <span className="font-semibold text-[#0B1830]">Tropical Disturbance Shearline (Nov 10)</span></p>
        <p className="font-semibold text-[#2F6FD9]">92.1% AI verification success across 14-day window</p>
      </div>
    </div>
  );
}

function ReportStatusDonut() {
  const total = reportStatus.reduce((sum, s) => sum + s.value, 0);
  return (
    <div className="rounded-2xl border border-[#E5EEF9] bg-white p-5 shadow-sm">
      <h2 className="mb-3 text-base font-bold text-[#0B1830]">
        Report Status <span className="text-sm font-normal text-slate-400">Current Cycle</span>
      </h2>

      <div className="relative" style={{ width: "100%", height: 200 }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie data={reportStatus} dataKey="value" nameKey="status" innerRadius={65} outerRadius={90} paddingAngle={2} stroke="none">
              {reportStatus.map((s) => (
                <Cell key={s.status} fill={s.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-2xl font-bold text-[#0B1830]">{total.toLocaleString()}</p>
          <p className="text-xs font-semibold uppercase text-slate-400">Total</p>
        </div>
      </div>

      <ul className="mt-2 space-y-1.5">
        {reportStatus.map((s) => (
          <li key={s.status} className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-slate-600">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: s.color }} />
              {s.status}
            </span>
            <span className="font-semibold text-[#0B1830]">
              {s.value.toLocaleString()} <span className="text-xs font-normal text-slate-400">({s.pct}%)</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function AlertLevelDistributionPanel() {
  return (
    <div className="rounded-2xl border border-[#E5EEF9] bg-white p-5 shadow-sm">
      <h2 className="text-base font-bold text-[#0B1830]">Alert Level Distribution</h2>
      <p className="mb-3 text-xs text-slate-500">DRRMO triage classification severity breakdown</p>
      <div className="space-y-2.5">
        {alertDistribution.map((a) => (
          <div key={a.level} className="rounded-xl border p-3" style={{ borderColor: `${a.color}33`, backgroundColor: a.bg }}>
            <div className="flex items-start justify-between gap-2">
              <span className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: a.color }} />
                <span>
                  <p className="text-sm font-bold" style={{ color: a.color }}>{a.level}</p>
                  <p className="text-xs text-slate-500">{a.note}</p>
                </span>
              </span>
              <span className="shrink-0 text-right">
                <p className="text-lg font-bold" style={{ color: a.color }}>{a.count.toLocaleString()}</p>
                <p className="text-xs text-slate-400">{a.pct}% of total</p>
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function HazardsByCategoryPanel() {
  return (
    <div className="rounded-2xl border border-[#E5EEF9] bg-white p-5 shadow-sm">
      <div className="mb-1 flex items-center justify-between">
        <h2 className="text-base font-bold text-[#0B1830]">Hazards by Category</h2>
        <span className="text-xs text-slate-400">Frequency breakdown</span>
      </div>
      <p className="mb-3 text-xs text-slate-500">AI-classified hazards ranked by citizen report volume</p>
      <ul className="space-y-3">
        {hazardsByCategory.map(({ label, count, pct, icon: Icon, color }) => (
          <li key={label}>
            <div className="mb-1 flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 font-semibold text-[#0B1830]">
                <Icon size={14} style={{ color }} />
                {label}
              </span>
              <span className="text-slate-500">{count.toLocaleString()} <span className="text-xs text-slate-400">({pct}%)</span></span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-slate-100">
              <div className="h-1.5 rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ReportsByBarangayPanel() {
  return (
    <div className="rounded-2xl border border-[#E5EEF9] bg-white p-5 shadow-sm">
      <div className="mb-1 flex items-center justify-between">
        <h2 className="text-base font-bold text-[#0B1830]">Reports by Barangay</h2>
        <span className="text-xs text-slate-400">Top Hotspots</span>
      </div>
      <p className="mb-3 text-xs text-slate-500">Geospatial reporting density across North Caloocan sectors</p>
      <ul className="space-y-3">
        {reportsByBarangay.map((b) => (
          <li key={b.barangay}>
            <div className="mb-1 flex items-center justify-between text-sm">
              <span className="flex items-center gap-1.5 font-semibold text-[#0B1830]">
                <span className="h-2 w-2 rounded-full bg-[#2F6FD9]" />
                {b.barangay}
              </span>
              <span className="text-slate-500">{b.count.toLocaleString()} reports</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-slate-100">
              <div className="h-1.5 rounded-full bg-[#2F6FD9]" style={{ width: `${b.pct}%` }} />
            </div>
            <p className="mt-1 text-xs text-slate-400">{b.note}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

function CitizenGamificationPanel() {
  return (
    <div className="rounded-2xl border border-[#E5EEF9] bg-white p-5 shadow-sm">
      <h2 className="text-base font-bold text-[#0B1830]">Citizen Gamification</h2>
      <p className="mb-3 text-xs text-slate-500">Incentive points for verified community hazard reporters</p>

      <div className="rounded-xl bg-[#0B1830] p-4 text-white">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-300">Available Points in Circulation</p>
        <p className="mt-1 text-2xl font-bold">{gamification.availablePoints.toLocaleString()} <span className="text-sm font-normal text-slate-300">pts</span></p>
        <p className="mt-1 flex items-center gap-1.5 text-xs text-emerald-400">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          Active citizen reward economy healthy
        </p>
      </div>

      <ul className="mt-3 divide-y divide-[#F1F5F9]">
        <li className="flex items-center gap-3 py-2.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#EDE4FB] text-[#7C3AED]"><Star size={16} /></span>
          <span className="flex-1 text-sm text-slate-600">Total Points Earned</span>
          <span className="text-sm font-bold text-[#0B1830]">{gamification.totalEarned.toLocaleString()} pts</span>
        </li>
        <li className="flex items-center gap-3 py-2.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#FBE4E4] text-[#E11D2E]"><Gift size={16} /></span>
          <span className="flex-1 text-sm text-slate-600">Points Redeemed</span>
          <span className="text-sm font-bold text-[#0B1830]">{gamification.redeemed.toLocaleString()} pts</span>
        </li>
        <li className="mt-1 flex items-center gap-3 rounded-xl border border-[#E5EEF9] px-3 py-2.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#E1EEFC] text-[#2F6FD9]"><Smartphone size={16} /></span>
          <span className="flex-1">
            <p className="text-sm text-slate-600">Prepaid Load Claimed</p>
            <p className="text-xs text-slate-400">Globe / Smart / DITO partners</p>
          </span>
          <span className="text-sm font-bold text-[#0B1830]">{gamification.prepaidVouchers.toLocaleString()} vouchers</span>
        </li>
      </ul>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function AdminAnalyticsPage() {
  const handleLogout = () => {
    // TODO: wire up to LogoutConfirmModal.jsx.
    console.log("logout clicked");
  };

  const handleReset = () => {
    // TODO: wire up to real filter state once filters are functional.
    console.log("reset filters clicked");
  };

  const handleExport = () => {
    // TODO: wire up to a real PDF export.
    console.log("export PDF clicked");
  };

  return (
    <div className="flex min-h-screen bg-[#EAF2FB]">
      <AdminSidebar onLogout={handleLogout} />

      <div className="flex min-w-0 flex-1 flex-col">
        <AdminHeader title="Analytics" subtitle="System performance and hazard reporting insights" />

        <main className="flex-1 space-y-5 p-6">
          <FilterBar onReset={handleReset} onExport={handleExport} />

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {kpis.map((kpi) => (
              <KpiCard key={kpi.key} {...kpi} />
            ))}
          </div>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
            <div className="lg:col-span-5"><ReportsOverTimeChart /></div>
            <div className="lg:col-span-4"><ReportStatusDonut /></div>
            <div className="lg:col-span-3"><AlertLevelDistributionPanel /></div>
          </div>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
            <HazardsByCategoryPanel />
            <ReportsByBarangayPanel />
            <CitizenGamificationPanel />
          </div>
        </main>
      </div>
    </div>
  );
}
