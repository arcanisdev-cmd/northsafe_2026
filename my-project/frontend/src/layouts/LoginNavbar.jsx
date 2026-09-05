import { Link, useLocation } from "react-router-dom";
import logo from "../assets/logo.png";

function LoginNavbar() {
  const location = useLocation();
  const isSignupPage = location.pathname === "/signup";

  const oppositeLink = isSignupPage
    ? { label: "Sign In", to: "/signin" }
    : { label: "Sign Up", to: "/signup" };

  return (
    // sticky + z-50 to match NavBar's behavior. Always solid white here
    // (unlike NavBar's transparent-over-hero transition) since this page
    // has no hero content to scroll under.
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-100">
      <div className="h-[82px] flex items-center justify-between px-4 sm:px-6 md:px-12 lg:px-[100px]">
        <Link to="/" className="flex items-center">
          {/* Same h-[64px] w-auto sizing as NavBar's logo — logo.png already
              contains the full wordmark, so no separate text needed. */}
          <img src={logo} alt="NorthSafe logo" className="h-[64px] w-auto" />
        </Link>

        {/* Same pill styling as NavBar's Sign In button */}
        <Link
          to={oppositeLink.to}
          className="rounded-full px-6 py-2.5 text-sm font-roboto font-bold uppercase text-white transition-colors"
          style={{ backgroundColor: "#081435" }}
        >
          {oppositeLink.label}
        </Link>
      </div>
    </nav>
  );
}

export default LoginNavbar;