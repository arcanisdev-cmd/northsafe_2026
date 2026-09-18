import { NavLink } from "react-router-dom";
import {
  LayoutGrid,
  TriangleAlert,
  Cpu,
  Map as MapIcon,
  BarChart2,
  Megaphone,
  Users,
  History,
  LogOut,
} from "lucide-react";
import logo from "../assets/logo.png";

// Shared across every admin page via AdminHeader
export const adminOfficer = {
  name: "Admin Officer DRRMO",
  id: "NCO-8812",
  avatarUrl: null,
};

const NAV_ITEMS = [
  {
    label: "Dashboard",
    to: "/admin",
    icon: LayoutGrid,
    end: true,
  },
  {
    label: "Hazard Reports",
    to: "/admin/hazard-reports",
    icon: TriangleAlert,
  },
  {
    label: "AI Classification Logs",
    to: "/admin/ai-logs",
    icon: Cpu,
  },
  {
    label: "Map View",
    to: "/admin/map",
    icon: MapIcon,
  },
  {
    label: "Analytics",
    to: "/admin/analytics",
    icon: BarChart2,
  },
  {
    label: "Announcements",
    to: "/admin/announcements",
    icon: Megaphone,
  },
  {
    label: "User Management",
    to: "/admin/users",
    icon: Users,
  },
  {
    label: "Audit Logs",
    to: "/admin/audit-logs",
    icon: History,
  },
];

export default function AdminSidebar({ onLogout }) {
  return (
    <aside className="flex min-h-screen w-64 shrink-0 flex-col bg-[#0B1830] text-white">
      {/* =========================================================
          BRAND
      ========================================================= */}
      <div className="px-5 pt-5 pb-4">
        <NavLink
          to="/admin"
          className="relative block h-[72px] w-[220px]"
          aria-label="NorthSafe Admin Dashboard"
        >
          {/* Original logo */}
          <img
            src={logo}
            alt="NorthSafe"
            className="absolute inset-0 h-full w-full object-contain object-left"
          />

          {/* White NORTHSAFE wordmark overlay
              The shield remains in its original brand colors.
              Left clip loosened further so the dark stroke of the
              original "N" no longer peeks out before the white one.
          */}
          <img
            src={logo}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 h-full w-full object-contain object-left"
            style={{
              filter: "brightness(0) invert(1)",
              clipPath: "inset(15% 0 15% 27%)",
            }}
          />

          {/* ADMIN label */}
          <span
            className="
              absolute
              left-[105px]
              bottom-[1px]
              font-roboto
              text-[13px]
              font-bold
              uppercase
              tracking-[0.16em]
              text-emerald-400
            "
          >
            ADMIN
          </span>
        </NavLink>
      </div>

      {/* =========================================================
          NAVIGATION
      ========================================================= */}
      <nav className="flex-1 px-3 pt-2">
        <div className="space-y-1">
          {NAV_ITEMS.map(({ label, to, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                [
                  "group relative flex items-center gap-3 rounded-lg px-3 py-2.5",
                  "text-sm font-medium transition-all duration-150",
                  isActive
                    ? "bg-white/[0.10] text-white"
                    : "text-slate-300 hover:bg-white/[0.06] hover:text-white",
                ].join(" ")
              }
            >
              {({ isActive }) => (
                <>
                  {/* Active indicator */}
                  {isActive && (
                    <span
                      className="
                        absolute
                        left-0
                        top-1/2
                        h-6
                        w-[3px]
                        -translate-y-1/2
                        rounded-r-full
                        bg-[#00BEC2]
                      "
                    />
                  )}

                  <Icon
                    size={18}
                    strokeWidth={isActive ? 2.2 : 1.9}
                    className={[
                      "shrink-0 transition-colors",
                      isActive
                        ? "text-[#00BEC2]"
                        : "text-slate-300 group-hover:text-white",
                    ].join(" ")}
                  />

                  <span>{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* =========================================================
          OFFICER / LOGOUT
      ========================================================= */}
      <div className="border-t border-white/[0.10] px-4 py-4">
        {/* Officer */}
        <div className="mb-3 flex items-center gap-3">
          <div
            className="
              flex
              h-9
              w-9
              shrink-0
              items-center
              justify-center
              rounded-full
              bg-slate-600
              text-sm
              font-semibold
              text-white
            "
          >
            {adminOfficer.name.charAt(0)}
          </div>

          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">
              {adminOfficer.name}
            </p>

            <p className="text-xs text-slate-400">
              ID: {adminOfficer.id}
            </p>
          </div>
        </div>

        {/* Logout */}
        <button
          type="button"
          onClick={onLogout}
          className="
            flex
            w-full
            items-center
            gap-2
            rounded-lg
            px-3
            py-2
            text-sm
            font-medium
            text-slate-300
            transition-colors
            hover:bg-white/[0.06]
            hover:text-white
          "
        >
          <LogOut size={16} strokeWidth={2} />
          <span>Log Out</span>
        </button>
      </div>
    </aside>
  );
}