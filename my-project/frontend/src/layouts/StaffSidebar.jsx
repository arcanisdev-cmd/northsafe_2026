import { NavLink } from "react-router-dom";
import {
  LayoutGrid,
  ClipboardList,
  Timer,
  MapPin,
  CircleCheck,
  Map as MapIcon,
  BarChart2,
  Bell,
} from "lucide-react";

import logo from "../assets/logo.png";
import { useStaffBadges } from "../utils/StaffReportsContext";

const NAV_SECTIONS = [
  {
    label: "Overview",
    items: [
      { label: "Dashboard", to: "/staff", icon: LayoutGrid, end: true },
      {
        label: "Review Queue",
        to: "/staff/review-queue",
        icon: ClipboardList,
        badgeKey: "reviewQueue",
      },
      {
        label: "In Progress",
        to: "/staff/in-progress",
        icon: Timer,
        badgeKey: "inProgress",
      },
    ],
  },
  {
    label: "Report Management",
    items: [
      {
        label: "Field Checks",
        to: "/staff/field-checks",
        icon: MapPin,
        badgeKey: "fieldChecks",
      },
      {
        label: "Resolved Reports",
        to: "/staff/resolved",
        icon: CircleCheck,
      },
    ],
  },
  {
    label: "Monitoring",
    items: [
      { label: "Map Monitor", to: "/staff/map", icon: MapIcon },
      { label: "Analytics", to: "/staff/analytics", icon: BarChart2 },
    ],
  },
  {
    label: "Account",
    items: [
      {
        label: "Notifications",
        to: "/staff/notifications",
        icon: Bell,
        badgeKey: "notifications",
        solidBadge: true,
      },
    ],
  },
];

function NavBadge({ count, solid }) {
  if (!count) return null;

  return (
    <span
      className={[
        "ml-auto flex h-6 min-w-6 items-center justify-center rounded-full px-1.5 text-xs font-semibold",
        solid
          ? "bg-[#1B2A8E] text-white"
          : "bg-[#DDE3F8] text-[#1B2A8E]",
      ].join(" ")}
    >
      {count > 99 ? "99+" : count}
    </span>
  );
}

export default function StaffSidebar() {
  // Badges are derived from the shared report list, so they stay in sync
  const staffNavBadges = useStaffBadges();

  return (
    // Outer column stretches to the full page height (white background all the way down)
    <aside className="w-64 shrink-0 border-r border-[#E3E8F4] bg-white">
      {/* Inner panel stays pinned to the viewport while the page scrolls */}
      <div className="sticky top-0 flex h-screen flex-col">
        {/* BRAND */}
        <div className="shrink-0 px-5 pt-5 pb-4">
          <NavLink
            to="/staff"
            className="relative block h-[72px] w-[220px]"
            aria-label="NorthSafe Staff Dashboard"
          >
            <img
              src={logo}
              alt="NorthSafe"
              className="absolute inset-0 h-full w-full object-contain object-left"
            />

            <span className="absolute bottom-[1px] left-[105px] text-[11px] font-medium text-slate-500">
              Barangay Staff Portal
            </span>
          </NavLink>
        </div>

        {/* NAVIGATION */}
        <nav className="min-h-0 flex-1 overflow-y-auto px-3 pb-3">
          {NAV_SECTIONS.map((section, index) => (
            <div
              key={section.label}
              className={index > 0 ? "mt-3 border-t border-[#E3E8F4] pt-3" : ""}
            >
              <p className="px-3 pb-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                {section.label}
              </p>

              <div className="space-y-1">
                {section.items.map(
                  ({ label, to, icon: Icon, end, badgeKey, solidBadge }) => (
                    <NavLink
                      key={to}
                      to={to}
                      end={end}
                      className={({ isActive }) =>
                        [
                          "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors",
                          isActive
                            ? "bg-[#E8EBFA] font-semibold text-[#1B2A8E]"
                            : "font-medium text-slate-600 hover:bg-slate-50 hover:text-[#1B2A8E]",
                        ].join(" ")
                      }
                    >
                      <Icon size={18} strokeWidth={1.9} className="shrink-0" />

                      <span>{label}</span>

                      {badgeKey && (
                        <NavBadge
                          count={staffNavBadges[badgeKey]}
                          solid={solidBadge}
                        />
                      )}
                    </NavLink>
                  )
                )}
              </div>
            </div>
          ))}
        </nav>
      </div>
    </aside>
  );
} 