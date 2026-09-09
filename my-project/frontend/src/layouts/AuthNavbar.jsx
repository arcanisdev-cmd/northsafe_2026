import { useMemo, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Star, User } from "lucide-react";
import logo from "../assets/logo.png";
import NotificationsDropdown from "../components/NotificationsDropdown";
import { currentUser, notifications as allNotifications } from "../components/data/MockDashboardData";
import { getMyNotifications, getUnreadCount } from "../utils/notificationSelectors";

const navLinks = [
  { label: "Home", path: "/dashboard" },
  { label: "Hazard Map", path: "/hazard-map" },
  { label: "My Reports", path: "/my-reports" },
  { label: "Notifications", path: null },
];

function AuthNavbar() {
  const location = useLocation();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const notificationsButtonRef = useRef(null);

  // Owned here (not inside the dropdown) so the unread badge below and the
  // dropdown's own counts/list always agree — same pattern as
  // currentUser.points being read from one place everywhere it's shown.
  const [notifications, setNotifications] = useState(() =>
    getMyNotifications(allNotifications, currentUser.id)
  );
  const unreadCount = useMemo(() => getUnreadCount(notifications), [notifications]);

  const handleMarkRead = (id) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <nav className="sticky top-0 z-50 w-full bg-white border-b border-gray-100">
      <div className="h-[82px] flex items-center justify-between px-4 sm:px-6 md:px-12 lg:px-[100px]">
        <Link to="/dashboard">
          <img src={logo} alt="NorthSafe logo" className="h-[64px] w-auto" />
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <ul className="flex items-center gap-8">
            {navLinks.map((link) => {
              const isActive = link.path && location.pathname === link.path;

              if (link.path === null) {
                return (
                  <li key={link.label}>
                    <button
                      ref={notificationsButtonRef}
                      type="button"
                      onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                      className={`relative flex items-center gap-1.5 font-roboto font-bold text-base uppercase transition-colors ${
                        isNotificationsOpen ? "text-[#0BA6DF]" : "text-[#081435] hover:text-[#0BA6DF]"
                      }`}
                    >
                      {link.label}
                      {unreadCount > 0 && (
                        <span
                          className="flex items-center justify-center h-4 min-w-[16px] px-1 rounded-full text-white text-[10px] font-bold"
                          style={{ backgroundColor: "#D30004" }}
                        >
                          {unreadCount}
                        </span>
                      )}
                    </button>
                  </li>
                );
              }

              return (
                <li key={link.label}>
                  <Link
                    to={link.path}
                    className={`font-roboto font-bold text-base uppercase transition-colors ${
                      isActive ? "text-[#0BA6DF]" : "text-[#081435] hover:text-[#0BA6DF]"
                    }`}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="flex items-center gap-2 pl-4 border-l border-gray-200">
            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-100">
              {currentUser.avatarUrl ? (
                <img
                  src={currentUser.avatarUrl}
                  alt={currentUser.name}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <User size={18} className="text-[#081435]" />
              )}
            </div>
            <div>
              <p className="font-roboto font-bold text-sm uppercase leading-tight text-[#081435]">
                {currentUser.name}
              </p>
              <p className="flex items-center gap-1 text-xs font-semibold text-[#FFB256]">
                <Star size={12} className="fill-[#FFB256]" />
                {currentUser.points} POINTS
              </p>
            </div>
          </div>
        </div>
      </div>

      <NotificationsDropdown
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        anchorRef={notificationsButtonRef}
        notifications={notifications}
        onMarkRead={handleMarkRead}
        onMarkAllRead={handleMarkAllRead}
      />
    </nav>
  );
}

export default AuthNavbar;