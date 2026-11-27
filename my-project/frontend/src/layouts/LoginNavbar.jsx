import { Link, useLocation } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";
import logo from "../assets/logo.png";

function LoginNavbar({ variant = "switch" }) {
  const location = useLocation();
  const isSignupPage = location.pathname === "/signup";

  const oppositeLink = isSignupPage
    ? { label: "Sign In", to: "/signin" }
    : { label: "Sign Up", to: "/signup" };

  const isBackHome = variant === "back-home";
  const action = isBackHome
    ? { label: "Back to home", to: "/" }
    : oppositeLink;

  return (
    
    <nav className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white">
      
      <div className="flex h-16 items-center justify-between px-4 sm:h-[86px] sm:px-6 md:px-10 lg:px-[72px] xl:px-[84px]">
        
        <Link to="/" aria-label="NorthSafe home" className="flex-shrink-0">
          <img
            src={logo}
            alt="NorthSafe logo"
            className="h-11 w-auto object-contain sm:h-[70px]"
          />
        </Link>

        
        <Link
          to={action.to}
          aria-label={action.label}
          className={`inline-flex flex-shrink-0 items-center justify-center gap-2.5 rounded-full bg-navy font-jakarta text-[13px] font-bold uppercase text-white transition-colors hover:bg-navy/90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal sm:h-auto sm:w-auto sm:px-7 sm:py-3.5 sm:text-[14px] ${
            isBackHome ? "h-10 w-10" : "h-10 px-5"
          }`}
        >
          {isBackHome && (
            <ArrowLeft size={18} strokeWidth={2.5} aria-hidden="true" />
          )}
          <span className={isBackHome ? "sr-only sm:not-sr-only" : ""}>
            {action.label}
          </span>
          {!isBackHome && (
            <ArrowRight
              size={18}
              strokeWidth={2.5}
              aria-hidden="true"
              className="hidden sm:block"
            />
          )}
        </Link>
      </div>
    </nav>
  );
}

export default LoginNavbar;