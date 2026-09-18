import { useMemo, useState } from "react";
import {
  Search,
  ChevronDown,
  Calendar,
  TrendingUp,
  ShieldCheck,
  ShieldAlert,
} from "lucide-react";
import AdminSidebar from "../layouts/AdminSidebar";
import AdminHeader from "../layouts/AdminHeader";

// ---------------------------------------------------------------------------
// Mock data — page-local.
// ---------------------------------------------------------------------------

const PAGE_SIZE = 6;

const actors = [
  { initials: "RM", name: "Engr. R. Morales", role: "Ops Admin", color: "#7C3AED" },
  { initials: "CD", name: "Officer C. Dizon", role: "Triage Staff", color: "#2F6FD9" },
  { initials: "AI", name: "AI Vision Worker #4", role: "System Automation", color: "#16A34A" },
  { initials: "SY", name: "System Guardian Bot", role: "Automated Monitoring", color: "#B45309" },
  { initials: "MD", name: "Admin M. Del Rosario", role: "Engineering DRRM", color: "#2F6FD9" },
  { initials: "KB", name: "Officer K. Bautista", role: "Training Division", color: "#7C3AED" },
];

const eventTemplates = [
  {
    action: "AI Classification Overridden",
    module: "AI Pipeline",
    description: "Overrode AI prediction from Minor Puddle (62% confidence) to Flood Hazard",
    color: "#7C3AED",
    bg: "#EDE4FB",
  },
  {
    action: "User Role Updated",
    module: "User Management",
    description: "Elevated Officer K. Bautista to Senior CDRRMO",
    color: "#2F6FD9",
    bg: "#E1EEFC",
  },
  {
    action: "Hazard Report Verified",
    module: "Hazard Reports",
    description: "Verified severe tree collapse blocking Susano Road",
    color: "#16A34A",
    bg: "#E9F9EE",
  },
  {
    action: "Announcement Published",
    module: "Public Safety Broadcast",
    description: "Published Typhoon Preparedness advisory to Brgy. 176",
    color: "#4C4CE0",
    bg: "#EEF0FE",
  },
  {
    action: "Hazard Report Rejected",
    module: "Hazard Reports",
    description: "Flagged duplicate hazard report #HZ-8488 (spam suspected)",
    color: "#B45309",
    bg: "#FDF3D9",
  },
  {
    action: "Points Redeemed",
    module: "Rewards System",
    description: "Approved prepaid load redemption for 3 verified users",
    color: "#0E9488",
    bg: "#E0F7F5",
  },
  {
    action: "Access Revoked",
    module: "User Management",
    description: "Revoked admin access due to 90-day inactivity policy",
    color: "#E11D2E",
    bg: "#FBE4E4",
  },
];

function buildAuditLogs(count) {
  const baseHour = 14;
  const baseMinute = 32;
  return Array.from({ length: count }, (_, i) => {
    const actor = actors[i % actors.length];
    const tmpl = eventTemplates[i % eventTemplates.length];
    const minutesAgo = i * 3;
    const totalMinutes = baseHour * 60 + baseMinute - minutesAgo;
    const hour = Math.floor(((totalMinutes % (24 * 60)) + 24 * 60) / 60) % 24;
    const minute = ((totalMinutes % 60) + 60) % 60;
    const time = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:${String((i * 7) % 60).padStart(2, "0")}`;
    return {
      id: i + 1,
      timestamp: `Nov 14, 2024 ${time} PHT`,
      actor,
      ...tmpl,
    };
  });
}

const auditLogs = buildAuditLogs(342);

// ---------------------------------------------------------------------------
// Small local sub-components
// ---------------------------------------------------------------------------

function StatCard({ icon: Icon, iconColor, label, value, note, noteColor }) {
  return (
    <div className="rounded-2xl border border-[#E5EEF9] bg-white p-4 shadow-sm">
      <div className="mb-1 flex items-center justify-between">
        <p className="text-sm text-slate-500">{label}</p>
        <Icon size={18} style={{ color: iconColor }} />
      </div>
      <p className="text-2xl font-bold text-[#0B1830]">{value}</p>
      <p className="mt-1 text-xs" style={{ color: noteColor ?? "#94A3B8" }}>{note}</p>
    </div>
  );
}

function FilterSelect({ placeholder, options }) {
  return (
    <div className="relative">
      <select className="appearance-none rounded-lg border border-[#E5EEF9] bg-white py-2.5 pl-3 pr-9 text-sm font-medium text-slate-600 outline-none focus:border-[#2F6FD9]">
        <option>{placeholder}</option>
        {options.map((opt) => (
          <option key={opt}>{opt}</option>
        ))}
      </select>
      <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
    </div>
  );
}

// Standard ellipsis pagination (first, current ±1, last) — this table has
// genuinely many pages (57), unlike the smaller flat-window pagination used
// on AI Classification Logs / Announcements.
function paginationItems(current, total) {
  const items = [];
  const add = (n) => items.push(n);
  const addEllipsis = () => items.push("...");

  add(1);
  if (current > 3) addEllipsis();
  for (let n = Math.max(2, current - 1); n <= Math.min(total - 1, current + 1); n++) add(n);
  if (current < total - 2) addEllipsis();
  if (total > 1) add(total);
  return items;
}

function AuditTable({ logs, page, onPageChange }) {
  const totalPages = Math.max(1, Math.ceil(logs.length / PAGE_SIZE));
  const start = (page - 1) * PAGE_SIZE;
  const visible = logs.slice(start, start + PAGE_SIZE);
  const rangeEnd = Math.min(start + PAGE_SIZE, logs.length);
  const pages = paginationItems(page, totalPages);

  return (
    <div className="overflow-hidden rounded-2xl border border-[#E5EEF9] bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1000px] text-left text-sm">
          <thead>
            <tr className="border-b border-[#E5EEF9] bg-[#F8FAFC]">
              {["Timestamp", "User / Actor", "Action", "Module", "Description"].map((col) => (
                <th key={col} className="whitespace-nowrap px-5 py-3 text-xs font-bold uppercase tracking-wide text-slate-400">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F1F5F9]">
            {visible.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-sm text-slate-500">
                  No audit log entries match your filters.
                </td>
              </tr>
            )}
            {visible.map((log) => (
              <tr key={log.id} className="hover:bg-slate-50">
                <td className="whitespace-nowrap px-5 py-3 text-xs text-slate-500">{log.timestamp}</td>
                <td className="whitespace-nowrap px-5 py-3">
                  <div className="flex items-center gap-2.5">
                    <span
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                      style={{ backgroundColor: log.actor.color }}
                    >
                      {log.actor.initials}
                    </span>
                    <span>
                      <p className="text-sm font-semibold text-[#0B1830]">{log.actor.name}</p>
                      <p className="text-xs text-slate-400">{log.actor.role}</p>
                    </span>
                  </div>
                </td>
                <td className="whitespace-nowrap px-5 py-3">
                  <span className="inline-flex w-fit items-center rounded-md px-2.5 py-1 text-xs font-semibold" style={{ backgroundColor: log.bg, color: log.color }}>
                    {log.action}
                  </span>
                </td>
                <td className="whitespace-nowrap px-5 py-3">
                  <span className="inline-flex w-fit items-center rounded-md bg-[#F1F5F9] px-2.5 py-1 text-xs font-semibold text-slate-600">
                    {log.module}
                  </span>
                </td>
                <td className="max-w-[280px] px-5 py-3 text-xs text-slate-500">
                  <span className="line-clamp-1">{log.description}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#E5EEF9] px-5 py-3">
        <p className="text-sm text-slate-500">
          Showing {logs.length === 0 ? 0 : start + 1} - {rangeEnd} of {logs.length} log events recorded today
        </p>
        <div className="flex items-center gap-1.5">
          <button type="button" onClick={() => onPageChange(Math.max(1, page - 1))} disabled={page === 1} className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-400 transition-colors hover:bg-slate-100 disabled:opacity-40">
            Previous
          </button>
          {pages.map((p, idx) =>
            p === "..." ? (
              <span key={`ellipsis-${idx}`} className="px-1.5 text-sm text-slate-400">…</span>
            ) : (
              <button
                key={p}
                type="button"
                onClick={() => onPageChange(p)}
                className={["flex h-8 w-8 items-center justify-center rounded-lg text-sm font-semibold transition-colors", p === page ? "bg-[#0B1830] text-white" : "text-slate-500 hover:bg-slate-100"].join(" ")}
              >
                {p}
              </button>
            )
          )}
          <button type="button" onClick={() => onPageChange(Math.min(totalPages, page + 1))} disabled={page === totalPages} className="rounded-lg px-3 py-1.5 text-sm font-semibold text-[#0B1830] transition-colors hover:bg-slate-100 disabled:opacity-40">
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function AdminAuditLogsPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const filteredLogs = useMemo(() => {
    if (!search) return auditLogs;
    const q = search.toLowerCase();
    return auditLogs.filter((log) =>
      `${log.actor.name} ${log.action} ${log.module} ${log.description}`.toLowerCase().includes(q)
    );
  }, [search]);

  const handleLogout = () => {
    // TODO: wire up to LogoutConfirmModal.jsx.
    console.log("logout clicked");
  };

  return (
    <div className="flex min-h-screen bg-[#EAF2FB]">
      <AdminSidebar onLogout={handleLogout} />

      <div className="flex min-w-0 flex-1 flex-col">
        <AdminHeader
          title="Audit Logs"
          subtitle="Track important system and administrative activities across North Caloocan DRRMO and Barangay Command Rails."
        />

        <main className="flex-1 space-y-5 p-6">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            <StatCard icon={TrendingUp} iconColor="#2F6FD9" label="Today's Activities" value="342 events" note="↗ +18% spike during morning triage" noteColor="#16A34A" />
            <StatCard icon={ShieldCheck} iconColor="#0B1830" label="This Week" value="2,894 events" note="🔒 99.98% verified integrity hash" />
            <StatCard icon={ShieldAlert} iconColor="#E11D2E" label="Administrative Actions" value="87 changes" note="Privilege updates, AI threshold modifications, manual overrides" />
          </div>

          {/* Filter row deliberately matches the plain style used on every
              other admin page (search + "All X" selects) — the mockup's
              dark-card wrapper and "Label:" style were one-off
              inconsistencies, standardized here. */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative min-w-[300px] flex-1">
              <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder="Search audit logs by keyword, user email, IP address, record ID..."
                className="w-full rounded-lg border border-[#E5EEF9] bg-white py-2.5 pl-9 pr-3 text-sm text-slate-700 outline-none focus:border-[#2F6FD9]"
              />
            </div>
            {/* TODO: wire to a real date range picker */}
            <button type="button" className="flex items-center gap-2 rounded-lg border border-[#E5EEF9] bg-white px-3 py-2.5 text-sm font-medium text-slate-600 hover:border-slate-300">
              <Calendar size={14} className="text-slate-400" />
              Last 7 Days (Nov 8, 2024 - Nov 14, 2024)
            </button>
          </div>

          <div className="flex flex-wrap gap-3">
            {/* TODO: wire these to actually filter the table */}
            <FilterSelect placeholder="All Users" options={actors.map((a) => a.name)} />
            <FilterSelect placeholder="All Actions" options={[...new Set(eventTemplates.map((t) => t.action))]} />
            <FilterSelect placeholder="All Modules" options={[...new Set(eventTemplates.map((t) => t.module))]} />
            <FilterSelect placeholder="All Statuses" options={["Success", "Flagged", "Reversed"]} />
          </div>

          <AuditTable logs={filteredLogs} page={page} onPageChange={setPage} />
        </main>
      </div>
    </div>
  );
}
