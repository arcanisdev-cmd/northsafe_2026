import { useEffect, useState } from "react";
import { Clock, Bell } from "lucide-react";
import { adminOfficer } from "./AdminSidebar";

function useNowInManila() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  return now.toLocaleTimeString("en-PH", {
    timeZone: "Asia/Manila",
    hour12: false,
  });
}

export default function AdminHeader({
  title = "Admin Dashboard",
  subtitle = "Manage and monitor all hazard reports across North Caloocan.",
  hasUnreadNotifications = true,
  onBellClick,
}) {
  const time = useNowInManila();

  return (
    <header className="flex items-center justify-between border-b border-[#E5EEF9] bg-white px-8 py-5">
      <div>
        <h1 className="text-2xl font-bold text-[#0B1830]">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 rounded-full border border-[#E5EEF9] bg-[#F5F9FE] px-3 py-1.5 text-sm text-slate-600">
          <Clock size={14} />
          <span>{time} PHT</span>
        </div>

        <button
          type="button"
          onClick={onBellClick}
          className="relative flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-100"
        >
          <Bell size={18} />
          {hasUnreadNotifications && (
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" />
          )}
        </button>

        <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-[#0B1830] text-sm font-semibold text-white">
          {adminOfficer.avatarUrl ? (
            <img
              src={adminOfficer.avatarUrl}
              alt={adminOfficer.name}
              className="h-full w-full object-cover"
            />
          ) : (
            adminOfficer.name.charAt(0)
          )}
        </div>
      </div>
    </header>
  );
}
