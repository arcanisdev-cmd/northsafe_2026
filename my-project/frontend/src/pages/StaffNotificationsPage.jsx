import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronDown,
  CheckCheck,
  Check,
  Bell,
  TriangleAlert,
  FilePlus2,
  ClipboardList,
  MapPin,
  Activity,
  MessageSquare,
  PhoneCall,
  ThumbsDown,
  ShieldAlert,
  Loader2,
  Info,
} from "lucide-react";
import StaffSidebar from "../layouts/StaffSidebar";
import StaffHeader from "../layouts/StaffHeader";
import { useStaffReports } from "../utils/StaffReportsContext.jsx";
import { useNow, timeAgo, formatDateTime } from "../utils/staffHelpers";

// ---------------------------------------------------------------
// CONSTANTS
// ---------------------------------------------------------------
const CARD = "rounded-2xl border border-[#E3E8F4] bg-white";
const PAGE_STEP = 8;

const INITIAL_FILTERS = { type: "All", read: "All", date: "any" };

const TYPES = {
  high_severity: { label: "High severity", icon: TriangleAlert, tint: "bg-red-50 text-red-600" },
  new_report: { label: "New report", icon: FilePlus2, tint: "bg-[#E8EBFA] text-[#1B2A8E]" },
  review: { label: "Needs review", icon: ClipboardList, tint: "bg-amber-50 text-amber-600" },
  field_check: { label: "Field check", icon: MapPin, tint: "bg-sky-50 text-sky-600" },
  status: { label: "Status update", icon: Activity, tint: "bg-violet-50 text-violet-600" },
  info: { label: "Info received", icon: MessageSquare, tint: "bg-emerald-50 text-emerald-600" },
  follow_up: { label: "Office follow-up", icon: PhoneCall, tint: "bg-indigo-50 text-indigo-600" },
  dispute: { label: "Community dispute", icon: ThumbsDown, tint: "bg-orange-50 text-orange-600" },
  admin: { label: "Sent to Admin", icon: ShieldAlert, tint: "bg-pink-50 text-pink-600" },
};

const TYPE_OPTIONS = [
  { value: "All", label: "All types" },
  ...Object.keys(TYPES).map((k) => ({ value: k, label: TYPES[k].label })),
];

const READ_OPTIONS = [
  { value: "All", label: "All" },
  { value: "unread", label: "Unread" },
  { value: "read", label: "Read" },
];

const DATE_OPTIONS = [
  { value: "any", label: "Any time" },
  { value: "60", label: "Last hour" },
  { value: "1440", label: "Last 24 hours" },
  { value: "10080", label: "Last 7 days" },
];

const SUMMARY = [
  { key: "unread", label: "Unread", hint: "Not opened yet", icon: Bell, tint: "bg-[#E8EBFA] text-[#1B2A8E]" },
  { key: "high_severity", label: "High Severity", hint: "Unread alerts", icon: TriangleAlert, tint: "bg-red-50 text-red-600" },
  { key: "review", label: "Needs Review", hint: "Unread alerts", icon: ClipboardList, tint: "bg-amber-50 text-amber-600" },
  { key: "dispute", label: "Community Disputes", hint: "Unread alerts", icon: ThumbsDown, tint: "bg-orange-50 text-orange-600" },
];

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

// ---------------------------------------------------------------
// PAGE
// ---------------------------------------------------------------
export default function StaffNotificationsPage() {
  const navigate = useNavigate();
  const now = useNow();
  const { notifications, markRead, markAllRead } = useStaffReports();

  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [search, setSearch] = useState("");
  const [visible, setVisible] = useState(PAGE_STEP);
  const [marking, setMarking] = useState(false);

  const setFilter = (key, value) => {
    setFilters((f) => ({ ...f, [key]: value }));
    setVisible(PAGE_STEP);
  };

  const clearAll = () => {
    setFilters(INITIAL_FILTERS);
    setSearch("");
    setVisible(PAGE_STEP);
  };

  // Fake async to mimic latency until the Laravel API is wired
  const handleMarkAll = () => {
    setMarking(true);
    setTimeout(() => {
      markAllRead();
      setMarking(false);
    }, 500);
  };

  const open = (n) => {
    markRead(n.id);
    navigate(n.to);
  };

  // ---- derive: sort -> filter -> slice ----
  const sorted = [...notifications].sort((a, b) => new Date(b.at) - new Date(a.at));
  const unreadCount = notifications.filter((n) => !n.read).length;
  const unreadOf = (type) => notifications.filter((n) => !n.read && n.type === type).length;
  const summaryValue = (key) => (key === "unread" ? unreadCount : unreadOf(key));

  const q = search.toLowerCase();
  const filtered = sorted.filter((n) => {
    if (filters.type !== "All" && n.type !== filters.type) return false;
    if (filters.read === "unread" && n.read) return false;
    if (filters.read === "read" && !n.read) return false;
    if (filters.date !== "any" && (now - new Date(n.at)) / 60000 > Number(filters.date)) return false;
    if (q) {
      const haystack = [n.title, n.body, n.reportId].join(" ").toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });
  const shown = filtered.slice(0, visible);

  return (
    <div className="flex min-h-screen bg-[#F2F4FB]">
      <StaffSidebar onLogout={() => navigate("/signin")} />

      <div className="min-w-0 flex-1">
        <StaffHeader
          onSearch={(value) => {
            setSearch(value);
            setVisible(PAGE_STEP);
          }}
        />

        <main className="space-y-6 p-8">
          {/* TITLE ROW */}
          <section className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-[#0F1B4D]">Notifications</h1>
              <p className="mt-1.5 max-w-xl text-sm text-slate-500">
                Alerts for Barangay 171 (Bagumbong): new reports, reports that need review,
                field checks, office follow-ups and community disputes.
              </p>
            </div>
            <button
              type="button"
              onClick={handleMarkAll}
              disabled={unreadCount === 0 || marking}
              className="flex items-center gap-2 rounded-xl border border-[#E3E8F4] bg-white px-4 py-2.5 text-sm font-semibold text-[#1B2A8E] transition-colors hover:bg-slate-50 disabled:opacity-50"
            >
              {marking ? <Loader2 size={15} className="animate-spin" /> : <CheckCheck size={15} strokeWidth={2.2} />}
              <span>Mark all as read</span>
            </button>
          </section>

          {/* SUMMARY */}
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {SUMMARY.map(({ key, label, hint, icon: Icon, tint }) => (
              <div key={key} className={CARD + " flex items-center gap-4 p-5"}>
                <span className={["flex h-12 w-12 shrink-0 items-center justify-center rounded-full", tint].join(" ")}>
                  <Icon size={22} strokeWidth={2} />
                </span>
                <div className="min-w-0">
                  <p className="text-sm text-slate-500">{label}</p>
                  <p className="text-3xl font-bold text-[#0F1B4D]">{summaryValue(key)}</p>
                  <p className="truncate text-xs text-slate-400">{hint}</p>
                </div>
              </div>
            ))}
          </section>

          {/* FILTERS */}
          <section className={CARD + " p-4"}>
            <div className="grid grid-cols-2 items-end gap-4 md:grid-cols-4">
              <FilterSelect label="Type" value={filters.type} onChange={(v) => setFilter("type", v)} options={TYPE_OPTIONS} />
              <FilterSelect label="Read status" value={filters.read} onChange={(v) => setFilter("read", v)} options={READ_OPTIONS} />
              <FilterSelect label="Date" value={filters.date} onChange={(v) => setFilter("date", v)} options={DATE_OPTIONS} />
              <button
                type="button"
                onClick={clearAll}
                className="rounded-xl border border-[#E3E8F4] bg-white px-3 py-2 text-sm font-semibold text-[#1B2A8E] transition-colors hover:bg-slate-50"
              >
                Clear filters
              </button>
            </div>
          </section>

          <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-sm">
            <p className="font-semibold text-[#0F1B4D]">
              {filtered.length + (filtered.length === 1 ? " notification" : " notifications")}
            </p>
            <p className="text-xs text-slate-500">Newest first. Your full history is kept here.</p>
          </div>

          {/* LIST */}
          <section className={CARD + " overflow-hidden"}>
            {shown.length === 0 && (
              <div className="px-5 py-10 text-center">
                <p className="text-sm text-slate-500">No notifications match your filters.</p>
                <button
                  type="button"
                  onClick={clearAll}
                  className="mt-2 text-sm font-semibold text-[#1B2A8E] hover:underline"
                >
                  Clear filters
                </button>
              </div>
            )}

            {shown.map((n, idx) => {
              const meta = TYPES[n.type] || TYPES.status;
              const Icon = meta.icon;
              return (
                <div
                  key={n.id}
                  className={[
                    "flex items-start gap-3 px-5 py-4",
                    idx > 0 ? "border-t border-[#E3E8F4]" : "",
                    n.read ? "bg-white" : "bg-[#F3F6FE]",
                  ].join(" ")}
                >
                  <span className={["mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full", meta.tint].join(" ")}>
                    <Icon size={18} strokeWidth={2} />
                  </span>

                  <button
                    type="button"
                    onClick={() => open(n)}
                    className="min-w-0 flex-1 text-left"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      {!n.read && <span className="h-2 w-2 shrink-0 rounded-full bg-[#1B2A8E]" />}
                      <p className={["text-sm text-[#0F1B4D]", n.read ? "font-medium" : "font-bold"].join(" ")}>
                        {n.title}
                      </p>
                      <span className="rounded-full border border-[#E3E8F4] bg-white px-2 py-0.5 text-[10px] font-medium text-slate-500">
                        {meta.label}
                      </span>
                    </div>
                    <p className="mt-1 text-sm leading-5 text-slate-600">{n.body}</p>
                    <p className="mt-1.5 text-xs text-slate-400">
                      <span className="font-semibold text-[#1B2A8E]">{n.reportId}</span>
                      {" · " + timeAgo(n.at, now) + " · " + formatDateTime(n.at)}
                    </p>
                  </button>

                  <div className="flex shrink-0 flex-col items-end gap-2">
                    <button
                      type="button"
                      onClick={() => open(n)}
                      className="rounded-lg bg-[#1B2A8E] px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[#16237A]"
                    >
                      Open
                    </button>
                    {!n.read && (
                      <button
                        type="button"
                        onClick={() => markRead(n.id)}
                        className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-[#1B2A8E]"
                      >
                        <Check size={12} strokeWidth={2.6} />
                        <span>Mark as read</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            {filtered.length > shown.length && (
              <div className="border-t border-[#E3E8F4] px-5 py-3 text-center">
                <button
                  type="button"
                  onClick={() => setVisible((v) => v + PAGE_STEP)}
                  className="text-sm font-semibold text-[#1B2A8E] hover:underline"
                >
                  {"Show more (" + (filtered.length - shown.length) + " older)"}
                </button>
              </div>
            )}
          </section>

          <div className="flex gap-2 rounded-xl border border-[#C9D3F5] bg-[#F3F6FE] p-3 text-xs leading-5 text-slate-600">
            <Info size={15} className="mt-0.5 shrink-0 text-[#1B2A8E]" />
            <p>
              AI severity and credibility are suggestions only. A recorded forwarding or office
              follow-up is your own record, not proof that the office has acted.
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}