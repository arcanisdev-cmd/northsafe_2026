import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, MapPin, LogOut } from "lucide-react";
import { staffOfficer } from "../components/data/MockDashboardData";
import LogoutConfirmModal from "../components/LogoutConfirmModal";

export default function StaffHeader({ onSearch }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [logoutOpen, setLogoutOpen] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch?.(query.trim());
  };

  // Swap for a real sign-out call (clear token) when Laravel auth is wired
  const handleConfirmLogout = () => {
    setLogoutOpen(false);
    navigate("/signin");
  };

  return (
    <>
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

        {/* RIGHT: SCOPE + OFFICER + LOGOUT */}
        <div className="ml-auto flex shrink-0 items-center gap-4">
          {/* SCOPE (read-only: staff are assigned to one barangay) */}
          <div className="flex items-center gap-2 rounded-full border border-[#E3E8F4] bg-[#F2F4FB] px-3 py-1.5 text-xs font-semibold text-[#1B2A8E]">
            <MapPin size={13} strokeWidth={2.2} />
            <span className="whitespace-nowrap">{staffOfficer.assignedBarangays[0]}</span>
          </div>

          <span className="hidden h-8 w-px bg-[#E3E8F4] md:block" />

          {/* OFFICER */}
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
              <p className="truncate text-xs text-slate-500">Barangay Staff</p>
            </div>
          </div>

          {/* LOG OUT */}
          <button
            type="button"
            onClick={() => setLogoutOpen(true)}
            aria-label="Log out"
            title="Log out"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-100 hover:text-[#1B2A8E]"
          >
            <LogOut size={19} strokeWidth={1.9} />
          </button>
        </div>
      </header>

      <LogoutConfirmModal
        isOpen={logoutOpen}
        onClose={() => setLogoutOpen(false)}
        onConfirm={handleConfirmLogout}
      />
    </>
  );
}