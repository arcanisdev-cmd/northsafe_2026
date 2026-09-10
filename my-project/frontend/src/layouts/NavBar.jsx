import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import Button from "../components/Button";
import logo from "../assets/logo.png";

const navLinks = [
  { label: "Home", id: "home" },
  { label: "Features", id: "features" },
  { label: "About", id: "about" },
  { label: "How It Works", id: "how-it-works" },
  { label: "Hotlines", id: "hotlines" },
];

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function NavBar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(function () {
    function handleScroll() {
      setIsScrolled(window.scrollY > 20);
    }
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return function () {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  function handleHomeClick(e) {
    e.preventDefault();
    scrollToTop();
  }

  function renderLink(link, onNavigate) {
    const baseClass = "font-roboto font-bold text-sm tracking-wide uppercase transition-colors cursor-pointer";
    const colorClass = isScrolled ? "text-navy hover:text-teal" : "text-white hover:text-teal";
    const fullClass = baseClass + " " + colorClass;

    if (link.id === "home") {
      return <a href="#" className={fullClass} onClick={handleHomeClick}>{link.label}</a>;
    }

    const targetHref = "#" + link.id;
    return <a href={targetHref} className={fullClass} onClick={onNavigate}>{link.label}</a>;
  }

  return (
    <nav className={"fixed top-0 left-0 w-full z-50 transition-all duration-300 " + (isScrolled ? "bg-white border-b border-gray-100" : "bg-transparent")}>
      <div className="h-[82px] flex items-center justify-between px-4 sm:px-6 md:px-12 lg:px-[100px]">

        <a href="#" onClick={handleHomeClick}><img src={logo} alt="NorthSafe logo" className="h-[64px] w-auto" /></a>

        <div className="hidden md:flex items-center gap-x-14">
          <ul className="flex items-center gap-x-16">
            {navLinks.map(function (link) {
              return <li key={link.label}>{renderLink(link)}</li>;
            })}
          </ul>

          <Link to="/signin">
            <Button variant={isScrolled ? "navy" : "outline"} className="rounded-full px-6 py-2.5 text-sm">
              SIGN IN
            </Button>
          </Link>
        </div>

        <button
          type="button"
          onClick={function () { setIsMenuOpen(!isMenuOpen); }}
          className={"md:hidden transition-colors " + (isScrolled ? "text-navy" : "text-white")}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 sm:px-6 py-4">
          <ul className="flex flex-col gap-4">
            {navLinks.map(function (link) {
              return <li key={link.label}>{renderLink(link, function () { setIsMenuOpen(false); })}</li>;
            })}
          </ul>
          <Link to="/signin" onClick={function () { setIsMenuOpen(false); }}>
            <Button variant="navy" className="rounded-full w-full py-2.5 text-sm mt-4">
              Sign In
            </Button>
          </Link>
        </div>
      )}
    </nav>
  );
}

export default NavBar;