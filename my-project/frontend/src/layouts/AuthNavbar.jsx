import { useEffect, useRef, useState } from "react";
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

function readStoredUser() {
  const rawUser = localStorage.getItem("northsafe_user") ?? sessionStorage.getItem("northsafe_user");

  if (!rawUser) {
    return null;
  }

  try {
    return JSON.parse(rawUser);
  } catch {
    return null;
  }
}

function AuthNavbar() {
  const location = useLocation();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [authUser, setAuthUser] = useState(() => readStoredUser());
  const notificationsButtonRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem("northsafe_token") ?? sessionStorage.getItem("northsafe_token");

    if (!token) {
      return;
    }

    const apiBaseUrl = import.meta.env.VITE_API_URL ?? "http://localhost:8000";
    const controller = new AbortController();

    fetch(`${apiBaseUrl}/api/me`, {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      signal: controller.signal,
    })
      .then((response) => response.json().then((data) => ({ response, data })))
      .then(({ response, data }) => {
        if (!response.ok || !data?.user) {
          return;
        }

        setAuthUser(data.user);

        if (localStorage.getItem("northsafe_token")) {
          localStorage.setItem("northsafe_user", JSON.stringify(data.user));
        } else {
          sessionStorage.setItem("northsafe_user", JSON.stringify(data.user));
        }
      })
      .catch(() => {
        // Keep the stored profile if the backend is temporarily unavailable.
      });

    return () => controller.abort();
  }, []);

  const displayName = authUser?.fullName ?? authUser?.name ?? "NorthSafe User";

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-white border-b border-gray-100">
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
            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-100">
              {authUser?.avatarUrl ? (
                <img
                  src={authUser.avatarUrl}
                  alt={displayName}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <User size={18} className="text-[#081435]" />
              )}
            </div>
            <div>
              <p className="font-roboto font-bold text-sm uppercase leading-tight text-[#081435]">
                {displayName}
              </p>
              <p className="flex items-center gap-1 text-xs font-semibold text-[#FFB256]">
                <Star size={12} className="fill-[#FFB256]" />
                0 POINTS
              </p>
            </div>
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