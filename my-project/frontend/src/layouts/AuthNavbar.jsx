import { useState, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { Star, User } from "lucide-react";
import logo from "../assets/logo.png";
import NotificationsDropdown from "../components/NotificationsDropdown";

const navLinks = [
  { label: "Home", path: "/dashboard" },
  { label: "Hazard Map", path: "/hazard-map" },
  { label: "My Reports", path: "/my-reports" },
  { label: "Notifications", path: null },
];

function AuthNavbar({ userName = "Juan Dela Cruz", points = 140 }) {
  const location = useLocation();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const notificationsButtonRef = useRef(null);

  return (
    <nav className="sticky top-0 z-50 bg-white h-[82px] flex items-center justify-between px-4 sm:px-6 md:px-12 lg:px-[108px]">
      <Link to="/dashboard">
        <img src={logo} alt="NorthSafe logo" className="h-[76px] w-[76px] object-contain" />
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
                    className={`font-roboto font-bold text-base uppercase transition-colors ${
                      isNotificationsOpen ? "text-[#0BA6DF]" : "text-[#081435] hover:text-[#0BA6DF]"
                    }`}
                  >
                    {link.label}
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
          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
            <User size={18} className="text-[#081435]" />
          </div>
          <div>
            <p className="font-roboto font-bold text-sm text-[#081435] uppercase leading-tight">
              {userName}
            </p>
            <p className="flex items-center gap-1 text-xs font-semibold text-[#FFB256]">
              <Star size={12} className="fill-[#FFB256]" />
              {points} POINTS
            </p>
          </div>
        </div>
      </div>

      <NotificationsDropdown
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        anchorRef={notificationsButtonRef}
      />
    </nav>
  );
}

export default AuthNavbar;