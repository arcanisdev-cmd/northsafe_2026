import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2, MapPinned, Sparkles, Timer } from "lucide-react";
import LoginNavbar from "../layouts/LoginNavbar";
import ndrrmcBg from "../assets/NDRRMC.png";
import { useLoading } from "../components/LoadingScreen";


const SHOW_GOOGLE = true;


const FONT_MONTSERRAT = "font-['Montserrat',sans-serif]";
const FONT_KRUB = "font-['Krub',sans-serif]";

const features = [
  {
    icon: Sparkles,
    title: "AI-Powered Classification",
    text: "Categorizes hazards, severity, and provides hazard information.",
  },
  {
    icon: Timer,
    title: "Real-Time Reporting",
    text: "Submit hazard reports instantly with image and GPS location.",
  },
  {
    icon: MapPinned,
    title: "GPS-Based Mapping",
    text: "Track all hazard reports and high-risk areas in an interactive map.",
  },
];

function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { withLoading } = useLoading();

  const apiBaseUrl = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);

    try {
      const response = await fetch(`${apiBaseUrl}/api/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(data?.message ?? "Unable to sign in.");
        return;
      }

      const storage = rememberMe ? localStorage : sessionStorage;
      storage.setItem("northsafe_token", data.token);
      storage.setItem("northsafe_user", JSON.stringify(data.user));


      try {
        await withLoading(import("./DashboardPage"), "Signing you in…");
      } catch {
        // navigate anyway; the router will handle the failure
      }

      navigate("/dashboard");
    } catch {
      setErrorMessage("Unable to reach the authentication server.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = () => {
    console.log("Google sign in clicked");
  };

  const hasError = Boolean(errorMessage);

  
  const fieldBox =
    "block h-[58px] rounded-xl border border-navy/40 bg-[#F5F6F8] px-[13px] pt-2 transition hover:border-navy/60 focus-within:border-[#08457E] focus-within:ring-4 focus-within:ring-teal/25 " +
    (hasError ? "!border-[#B42318]" : "");
  const fieldLabel = "block text-xs font-bold leading-4 text-navy";
  const fieldInput =
    "mt-1 block h-[22px] w-full bg-transparent text-[13px] text-navy outline-none placeholder:text-navy/50";

  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* ---------------- White header bar ---------------- */}
      <LoginNavbar variant="back-home" />

      {/* ---------------- Hero ---------------- */}
      <main className="relative isolate flex flex-1 items-center overflow-hidden">
        {/* Photo */}
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-cover bg-center"
          style={{ backgroundImage: `url(${ndrrmcBg})` }}
        />
        {/* Dark teal overlay */}
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-gradient-to-r from-[#04242C]/90 via-[#06323B]/85 to-[#0A4550]/80"
        />

        
        <div className="grid w-full px-4 py-6 sm:px-6 sm:py-10 md:px-10 lg:px-[72px] xl:grid-cols-[minmax(0,722px)_550px] xl:justify-between xl:gap-[60px] xl:px-[84px] xl:py-[54px]">
          {/* ---------- Left: headline + subtext + features (xl and up) ---------- */}
          {/* Figma frame: 722 wide, 540 tall.
              headline y0 h294 -> subtext y320 h63 -> cards y409 h131 */}
          <section className="hidden xl:block">
            {/* Montserrat Bold 80, 3 lines in 294px (98px line height) */}
            <h1
              className={`${FONT_MONTSERRAT} text-[clamp(56px,5.25vw,80px)] font-bold leading-[1.225]`}
            >
              <span className="block text-white">Recognize</span>
              <span className="block text-[#FFC564]">Report</span>
              <span className="block text-[#00BEC2]">Resolve</span>
            </h1>

            {/* Krub Medium 22, E2F1FF, 682 wide, 2 lines in 63px */}
            <p
              className={`${FONT_KRUB} mt-[26px] max-w-[682px] text-[22px] font-medium leading-[1.43] text-[#E2F1FF]`}
            >
              Report hazards in your area, track them in real time, and help
              make North Caloocan safer.
            </p>

            <ul className="mt-[26px] grid grid-cols-3 gap-[10px]">
              {features.map(({ icon: Icon, title, text }) => (
                <li
                  key={title}
                  className="flex min-h-[131px] flex-col items-center rounded-xl border border-white/30 bg-gradient-to-b from-white/15 to-[#12808B]/35 px-2 pb-[18px] pt-5 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.3),0_10px_30px_rgba(0,0,0,0.25)] backdrop-blur-md"
                >
                  <Icon
                    size={24}
                    className="shrink-0 text-[#2DD4DA]"
                    aria-hidden="true"
                  />
                  <p className="mt-2 text-[15px] font-semibold leading-5 text-[#2DD4DA]">
                    {title}
                  </p>
                  <p className="mt-[5px] text-[13px] leading-[18px] text-white">
                    {text}
                  </p>
                </li>
              ))}
            </ul>
          </section>

          {/* ---------- Right: login panel ---------- */}
          {/* Figma: 550 wide, 540 tall, 50 padding, radius 20, solid white.
              min-h (not fixed h) so the error banner can push it taller. */}
          <section className="mx-auto w-full max-w-[550px] rounded-[20px] bg-white px-5 py-8 shadow-2xl sm:min-h-[540px] sm:px-[50px] sm:py-[50px] xl:mx-0">
            {/* Figma fields are 377px wide, centered inside the panel */}
            <div className="mx-auto w-full max-w-[377px]">
              <h2
                className={`${FONT_MONTSERRAT} text-center text-4xl font-bold leading-[43px] text-navy`}
              >
                LOGIN
              </h2>
              <p className="mt-[9px] text-center text-sm font-medium leading-5 text-[#0B7A8A]">
                Report and verify hazards in North Caloocan.
              </p>

              {SHOW_GOOGLE && (
                <>
                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    className="mt-[15px] flex h-[43px] w-full items-center justify-center gap-2.5 rounded-full border border-navy/40 bg-white text-sm font-bold text-navy transition hover:bg-navy/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#08457E]"
                  >
                    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
                      <path
                        fill="#4285F4"
                        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 01-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62z"
                      />
                      <path
                        fill="#34A853"
                        d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 009 18z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M3.97 10.72A5.4 5.4 0 013.68 9c0-.6.1-1.18.29-1.72V4.95H.96A9 9 0 000 9c0 1.45.35 2.83.96 4.05l3.01-2.33z"
                      />
                      <path
                        fill="#EA4335"
                        d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 00.96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58z"
                      />
                    </svg>
                    Continue with Google
                  </button>

                  <div
                    className="my-[11px] flex h-[15px] items-center gap-4"
                    aria-hidden="true"
                  >
                    <span className="h-px flex-1 bg-navy/15" />
                    <span className="text-[10px] font-semibold uppercase text-navy/60">
                      or
                    </span>
                    <span className="h-px flex-1 bg-navy/15" />
                  </div>
                </>
              )}

              <form onSubmit={handleSubmit} noValidate>
                {hasError && (
                  <div
                    id="signin-error"
                    role="alert"
                    className="mb-3 rounded-xl border border-[#B42318]/30 bg-[#FEF3F2] px-4 py-3 text-sm font-medium text-[#B42318]"
                  >
                    {errorMessage}
                  </div>
                )}

                <label htmlFor="signin-email" className={fieldBox}>
                  <span className={fieldLabel}>Email Address</span>
                  <input
                    id="signin-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    inputMode="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    aria-invalid={hasError}
                    aria-describedby={hasError ? "signin-error" : undefined}
                    className={fieldInput}
                  />
                </label>

                <div className="relative mt-2.5">
                  <label htmlFor="signin-password" className={fieldBox}>
                    <span className={fieldLabel}>Password</span>
                    <input
                      id="signin-password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      aria-invalid={hasError}
                      aria-describedby={hasError ? "signin-error" : undefined}
                      className={fieldInput + " pr-10"}
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    aria-pressed={showPassword}
                    className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-navy/60 hover:text-navy focus-visible:outline-2 focus-visible:outline-[#08457E]"
                  >
                    {showPassword ? (
                      <EyeOff size={18} aria-hidden="true" />
                    ) : (
                      <Eye size={18} aria-hidden="true" />
                    )}
                  </button>
                </div>

                <div className="mt-2 flex h-[18px] items-center justify-between gap-4">
                  <label className="flex cursor-pointer items-center gap-2 text-xs text-navy/80">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="h-4 w-4 accent-[#08457E]"
                    />
                    Remember me
                  </label>

                  <Link
                    to="/forgot-password"
                    className="text-xs font-bold text-navy hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#08457E]"
                  >
                    Forgot Password?
                  </Link>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  aria-busy={isSubmitting}
                  className="mt-2.5 flex h-[45px] w-full items-center justify-center gap-2 rounded-xl bg-navy text-sm font-bold text-white transition hover:bg-navy/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#08457E] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2
                        size={18}
                        className="animate-spin motion-reduce:animate-none"
                        aria-hidden="true"
                      />
                      Signing in…
                    </>
                  ) : (
                    "Login"
                  )}
                </button>
              </form>

              <p className="mt-2.5 text-center text-xs leading-4 text-navy/75">
                Don’t have an account?{" "}
                <Link
                  to="/signup"
                  className="ml-1 font-extrabold uppercase text-[#0B7A8A] hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#08457E]"
                >
                  Sign up
                </Link>
              </p>

              <p className="mt-6 text-center text-[11px] leading-[14px] text-navy/65">
                <Link to="/privacy" className="hover:underline">
                  Privacy and Policy
                </Link>
                {" - "}
                <Link to="/terms" className="hover:underline">
                  Terms of Conditions
                </Link>
              </p>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

export default SignInPage;