import { useMemo, useState } from "react";
import {
  Search,
  ChevronDown,
  Calendar,
  Plus,
  Pencil,
  Radio,
  MoreVertical,
  MapPin,
  Globe2,
  CloudRain,
  Wrench,
  ShieldCheck,
  ShieldAlert,
  Megaphone,
  CheckCircle2,
  CalendarClock,
  FileEdit,
} from "lucide-react";
import AdminSidebar from "../layouts/AdminSidebar";
import AdminHeader from "../layouts/AdminHeader";

// ---------------------------------------------------------------------------
// Mock data — page-local.
// ---------------------------------------------------------------------------

const PAGE_SIZE = 5;

const announcementTypes = ["Weather Advisory", "Infrastructure", "Disaster Prep", "Public Safety"];
const priorities = ["Urgent", "Important", "Normal"];
const statuses = ["Published", "Scheduled", "Draft"];

const TYPE_STYLES = {
  "Weather Advisory": { icon: CloudRain, color: "#2F6FD9", bg: "#E1EEFC" },
  Infrastructure: { icon: Wrench, color: "#475569", bg: "#F1F5F9" },
  "Disaster Prep": { icon: ShieldCheck, color: "#16A34A", bg: "#E9F9EE" },
  "Public Safety": { icon: ShieldAlert, color: "#DB2777", bg: "#FCE7F3" },
};

const PRIORITY_COLORS = {
  Urgent: "#E11D2E",
  Important: "#F5872E",
  Normal: "#2F6FD9",
};

const STATUS_STYLES = {
  Published: { color: "#16A34A", bg: "#E9F9EE" },
  Scheduled: { color: "#B45309", bg: "#FDF3D9" },
  Draft: { color: "#64748B", bg: "#F1F5F9" },
};

// A handful of realistic templates, cycled to fill out 48 mock rows.
const templates = [
  {
    title: "Flash Flood Advisory: Tullahan River Basin",
    summary: "Warning for...",
    type: "Weather Advisory",
    priority: "Urgent",
    target: { text: "Brgy. 165, 166, 171 (Bagumbong)", icon: "pin" },
    author: "Engr. R. Santos",
    role: "CDRRMO Ops",
    publishedText: "Nov 14, 2024 10:15 AM",
    status: "Published",
  },
  {
    title: "Scheduled Drainage Cleansing & Road Maintenance",
    summary: "Bagong Silang...",
    type: "Infrastructure",
    priority: "Important",
    target: { text: "Brgy. 176 (Bagong Silang)", icon: "pin" },
    author: "Admin M. Del Rosario",
    role: "Engineering DRRM",
    publishedText: "Scheduled: Nov 16, 06:00 AM",
    status: "Scheduled",
  },
  {
    title: "Typhoon Preparation Guidelines & Designated Evacuation Centers",
    summary: "Official list of...",
    type: "Disaster Prep",
    priority: "Normal",
    target: { text: "All 18 North Caloocan Barangays", icon: "globe" },
    author: "CDRRMO Public Affairs",
    role: "PIO Unit",
    publishedText: "Nov 12, 2024 08:30 AM",
    status: "Published",
  },
  {
    title: "AI Hazard Alert: Fallen High-Tension Cable",
    summary: "Meralco and...",
    type: "Public Safety",
    priority: "Urgent",
    target: { text: "Brgy. 177 & 178 (Camarin)", icon: "pin" },
    author: "AI Auto-Triage Dispatch",
    role: "Supervised by Ops",
    publishedText: "Nov 14, 2024 01:10 PM",
    status: "Published",
    aiConfidence: 96.4,
  },
  {
    title: "Quarterly Simultaneous Earthquake Drill (NSED) Guidelines",
    summary: "Duck, Cover, and...",
    type: "Disaster Prep",
    priority: "Normal",
    target: { text: "Brgy. 174, 175, 179", icon: "pin" },
    author: "Officer K. Bautista",
    role: "Training Division",
    publishedText: "Draft saved 2h ago",
    status: "Draft",
  },
  {
    title: "Water Interruption Notice: Camarin Zone 3",
    summary: "Maynilad scheduled...",
    type: "Infrastructure",
    priority: "Important",
    target: { text: "Brgy. 178, 179 (Camarin)", icon: "pin" },
    author: "Admin M. Del Rosario",
    role: "Engineering DRRM",
    publishedText: "Nov 13, 2024 07:00 AM",
    status: "Published",
  },
  {
    title: "AI Hazard Alert: Rising Creek Water Level",
    summary: "Sensor threshold...",
    type: "Weather Advisory",
    priority: "Urgent",
    target: { text: "Brgy. 171 (Bagumbong)", icon: "pin" },
    author: "AI Auto-Triage Dispatch",
    role: "Supervised by Ops",
    publishedText: "Nov 15, 2024 03:40 AM",
    status: "Published",
    aiConfidence: 91.2,
  },
  {
    title: "Community Fire Safety Seminar",
    summary: "Free seminar for...",
    type: "Public Safety",
    priority: "Normal",
    target: { text: "Brgy. 167, 168 (Llano)", icon: "pin" },
    author: "BFP Caloocan North",
    role: "Fire Prevention Unit",
    publishedText: "Scheduled: Nov 20, 09:00 AM",
    status: "Scheduled",
  },
];

const announcements = Array.from({ length: 48 }, (_, i) => ({
  id: i + 1,
  ...templates[i % templates.length],
}));

// ---------------------------------------------------------------------------
// Small local sub-components
// ---------------------------------------------------------------------------

function StatCard({ icon: Icon, iconColor, iconBg, label, value, footer }) {
  return (
    <div className="rounded-2xl border border-[#E5EEF9] bg-white p-4 shadow-sm">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-sm text-slate-500">{label}</p>
        <span
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
          style={{ backgroundColor: iconBg, color: iconColor }}
        >
          <Icon size={16} />
        </span>
      </div>
      <div className="flex items-center gap-2">
        <p className="text-3xl font-bold text-[#0B1830]">{value}</p>
        {footer}
      </div>
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

function FilterBar({ search, onSearchChange, onCreate }) {
  return (
    <div className="mb-4 flex flex-wrap items-center gap-3">
      <div className="relative min-w-[260px] flex-1">
        <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search announcements by title, keyword, or author..."
          className="w-full rounded-lg border border-[#E5EEF9] bg-white py-2.5 pl-9 pr-3 text-sm text-slate-700 outline-none focus:border-[#2F6FD9]"
        />
      </div>
      <FilterSelect placeholder="All Statuses" options={statuses} />
      <FilterSelect placeholder="All Types" options={announcementTypes} />
      <FilterSelect placeholder="All Priorities" options={priorities} />
      {/* TODO: wire to a real date range picker */}
      <button type="button" className="flex items-center gap-2 rounded-lg border border-[#E5EEF9] bg-white px-3 py-2.5 text-sm font-medium text-slate-600 hover:border-slate-300">
        <Calendar size={14} className="text-slate-400" />
        Nov 1, 2024 - Nov 30, 2024
      </button>
      <button
        type="button"
        onClick={onCreate}
        className="flex items-center gap-2 rounded-lg bg-[#0B1830] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#16264A]"
      >
        <Plus size={15} />
        Create Announcement
      </button>
    </div>
  );
}

function TypeBadge({ type, aiConfidence }) {
  const cfg = TYPE_STYLES[type] ?? TYPE_STYLES.Infrastructure;
  const Icon = cfg.icon;
  return (
    <div className="flex flex-col items-start gap-1">
      {aiConfidence != null && (
        <span className="rounded-md bg-[#EDE4FB] px-2 py-0.5 text-[10px] font-bold text-[#7C3AED]">
          AI {aiConfidence.toFixed(1)}%
        </span>
      )}
      <span
        className="inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold"
        style={{ backgroundColor: cfg.bg, color: cfg.color }}
      >
        <Icon size={12} />
        {type}
      </span>
    </div>
  );
}

function PriorityText({ priority }) {
  return (
    <span className="text-xs font-bold uppercase" style={{ color: PRIORITY_COLORS[priority] }}>
      {priority}
    </span>
  );
}

function StatusBadge({ status }) {
  const cfg = STATUS_STYLES[status] ?? STATUS_STYLES.Draft;
  return (
    <span
      className="inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold"
      style={{ backgroundColor: cfg.bg, color: cfg.color }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: cfg.color }} />
      {status}
    </span>
  );
}

function AnnouncementsTable({ rows, page, onPageChange, onEdit, onBroadcast, onMore }) {
  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const start = (page - 1) * PAGE_SIZE;
  const visible = rows.slice(start, start + PAGE_SIZE);
  const rangeEnd = Math.min(start + PAGE_SIZE, rows.length);

  // Windowed page numbers (matches the mockup showing "1 2 3 4 Next" rather
  // than every page at once).
  const windowStart = Math.max(1, Math.min(page - 1, totalPages - 3));
  const pageWindow = Array.from({ length: Math.min(4, totalPages) }, (_, i) => windowStart + i);

  return (
    <div className="overflow-hidden rounded-2xl border border-[#E5EEF9] bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1100px] text-left text-sm">
          <thead>
            <tr className="border-b border-[#E5EEF9] bg-[#F8FAFC]">
              {["Title & Summary", "Type", "Priority", "Target Audience & Barangays", "Author & Role", "Published / Scheduled", "Status", "Actions"].map((col) => (
                <th key={col} className="whitespace-nowrap px-5 py-3 text-xs font-bold uppercase tracking-wide text-slate-400">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F1F5F9]">
            {visible.length === 0 && (
              <tr>
                <td colSpan={8} className="px-5 py-8 text-center text-sm text-slate-500">
                  No announcements match your filters.
                </td>
              </tr>
            )}
            {visible.map((a) => (
              <tr key={a.id} className="align-top hover:bg-slate-50">
                <td className="px-5 py-4">
                  <p className="max-w-[220px] font-bold text-[#0B1830]">{a.title}</p>
                  <p className="text-xs text-slate-400">{a.summary}</p>
                </td>
                <td className="px-5 py-4"><TypeBadge type={a.type} aiConfidence={a.aiConfidence} /></td>
                <td className="px-5 py-4"><PriorityText priority={a.priority} /></td>
                <td className="px-5 py-4">
                  <p className="flex items-start gap-1.5 text-xs text-slate-600">
                    {a.target.icon === "globe" ? (
                      <Globe2 size={13} className="mt-0.5 shrink-0 text-slate-400" />
                    ) : (
                      <MapPin size={13} className="mt-0.5 shrink-0 text-slate-400" />
                    )}
                    <span className="max-w-[150px]">{a.target.text}</span>
                  </p>
                </td>
                <td className="px-5 py-4">
                  <p className="text-sm font-semibold text-[#0B1830]">{a.author}</p>
                  <p className="text-xs text-slate-400">{a.role}</p>
                </td>
                <td className="whitespace-nowrap px-5 py-4 text-xs text-slate-500">{a.publishedText}</td>
                <td className="px-5 py-4"><StatusBadge status={a.status} /></td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2 text-slate-400">
                    <button type="button" onClick={() => onEdit(a)} className="rounded p-1 hover:bg-slate-100 hover:text-slate-600" title="Edit">
                      <Pencil size={14} />
                    </button>
                    <button type="button" onClick={() => onBroadcast(a)} className="rounded p-1 hover:bg-slate-100 hover:text-slate-600" title="Broadcast">
                      <Radio size={14} />
                    </button>
                    <button type="button" onClick={() => onMore(a)} className="rounded p-1 hover:bg-slate-100 hover:text-slate-600" title="More">
                      <MoreVertical size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#E5EEF9] px-5 py-3">
        <p className="text-sm text-slate-500">
          Showing {rows.length === 0 ? 0 : start + 1} to {rangeEnd} of {rows.length} announcements
        </p>
        <div className="flex items-center gap-1.5">
          <button type="button" onClick={() => onPageChange(Math.max(1, page - 1))} disabled={page === 1} className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-400 transition-colors hover:bg-slate-100 disabled:opacity-40">
            Previous
          </button>
          {pageWindow.map((n) => (
            <button key={n} type="button" onClick={() => onPageChange(n)} className={["flex h-8 w-8 items-center justify-center rounded-lg text-sm font-semibold transition-colors", n === page ? "bg-[#0B1830] text-white" : "text-slate-500 hover:bg-slate-100"].join(" ")}>
              {n}
            </button>
          ))}
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

export default function AdminAnnouncementsPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    if (!search) return announcements;
    const q = search.toLowerCase();
    return announcements.filter((a) => `${a.title} ${a.author}`.toLowerCase().includes(q));
  }, [search]);

  const handleLogout = () => {
    // TODO: wire up to LogoutConfirmModal.jsx.
    console.log("logout clicked");
  };

  const handleCreate = () => {
    // TODO: open a create-announcement form/modal.
    console.log("create announcement clicked");
  };

  const handleEdit = (a) => console.log("edit", a.id); // TODO
  const handleBroadcast = (a) => console.log("broadcast", a.id); // TODO
  const handleMore = (a) => console.log("more actions", a.id); // TODO

  return (
    <div className="flex min-h-screen bg-[#EAF2FB]">
      <AdminSidebar onLogout={handleLogout} />

      <div className="flex min-w-0 flex-1 flex-col">
        <AdminHeader
          title="Announcements"
          subtitle="Manage public announcements, disaster alerts, and community safety broadcast feeds across North Caloocan."
        />

        <main className="flex-1 space-y-5 p-6">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              icon={Megaphone}
              iconColor="#2F6FD9"
              iconBg="#E1EEFC"
              label="Total Announcements"
              value="48"
              footer={<span className="rounded bg-[#E9F9EE] px-1.5 py-0.5 text-xs font-semibold text-[#16A34A]">+4 this month</span>}
            />
            <StatCard
              icon={CheckCircle2}
              iconColor="#16A34A"
              iconBg="#E9F9EE"
              label="Published"
              value="32"
              footer={<span className="text-xs text-slate-400">Live to citizen app</span>}
            />
            <StatCard
              icon={CalendarClock}
              iconColor="#B45309"
              iconBg="#FDF3D9"
              label="Scheduled"
              value="7"
              footer={<span className="text-xs text-slate-400">Automated broadcast</span>}
            />
            <StatCard
              icon={FileEdit}
              iconColor="#64748B"
              iconBg="#F1F5F9"
              label="Drafts"
              value="9"
              footer={<span className="text-xs text-slate-400">Under CDRRMO review</span>}
            />
          </div>

          <FilterBar search={search} onSearchChange={(v) => { setSearch(v); setPage(1); }} onCreate={handleCreate} />

          <AnnouncementsTable
            rows={filtered}
            page={page}
            onPageChange={setPage}
            onEdit={handleEdit}
            onBroadcast={handleBroadcast}
            onMore={handleMore}
          />
        </main>
      </div>
    </div>
  );
}
