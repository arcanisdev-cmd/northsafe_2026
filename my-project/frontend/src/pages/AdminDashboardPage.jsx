import {
  FileBarChart2,
  Clock3,
  ShieldCheck,
  BookOpen,
  ChevronRight,
  Trophy,
  Star,
  Gift,
  Hourglass,
  Users,
  RotateCw,
  CheckCircle2,
  Clock,
  Ban,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Cell,
  LabelList,
  ResponsiveContainer,
  PieChart,
  Pie,
} from "recharts";
import AdminSidebar from "../layouts/AdminSidebar";
import AdminHeader from "../layouts/AdminHeader";
// The real report pipeline is Submitted -> Pending -> Verified -> Resolved
// (Rejected branches off Pending) — there is no "In Progress" state. This
// page previously invented one; importing the real enum here means the
// legend below can never drift from the canonical pipeline again.
import { reportStatuses } from "../components/data/MockDashboardData";

// ---------------------------------------------------------------------------
// Mock data — everything this page needs, colocated here since nothing on
// this page is reused by any other admin page.
// ---------------------------------------------------------------------------

const adminStats = { totalReports: 78, pending: 18, verified: 24, resolved: 36 };

const hazardsByCategory = [
  { category: "Illegal Dumping", count: 20, color: "#A78BFA" },
  { category: "Building Damage", count: 15, color: "#6EE7B7" },
  { category: "Power Line", count: 25, color: "#60A5FA" },
  { category: "Fallen Tree", count: 31, color: "#FBBF24" },
  { category: "Road Damage", count: 41, color: "#22D3EE" },
  { category: "Flood", count: 8, color: "#FCA5A5" },
  { category: "Fire", count: 53, color: "#818CF8" },
];

const hazardHotspots = [
  { barangay: "Barangay 168", activeCount: 45, dot: "#E11D2E" },
  { barangay: "Barangay 171", activeCount: 32, dot: "#F5872E" },
  { barangay: "Barangay 172", activeCount: 18, dot: "#2FB6C7" },
  { barangay: "Barangay 167", activeCount: 12, dot: "#1E293B" },
];

const rewardManagement = { totalPoints: 350, redeemedPoints: 150, pendingRedemption: 200, activeUsers: 50 };

const alertLevelBreakdown = [
  { level: "Blue Alert", value: 46, color: "#3FC6D4" },
  { level: "Red Alert", value: 42, color: "#F2A49A" },
  { level: "White Alert", value: 12, color: "#E5EEF9" },
];

const adminRecentReports = [
  {
    id: "ar-1",
    title: "Flood in barangay 167",
    address:
      "University of Caloocan, Congressional Road, Bagumbong, Zone 15, District 1, Caloocan, Northern Manila District, Metro Manila, 1421, Philippines, Barangay 167",
    date: "April 13, 2026",
    alertLevel: "blue",
    status: "Verified",
  },
  {
    id: "ar-2",
    title: "Flood in barangay 167",
    address:
      "University of Caloocan, Congressional Road, Bagumbong, Zone 15, District 1, Caloocan, Northern Manila District, Metro Manila, 1421, Philippines, Barangay 167",
    date: "April 13, 2026",
    alertLevel: "white",
    status: "Pending",
  },
  {
    id: "ar-3",
    title: "Flood in barangay 167",
    address:
      "University of Caloocan, Congressional Road, Bagumbong, Zone 15, District 1, Caloocan, Northern Manila District, Metro Manila, 1421, Philippines, Barangay 167",
    date: "April 13, 2026",
    alertLevel: "red",
    status: "Resolved",
  },
  {
    id: "ar-4",
    title: "Flood in barangay 167",
    address:
      "University of Caloocan, Congressional Road, Bagumbong, Zone 15, District 1, Caloocan, Northern Manila District, Metro Manila, 1421, Philippines, Barangay 167",
    date: "April 13, 2026",
    alertLevel: "blue",
    status: "Rejected",
  },
];

const ALERT_LEVEL_CONFIG = {
  blue: { label: "Blue Alert", color: "#2F6FD9" },
  red: { label: "Red Alert", color: "#E11D2E" },
  white: { label: "White Alert", color: "#FFFFFF", border: "#CBD5E1" },
};

const STATUS_CONFIG = {
  Pending: { label: "Pending", icon: Clock, color: "#94A3B8", bg: "#F1F5F9" },
  Verified: { label: "Verified", icon: CheckCircle2, color: "#2F6FD9", bg: "#E8F0FE" },
  Resolved: { label: "Resolved", icon: CheckCircle2, color: "#16A34A", bg: "#E9F9EE" },
  Rejected: { label: "Rejected", icon: Ban, color: "#E11D2E", bg: "#FDEAEA" },
};

// ---------------------------------------------------------------------------
// Small local sub-components — not exported, only used within this page.
// ---------------------------------------------------------------------------

function StatCard({ icon: Icon, label, value, accentColor }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-[#E5EEF9] bg-white px-5 py-5 shadow-sm">
      <div
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
        style={{ backgroundColor: `${accentColor}1A`, color: accentColor }}
      >
        <Icon size={22} />
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-slate-500">{label}</p>
        <p className="text-3xl font-bold" style={{ color: accentColor }}>{value}</p>
      </div>
    </div>
  );
}

function CategoryBarChart() {
  return (
    <div className="rounded-2xl border border-[#E5EEF9] bg-white p-5 shadow-sm">
      <h2 className="mb-4 text-base font-bold text-[#0B1830]">Total Hazards by Category</h2>
      <div style={{ width: "100%", height: 260 }}>
        <ResponsiveContainer>
          <BarChart data={hazardsByCategory} layout="vertical" margin={{ top: 0, right: 24, bottom: 0, left: 0 }} barCategoryGap={14}>
            <XAxis type="number" hide />
            <YAxis type="category" dataKey="category" width={110} tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "#475569" }} />
            <Bar dataKey="count" radius={[6, 6, 6, 6]} barSize={18}>
              {hazardsByCategory.map((entry) => (
                <Cell key={entry.category} fill={entry.color} />
              ))}
              <LabelList dataKey="count" position="insideRight" fill="#0B1830" fontSize={12} fontWeight={700} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function HotspotsList() {
  return (
    <div className="rounded-2xl border border-[#E5EEF9] bg-white p-5 shadow-sm">
      <h2 className="mb-4 flex items-center gap-2 text-base font-bold text-[#0B1830]">
        <BookOpen size={18} />
        Hazard Hotspots
      </h2>
      <ul className="divide-y divide-[#F1F5F9]">
        {hazardHotspots.map((spot) => (
          <li key={spot.barangay}>
            <button type="button" className="flex w-full items-center gap-3 py-3 text-left transition-colors hover:bg-slate-50">
              <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: spot.dot }} />
              <span className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-[#0B1830]">{spot.barangay}</p>
                <p className="text-xs text-slate-500">{spot.activeCount} Active</p>
              </span>
              <ChevronRight size={16} className="shrink-0 text-slate-400" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function RewardManagementPanel() {
  const rows = [
    { key: "totalPoints", label: "Total Points", icon: Star, color: "#F5B942" },
    { key: "redeemedPoints", label: "Redeemed Points", icon: Gift, color: "#E5484D" },
    { key: "pendingRedemption", label: "Pending Redemption", icon: Hourglass, color: "#F5872E" },
    { key: "activeUsers", label: "Active Users", icon: Users, color: "#2563EB" },
  ];
  return (
    <div className="rounded-2xl border border-[#E5EEF9] bg-white p-5 shadow-sm">
      <h2 className="mb-4 flex items-center gap-2 text-base font-bold text-[#0B1830]">
        <Trophy size={18} />
        Reward and Management
      </h2>
      <ul className="divide-y divide-[#F1F5F9]">
        {rows.map(({ key, label, icon: Icon, color }) => (
          <li key={key} className="flex items-center gap-3 py-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg" style={{ backgroundColor: `${color}1A`, color }}>
              <Icon size={16} />
            </span>
            <span className="flex-1 text-sm text-slate-600">{label}</span>
            <span className="text-sm font-bold text-[#0B1830]">{rewardManagement[key]}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function RecentReportsPanel() {
  return (
    <div className="rounded-2xl border border-[#E5EEF9] bg-white p-5 shadow-sm">
      <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
        <h2 className="flex items-center gap-2 text-base font-bold text-[#0B1830]">
          <RotateCw size={16} />
          Recent Reports
        </h2>
        <div className="flex flex-col items-end gap-1 text-xs text-slate-500">
          <div className="flex items-center gap-3">
            {Object.entries(ALERT_LEVEL_CONFIG).map(([key, cfg]) => (
              <span key={key} className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: cfg.color, border: cfg.border ? `1px solid ${cfg.border}` : "none" }} />
                {cfg.label}
              </span>
            ))}
          </div>
          <div className="flex items-center gap-3">
            {reportStatuses.map((status) => {
              const Icon = STATUS_CONFIG[status].icon;
              return (
                <span key={status} className="flex items-center gap-1.5">
                  <Icon size={12} style={{ color: STATUS_CONFIG[status].color }} />
                  {status}
                </span>
              );
            })}
          </div>
        </div>
      </div>

      <ul className="divide-y divide-[#F1F5F9]">
        {adminRecentReports.map((report) => {
          const StatusIconComp = STATUS_CONFIG[report.status].icon;
          return (
            <li key={report.id} className="flex flex-wrap items-center gap-4 py-3 sm:flex-nowrap">
              <div className="flex shrink-0 items-center gap-1.5">
                <span
                  className="h-4 w-4 shrink-0 rounded-full"
                  style={{
                    backgroundColor: ALERT_LEVEL_CONFIG[report.alertLevel].color,
                    border: ALERT_LEVEL_CONFIG[report.alertLevel].border ? `1.5px solid ${ALERT_LEVEL_CONFIG[report.alertLevel].border}` : "none",
                  }}
                />
                <span
                  className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full"
                  style={{ backgroundColor: STATUS_CONFIG[report.status].bg, color: STATUS_CONFIG[report.status].color }}
                >
                  <StatusIconComp size={11} strokeWidth={2.5} />
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-[#0B1830]">{report.title}</p>
                <p className="truncate text-xs text-slate-500">{report.address} · {report.date}</p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <button type="button" className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-500 transition-colors hover:bg-slate-200">
                  View Details
                </button>
                <button type="button" className="rounded-lg bg-[#0B1830] px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[#16264A]">
                  Update Status
                </button>
              </div>
            </li>
          );
        })}
      </ul>

      <div className="mt-3 flex justify-end">
        <button type="button" className="text-sm font-semibold text-[#2F6FD9] hover:underline">View All →</button>
      </div>
    </div>
  );
}

function AlertLevelDonut() {
  return (
    <div className="rounded-2xl border border-[#E5EEF9] bg-white p-5 shadow-sm">
      <h2 className="mb-2 text-base font-bold text-[#0B1830]">Reports by Alert Level</h2>
      <div style={{ width: "100%", height: 200 }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie data={alertLevelBreakdown} dataKey="value" nameKey="level" innerRadius={55} outerRadius={85} paddingAngle={2} stroke="none">
              {alertLevelBreakdown.map((entry) => (
                <Cell key={entry.level} fill={entry.color} stroke={entry.color === "#E5EEF9" ? "#CBD5E1" : "none"} strokeWidth={entry.color === "#E5EEF9" ? 1 : 0} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-2 flex flex-wrap justify-center gap-4">
        {alertLevelBreakdown.map((entry) => (
          <span key={entry.level} className="flex items-center gap-1.5 text-xs text-slate-600">
            <span className="h-2.5 w-2.5 rounded-full border border-slate-300" style={{ backgroundColor: entry.color }} />
            {entry.level}
          </span>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function AdminDashboardPage() {
  const handleLogout = () => {
    // TODO: wire up to LogoutConfirmModal.jsx.
    console.log("logout clicked");
  };

  return (
    <div className="flex min-h-screen bg-[#EAF2FB]">
      <AdminSidebar onLogout={handleLogout} />

      <div className="flex min-w-0 flex-1 flex-col">
        <AdminHeader />

        <main className="flex-1 space-y-5 p-6">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard icon={FileBarChart2} label="Total Reports" value={adminStats.totalReports} accentColor="#2563EB" />
            <StatCard icon={Clock3} label="Pending" value={adminStats.pending} accentColor="#F5872E" />
            <StatCard icon={CheckCircle2} label="Verified" value={adminStats.verified} accentColor="#2F6FD9" />
            <StatCard icon={ShieldCheck} label="Resolved" value={adminStats.resolved} accentColor="#16A34A" />
          </div>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
            <div className="lg:col-span-6"><CategoryBarChart /></div>
            <div className="lg:col-span-3"><HotspotsList /></div>
            <div className="lg:col-span-3"><RewardManagementPanel /></div>
          </div>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
            <div className="lg:col-span-8"><RecentReportsPanel /></div>
            <div className="lg:col-span-4"><AlertLevelDonut /></div>
          </div>
        </main>
      </div>
    </div>
  );
}
