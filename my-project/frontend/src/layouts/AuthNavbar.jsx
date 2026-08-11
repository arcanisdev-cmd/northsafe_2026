import { Link } from "react-router-dom";
import { Star, User } from "lucide-react";
import logo from "../assets/logo.png";

const navLinks = [
  { label: "Home", active: true },
  { label: "Hazard Map", active: false },
  { label: "My Reports", active: false },
  { label: "Notifications", active: false },
];

function AuthNavbar({ userName = "Juan Dela Cruz", points = 140 }) {
  return (
    <nav className="sticky top-0 z-50 bg-white h-[82px] flex items-center justify-between px-4 sm:px-6 md:px-12 lg:px-[108px]">
      {/* Logo */}
      <img src={logo} alt="NorthSafe logo" className="h-[76px] w-[76px] object-contain" />

      {/* Nav links + user, grouped together */}
      <div className="hidden md:flex items-center gap-8">
        <ul className="flex items-center gap-8">
          {navLinks.map((link) => (
            <li
              key={link.label}
              className={`font-roboto font-bold text-base uppercase cursor-pointer transition-colors ${
                link.active ? "text-[#0BA6DF]" : "text-[#081435] hover:text-[#0BA6DF]"
              }`}
            >
              {link.label}
            </li>
          ))}
        </ul>

        {/* User block */}
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
    </nav>
  );
}

export default AuthNavbar;