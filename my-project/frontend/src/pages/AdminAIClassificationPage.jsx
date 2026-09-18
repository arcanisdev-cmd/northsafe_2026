import { useMemo, useState } from "react";
import {
  Search,
  ChevronDown,
  Calendar,
  MapPin,
  Waves,
  Trash2,
  TreeDeciduous,
  Flame,
  Construction,
  Building2,
  Zap,
} from "lucide-react";
import AdminSidebar from "../layouts/AdminSidebar";
import AdminHeader from "../layouts/AdminHeader";
// hazardTypes / alertLevelOptions / barangayOptions stay imported straight
// from MockDashboardData.js — same genuine cross-app taxonomy reasoning as
// AdminHazardReportsPage.jsx. Everything else on this page is local-only.
import { hazardTypes, alertLevelOptions, barangayOptions } from "../components/data/MockDashboardData";

// ---------------------------------------------------------------------------
// Mock data — page-local.
// ---------------------------------------------------------------------------

const aiReviewStatuses = ["Pending Review", "Confirmed", "Overridden"];
const PAGE_SIZE = 7;
const COLUMNS = ["Title", "AI Classification", "Confidence Level", "Category", "Alert Level", "Barangay", "Date"];

const RAW_LABEL_BY_TYPE = {
  Flood: "flood",
  "Illegal Dumping": "illegal_dumping",
  "Fallen Tree": "fallen_tree",
  Fire: "fire",
  "Road Damage": "road_damage",
  "Building Damage": "N/A",
  "Power Line": "power_line",
};

const SAMPLE_TITLES = {
  Flood: "Flood in barangay 167",
  "Illegal Dumping": "Tambak na basura",
  "Fallen Tree": "May puno ng mangga natumba sa road",
  Fire: "May sunog po near Barangay 167",
  "Road Damage": "Potholes on main road",
  "Building Damage": "Gumuho po bahay sa bagong silang",
  "Power Line": "Maraming nakalaylay na wires sa kalsada",
};

const BARANGAY_AREA_NAMES = { 171: "Bagumbong", 176: "Bagong Silang", 167: "Llano", 177: "Camarin", 168: "Deparo" };
const HAZARD_ORDER = ["Flood", "Illegal Dumping", "Fallen Tree", "Fire", "Road Damage", "Building Damage", "Power Line"];
const ALERT_ORDER = ["red", "white", "blue"];
const BARANGAY_ORDER = [171, 176, 167, 177, 177, 177, 168];

const aiClassificationLogs = Array.from({ length: 48 }, (_, i) => {
  const hazardType = HAZARD_ORDER[i % HAZARD_ORDER.length];
  const barangay = BARANGAY_ORDER[i % BARANGAY_ORDER.length];
  const confidence = [96.4, 96.4, 96.4, 96.4, 70.5, 70.5, 96.4][i % 7];
  return {
    id: i + 1,
    title: SAMPLE_TITLES[hazardType],
    aiClassification: RAW_LABEL_BY_TYPE[hazardType],
    confidence,
    category: hazardType,
    alertLevel: ALERT_ORDER[i % ALERT_ORDER.length],
    barangay,
    areaName: BARANGAY_AREA_NAMES[barangay] ?? "",
    date: "Nov 14, 2024",
    time: "10:15 AM",
    reviewStatus: aiReviewStatuses[i % aiReviewStatuses.length],
  };
});

const CATEGORY_STYLES = {
  Flood: { icon: Waves, color: "#2F6FD9", bg: "#E1EEFC" },
  "Illegal Dumping": { icon: Trash2, color: "#334155", bg: "#F1F5F9" },
  "Fallen Tree": { icon: TreeDeciduous, color: "#16A34A", bg: "#E9F9EE" },
  Fire: { icon: Flame, color: "#E11D2E", bg: "#FBE4E4" },
  "Road Damage": { icon: Construction, color: "#F5872E", bg: "#FEF1E4" },
  "Building Damage": { icon: Building2, color: "#7C3AED", bg: "#EDE4FB" },
  "Power Line": { icon: Zap, color: "#B45309", bg: "#FDF3D9" },
};

// ---------------------------------------------------------------------------
// Small local sub-components
// ---------------------------------------------------------------------------

function CategoryBadge({ category }) {
  const cfg = CATEGORY_STYLES[category] ?? CATEGORY_STYLES.Flood;
  const Icon = cfg.icon;
  return (
    <span className="inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold" style={{ backgroundColor: cfg.bg, color: cfg.color }}>
      <Icon size={12} />
      {category}
    </span>
  );
}

function ConfidenceBadge({ value }) {
  const isHigh = value >= 90;
  return (
    <span className="inline-flex w-fit items-center rounded-md px-2.5 py-1 text-xs font-bold" style={{ backgroundColor: isHigh ? "#E9F9EE" : "#FBE4E4", color: isHigh ? "#16A34A" : "#E11D2E" }}>
      AI {value.toFixed(1)}%
    </span>
  );
}

function AlertLevelText({ level }) {
  if (level === "white") {
    return (
      <span className="inline-flex w-fit items-center rounded-md border border-[#D6C88A] bg-[#FBF7E6] px-2.5 py-1 text-xs font-bold text-[#8A7215]">
        WHITE
      </span>
    );
  }
  return (
    <span className="text-xs font-bold" style={{ color: level === "red" ? "#E11D2E" : "#2F6FD9" }}>
      {level.toUpperCase()}
    </span>
  );
}

function FilterSelect({ placeholder, value, onChange, options }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none rounded-lg border border-[#E5EEF9] bg-white py-2.5 pl-3 pr-9 text-sm font-medium text-slate-600 outline-none focus:border-[#2F6FD9]"
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt.value ?? opt} value={opt.value ?? opt}>{opt.label ?? opt}</option>
        ))}
      </select>
      <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
    </div>
  );
}

function FilterBar({ search, onSearchChange, status, onStatusChange, category, onCategoryChange, alertLevel, onAlertLevelChange, barangay, onBarangayChange, dateRangeLabel, onDateRangeClick }) {
  return (
    <div className="mb-4 flex flex-wrap gap-3">
      <div className="relative min-w-[260px] flex-1">
        <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search AI classifications by title, keyword, alert level..."
          className="w-full rounded-lg border border-[#E5EEF9] bg-white py-2.5 pl-9 pr-3 text-sm text-slate-700 outline-none focus:border-[#2F6FD9]"
        />
      </div>
      <FilterSelect placeholder="All Statuses" value={status} onChange={onStatusChange} options={aiReviewStatuses} />
      <FilterSelect placeholder="All Category" value={category} onChange={onCategoryChange} options={hazardTypes} />
      <FilterSelect placeholder="All Alert Levels" value={alertLevel} onChange={onAlertLevelChange} options={alertLevelOptions} />
      <FilterSelect placeholder="All Barangays" value={barangay} onChange={onBarangayChange} options={barangayOptions} />
      <button
        type="button"
        onClick={onDateRangeClick}
        className="flex items-center gap-2 rounded-lg border border-[#E5EEF9] bg-white px-3 py-2.5 text-sm font-medium text-slate-600 hover:border-slate-300"
      >
        <Calendar size={14} className="text-slate-400" />
        {dateRangeLabel}
      </button>
    </div>
  );
}

function LogsTable({ logs, page, onPageChange }) {
  const totalPages = Math.max(1, Math.ceil(logs.length / PAGE_SIZE));
  const start = (page - 1) * PAGE_SIZE;
  const visible = logs.slice(start, start + PAGE_SIZE);
  const rangeEnd = Math.min(start + PAGE_SIZE, logs.length);

  return (
    <div className="overflow-hidden rounded-2xl border border-[#E5EEF9] bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead>
            <tr className="bg-[#0B1830] text-white">
              {COLUMNS.map((col) => (
                <th key={col} className="whitespace-nowrap px-5 py-3 text-xs font-bold uppercase tracking-wide">{col}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F1F5F9]">
            {visible.length === 0 && (
              <tr>
                <td colSpan={COLUMNS.length} className="px-5 py-8 text-center text-sm text-slate-500">
                  No AI classification logs match your filters.
                </td>
              </tr>
            )}
            {visible.map((log) => (
              <tr key={log.id} className="hover:bg-slate-50">
                <td className="whitespace-nowrap px-5 py-3 font-semibold text-[#0B1830]">{log.title}</td>
                <td className="whitespace-nowrap px-5 py-3 text-slate-500">{log.aiClassification}</td>
                <td className="whitespace-nowrap px-5 py-3"><ConfidenceBadge value={log.confidence} /></td>
                <td className="whitespace-nowrap px-5 py-3"><CategoryBadge category={log.category} /></td>
                <td className="whitespace-nowrap px-5 py-3"><AlertLevelText level={log.alertLevel} /></td>
                <td className="whitespace-nowrap px-5 py-3 text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <MapPin size={13} className="shrink-0 text-slate-400" />
                    <span>Brgy. {log.barangay}<br /><span className="text-xs text-slate-400">({log.areaName})</span></span>
                  </span>
                </td>
                <td className="whitespace-nowrap px-5 py-3 text-slate-500">
                  {log.date}<br /><span className="text-xs text-slate-400">{log.time}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#E5EEF9] px-5 py-3">
        <p className="text-sm text-slate-500">
          Showing {logs.length === 0 ? 0 : start + 1} to {rangeEnd} of {logs.length} AI classification logs
        </p>
        <div className="flex items-center gap-1.5">
          <button type="button" onClick={() => onPageChange(Math.max(1, page - 1))} disabled={page === 1} className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-400 transition-colors hover:bg-slate-100 disabled:opacity-40">
            Previous
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
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

export default function AdminAIClassificationPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [category, setCategory] = useState("");
  const [alertLevel, setAlertLevel] = useState("");
  const [barangay, setBarangay] = useState("");
  const [page, setPage] = useState(1);

  const filteredLogs = useMemo(() => {
    return aiClassificationLogs.filter((log) => {
      if (search && !`${log.title} ${log.aiClassification} ${log.alertLevel}`.toLowerCase().includes(search.toLowerCase())) return false;
      if (status && log.reviewStatus !== status) return false;
      if (category && log.category !== category) return false;
      if (alertLevel && log.alertLevel !== alertLevel) return false;
      if (barangay && String(log.barangay) !== String(barangay)) return false;
      return true;
    });
  }, [search, status, category, alertLevel, barangay]);

  const handleLogout = () => {
    // TODO: wire up to LogoutConfirmModal.jsx.
    console.log("logout clicked");
  };

  const handleDateRangeClick = () => {
    // TODO: open a real date range picker; currently a static display.
    console.log("date range clicked");
  };

  const withPageReset = (setter) => (value) => { setter(value); setPage(1); };

  return (
    <div className="flex min-h-screen bg-[#EAF2FB]">
      <AdminSidebar onLogout={handleLogout} />

      <div className="flex min-w-0 flex-1 flex-col">
        <AdminHeader
          title="AI Classification Logs"
          subtitle="Review AI-generated hazard categories and severity confidence for submitted reports"
        />

        <main className="flex-1 p-6">
          <FilterBar
            search={search}
            onSearchChange={withPageReset(setSearch)}
            status={status}
            onStatusChange={withPageReset(setStatus)}
            category={category}
            onCategoryChange={withPageReset(setCategory)}
            alertLevel={alertLevel}
            onAlertLevelChange={withPageReset(setAlertLevel)}
            barangay={barangay}
            onBarangayChange={withPageReset(setBarangay)}
            dateRangeLabel="Nov 1, 2024 - Nov 30, 2024"
            onDateRangeClick={handleDateRangeClick}
          />
          <LogsTable logs={filteredLogs} page={page} onPageChange={setPage} />
        </main>
      </div>
    </div>
  );
}
