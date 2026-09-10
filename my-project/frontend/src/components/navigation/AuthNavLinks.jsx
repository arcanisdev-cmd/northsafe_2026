import { useLocation, useNavigate } from "react-router-dom";
import { navigateWithTransition } from "../../utils/navigateWithTransition";

const navLinks = [
  { label: "Home", path: "/dashboard" },
  { label: "Hazard Map", path: "/hazard-map" },
  { label: "My Reports", path: "/my-reports" },
];

export default function AuthNavLinks({
  unreadCount,
  isNotificationsOpen,
  onNotificationsClick,
  notificationsButtonRef,
}) {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <ul className="flex items-center gap-8">
      {navLinks.map((link) => {
        const isActive = location.pathname === link.path;

        return (
          <li key={link.label}>
            <button
              type="button"
              onClick={() =>
                navigateWithTransition(navigate, link.path)
              }
              className={`font-roboto font-bold text-base uppercase transition-colors duration-200 active:scale-[0.97] ${
                isActive
                  ? "text-[#0BA6DF]"
                  : "text-[#081435] hover:text-[#0BA6DF]"
              }`}
            >
              {link.label}
            </button>
          </li>
        );
      })}

      <li>
        <button
          ref={notificationsButtonRef}
          type="button"
          onClick={onNotificationsClick}
          className={`relative flex items-center gap-1.5 font-roboto font-bold text-base uppercase transition-colors duration-200 active:scale-[0.97] ${
            isNotificationsOpen
              ? "text-[#0BA6DF]"
              : "text-[#081435] hover:text-[#0BA6DF]"
          }`}
        >
          Notifications

          {unreadCount > 0 && (
            <span className="flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#D30004] px-1 text-[10px] font-bold text-white">
              {unreadCount}
            </span>
          )}
        </button>
      </li>
    </ul>
  );
}