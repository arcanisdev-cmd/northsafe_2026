import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, ArrowRight } from "lucide-react";
import logo from "../assets/logo.png";
import { useLoading } from "../components/LoadingScreen";

// Set to 2000 to preview the loading screen locally (it adds a fake 2s wait
// on the Sign In click). Set back to 0 when you're done.
const PREVIEW_DELAY_MS = 0;

const navLinks = [
  { label: "Home", id: "home" },
  { label: "Features", id: "features" },
  { label: "About", id: "about" },
  { label: "How It Works", id: "how-it-works" },
  { label: "Hotlines", id: "hotlines" },
];

function NavBar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { withLoading } = useLoading();

  function handleHomeClick(e) {
    e.preventDefault();
    setIsMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Waits for the sign-in page's code to load, then navigates.
  // On a fast connection this is instant and the loading screen never shows.
  async function handleSignInClick(e) {
    // Let ctrl/cmd/shift-click and middle-click behave like a normal link
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    setIsMenuOpen(false);

    try {
      await withLoading(
        Promise.all([
          import("../pages/SigninPage"),
          PREVIEW_DELAY_MS
            ? new Promise((resolve) => setTimeout(resolve, PREVIEW_DELAY_MS))
            : null,
        ]),
        "Opening sign in…"
      );
    } catch {
      // The code failed to load: navigate anyway and let the router handle it
    }

    navigate("/signin");
  }

  function renderLink(link, mobile = false) {
    return (
      <a
        href={`#${link.id}`}
        onClick={(e) => {
          if (link.id === "home") handleHomeClick(e);
          else if (mobile) setIsMenuOpen(false);
        }}
        className={`font-jakarta font-semibold text-[15px] text-navy transition-colors duration-200 hover:text-teal focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal ${
          mobile ? "flex min-h-[44px] w-full items-center px-2" : ""
        }`}
      >
        {link.label}
      </a>
    );
  }

  const signInClass =
    "inline-flex items-center justify-center gap-2.5 rounded-full bg-navy text-white hover:bg-navy/90 transition-colors font-jakarta font-bold focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal";

  return (
    <nav className="fixed top-0 left-0 z-50 w-full bg-white border-b border-gray-100">
      <div className="h-[86px] flex items-center justify-between px-4 sm:px-6 md:px-10 lg:px-[72px] xl:px-[84px]">
        {/* Logo */}
        <a href="#home" onClick={handleHomeClick} className="flex-shrink-0">
          <img src={logo} alt="NorthSafe logo" className="h-[70px] w-auto object-contain" />
        </a>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-x-12 xl:gap-x-14">
          <ul className="flex items-center gap-x-10 xl:gap-x-12">
            {navLinks.map((link) => (
              <li key={link.id}>{renderLink(link)}</li>
            ))}
          </ul>

          <Link
            to="/signin"
            onClick={handleSignInClick}
            className={`${signInClass} flex-shrink-0 px-7 py-3.5 text-[14px]`}
          >
            SIGN IN
            <ArrowRight size={18} strokeWidth={2.5} />
          </Link>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          type="button"
          onClick={() => setIsMenuOpen((prev) => !prev)}
          className="lg:hidden flex items-center justify-center text-navy focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal"
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={isMenuOpen}
          aria-controls="mobile-navigation"
        >
          {isMenuOpen ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div id="mobile-navigation" className="lg:hidden bg-white border-t border-gray-100 px-4 sm:px-6 py-4">
          <ul className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <li key={link.id}>{renderLink(link, true)}</li>
            ))}
          </ul>

          <Link
            to="/signin"
            onClick={handleSignInClick}
            className={`${signInClass} mt-4 w-full py-3.5 text-sm`}
          >
            SIGN IN
            <ArrowRight size={18} strokeWidth={2.5} />
          </Link>
        </div>
      )}
    </nav>
  );
}

export default NavBar;