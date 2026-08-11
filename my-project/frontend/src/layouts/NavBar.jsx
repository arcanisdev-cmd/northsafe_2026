import { useState } from "react";
import { Menu, X } from "lucide-react";
import Button from "../components/Button";
import logo from "../assets/logo.png";

const navLinks = ["Home", "Features", "About", "How It Works", "Hotlines"];

function NavBar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-white">
      <div className="h-[82px] flex items-center justify-between px-4 sm:px-6 md:px-12 lg:px-[108px]">
        {/* Logo */}
        <img src={logo} alt="NorthSafe logo" className="h-[40px] w-auto" />

        {/* Desktop nav links — hidden below md */}
        <ul className="hidden md:flex items-center gap-x-8">
          {navLinks.map((link) => (
            <li
              key={link}
              className="font-roboto font-bold text-base text-navy uppercase cursor-pointer hover:text-teal transition-colors"
            >
              {link}
            </li>
          ))}
        </ul>

        {/* Desktop Sign In — hidden below md */}
        <div className="hidden md:block">
          <Button variant="navy">Sign In</Button>
        </div>

        {/* Hamburger toggle — only visible below md */}
        <button
          type="button"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden text-navy"
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile dropdown panel */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 sm:px-6 py-4">
          <ul className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <li
                key={link}
                onClick={() => setIsMenuOpen(false)}
                className="font-roboto font-bold text-base text-navy uppercase cursor-pointer"
              >
                {link}
              </li>
            ))}
          </ul>
          <div className="mt-4">
            <Button variant="navy" className="w-full">Sign In</Button>
          </div>
        </div>
      )}
    </nav>
  );
}

export default NavBar;