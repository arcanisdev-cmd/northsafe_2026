import { useState } from "react";
import { Link } from "react-router-dom";
import { Search, Bell, MapPin } from "lucide-react";
import {
  staffOfficer,
  staffNavBadges,
} from "../components/data/MockDashboardData";

export default function StaffHeader({ onSearch }) {
  const [query, setQuery] = useState("");
  const unread = staffNavBadges.notifications;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch?.(query.trim());
  };

  return (
    <header className="sticky top-0 z-10 flex items-center gap-6 border-b border-[#E3E8F4] bg-white px-8 py-4">
      {/* SEARCH */}
      <form onSubmit={handleSubmit} className="relative min-w-0 max-w-xl flex-1">
        <Search
          size={16}
          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
        />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search report ID, hazard, location, or keyword..."
          className="w-full rounded-xl border border-[#E3E8F4] bg-white py-2.5 pl-10 pr-4 text-sm text-[#0F1B4D] placeholder:text-slate-400 focus:border-[#1B2A8E] focus:outline-none focus:ring-2 focus:ring-[#1B2A8E]/15"
        />
      </form>

      {/* SCOPE (read-only: staff are assigned to one barangay) */}
      <div className="flex items-center gap-3">
        <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
          Scope:
        </span>
        <div className="flex items-center gap-2 rounded-xl border border-[#E3E8F4] bg-[#F2F4FB] px-3.5 py-2 text-sm font-medium text-[#1B2A8E]">
          <MapPin size={14} strokeWidth={2} />
          <span className="whitespace-nowrap">
            {staffOfficer.assignedBarangays[0]}
          </span>
        </div>
      </div>

      {/* RIGHT: BELL + USER */}
      <div className="ml-auto flex items-center gap-4">
        <Link
          to="/staff/notifications"
          aria-label={`Notifications${unread ? `, ${unread} unread` : ""}`}
          className="relative flex h-10 w-10 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-100 hover:text-[#1B2A8E]"
        >
          <Bell size={20} strokeWidth={1.9} />
          {unread > 0 && (
            <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-orange-500 px-1 text-[10px] font-bold text-white">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </Link>

        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-[#1B2A8E] bg-white text-xs font-semibold text-[#1B2A8E]">
            {staffOfficer.avatarUrl ? (
              <img
                src={staffOfficer.avatarUrl}
                alt={staffOfficer.name}
                className="h-full w-full object-cover"
              />
            ) : (
              staffOfficer.initials
            )}
          </div>

          <div className="hidden min-w-0 md:block">
            <p className="truncate text-sm font-semibold text-[#0F1B4D]">
              {staffOfficer.name}
            </p>
            <p className="truncate text-xs text-slate-500">
              {staffOfficer.assignedBarangays[0]}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}