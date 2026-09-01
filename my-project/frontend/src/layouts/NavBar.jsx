import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import Button from "../components/Button";
import logo from "../assets/logo.png";

const navLinks = ["Home", "Features", "About", "How It Works", "Hotlines"];

function NavBar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
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
    <nav
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white border-b border-gray-100"
          : "bg-transparent"
      }`}
    >
      <div className="h-[82px] flex items-center justify-between px-4 sm:px-6 md:px-12 lg:px-[100px]">
        {/* Logo — enlarged to match Figma */}
        <img src={logo} alt="NorthSafe logo" className="h-[64px] w-auto" />

        {/* Right-hand group: nav links + Sign In, clustered together like the Figma */}
        <div className="hidden md:flex items-center gap-x-14">
          <ul className="flex items-center gap-x-16">
            {navLinks.map((link) => (
              <li
                key={link}
                className={`font-roboto font-bold text-sm tracking-wide uppercase cursor-pointer transition-colors ${
                  isScrolled ? "text-navy hover:text-teal" : "text-white hover:text-teal"
                }`}
              >
                {link}
              </li>
            ))}
          </ul>

          <Button
            variant={isScrolled ? "navy" : "outline"}
            className="rounded-full px-6 py-2.5 text-sm"
          >
            SIGN IN
          </Button>
        </div>

        {/* Hamburger toggle — only visible below md */}
        <button
          type="button"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className={`md:hidden transition-colors ${isScrolled ? "text-navy" : "text-white"}`}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile dropdown panel — always solid so it's readable regardless of scroll state */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 sm:px-6 py-4">
          <ul className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <li
                key={link}
                onClick={() => setIsMenuOpen(false)}
                className="font-roboto font-bold text-sm text-navy uppercase cursor-pointer"
              >
                {link}
              </li>
            ))}
          </ul>
          <div className="mt-4">
            <Button variant="navy" className="rounded-full w-full py-2.5 text-sm">
              Sign In
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
}

export default NavBar;