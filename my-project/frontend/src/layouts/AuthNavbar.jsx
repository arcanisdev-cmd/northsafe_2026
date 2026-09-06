import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Star, User } from "lucide-react";
import logo from "../assets/logo.png";
import NotificationsDropdown from "../components/NotificationsDropdown";
import { currentUser } from "../components/data/MockDashboardData";

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

  // Same fade-on-scroll pattern as the marketing NavBar: transparent over
  // the hero photo at the top, solid white once scrolled past 20px.
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    // Switched from sticky to fixed + the same transition/background toggle
    // as NavBar. NOTE: since this is now fixed (removed from document flow),
    // whatever page renders this needs top padding/margin of 82px (this
    // navbar's height) on its first section, or that content will render
    // hidden underneath the navbar.
    <nav
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        isScrolled ? "bg-white border-b border-gray-100" : "bg-transparent"
      }`}
    >
      <div className="h-[82px] flex items-center justify-between px-4 sm:px-6 md:px-12 lg:px-[100px]">
        <Link to="/dashboard">
          <img src={logo} alt="NorthSafe logo" className="h-[64px] w-auto" />
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <ul className="flex items-center gap-8">
            {navLinks.map((link) => {
              const isActive = link.path && location.pathname === link.path;

              // Active/inactive teal highlight stays the same regardless of
              // scroll state; only the base (inactive) color toggles
              // between white (over the photo) and navy (scrolled).
              const baseColor = isScrolled ? "text-[#081435]" : "text-white";

              if (link.path === null) {
                return (
                  <li key={link.label}>
                    <button
                      ref={notificationsButtonRef}
                      type="button"
                      onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                      className={`font-roboto font-bold text-base uppercase transition-colors ${
                        isNotificationsOpen ? "text-[#0BA6DF]" : `${baseColor} hover:text-[#0BA6DF]`
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
                      isActive ? "text-[#0BA6DF]" : `${baseColor} hover:text-[#0BA6DF]`
                    }`}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>

          <div
            className={`flex items-center gap-2 pl-4 border-l transition-colors duration-300 ${
              isScrolled ? "border-gray-200" : "border-white/30"
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-300 ${
                isScrolled ? "bg-gray-100" : "bg-white/15"
              }`}
            >
              {currentUser.avatarUrl ? (
                <img
                  src={currentUser.avatarUrl}
                  alt={currentUser.name}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <User size={18} className={isScrolled ? "text-[#081435]" : "text-white"} />
              )}
            </div>
            <div>
              <p
                className={`font-roboto font-bold text-sm uppercase leading-tight transition-colors duration-300 ${
                  isScrolled ? "text-[#081435]" : "text-white"
                }`}
              >
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
      />
    </nav>
  );
}

export default AuthNavbar;