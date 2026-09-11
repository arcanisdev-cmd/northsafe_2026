import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import ndrrmcBg from "../assets/ndrrmc.png";
import LoginNavbar from "../layouts/LoginNavbar";
import HotlinesPanel from "../components/HotlinesPanel";

function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const apiBaseUrl =
    import.meta.env.VITE_API_URL ?? "http://localhost:8000";

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

      if (rememberMe) {
        localStorage.setItem("northsafe_token", data.token);
        localStorage.setItem(
          "northsafe_user",
          JSON.stringify(data.user)
        );
      } else {
        sessionStorage.setItem(
          "northsafe_token",
          data.token
        );
        sessionStorage.setItem(
          "northsafe_user",
          JSON.stringify(data.user)
        );
      }

      navigate("/dashboard");
    } catch {
      setErrorMessage(
        "Unable to reach the authentication server."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignUp = () => {
    console.log("Google sign up clicked");
  };

  const labelClass =
    "font-inter text-[13px] font-medium text-[#1C1C1C]";

  const inputClass =
    "mt-1 h-11 w-full rounded-[5px] border border-gray-300 px-4 text-[15px] outline-none transition-shadow duration-150 focus:ring-2 focus:ring-teal";

  return (
    <div className="min-h-screen overflow-x-hidden">
      <LoginNavbar />

      <div className="mx-auto w-full max-w-[1532px] lg:relative lg:h-[793px]">
        {/* Emergency Hotlines */}
        <div className="relative min-h-[520px] w-full overflow-hidden sm:min-h-[560px] lg:absolute lg:inset-y-0 lg:left-0 lg:h-auto lg:w-[68.28%]">
          <img
            src={ndrrmcBg}
            alt="NDRRMC operations center"
            className="absolute inset-0 h-full w-full object-cover"
          />

          <div className="absolute inset-0 bg-navy/80" />

          <div className="relative z-10 flex h-full flex-col items-center justify-center gap-4 px-5 py-10 sm:px-8 sm:py-12 lg:-translate-x-[52px] lg:px-6 lg:py-8">
            <h2
              className="text-center text-[28px] font-bold leading-none tracking-wide text-[#D30004] sm:text-[32px] lg:text-[36px]"
              style={{
                fontFamily: "'Montserrat', sans-serif",
              }}
            >
              EMERGENCY HOTLINES
            </h2>

            <p
              className="-mt-2 text-[12px] text-white sm:text-[13px]"
              style={{
                fontFamily: "'Montserrat', sans-serif",
                fontWeight: 500,
              }}
            >
              Automatic Dials
            </p>

            <div className="w-full max-w-[566px]">
              <HotlinesPanel />
            </div>
          </div>
        </div>

        {/* Sign In Form */}
        <div className="relative w-full bg-white lg:absolute lg:inset-y-0 lg:left-[56.2%] lg:z-10 lg:w-[43.8%] lg:bg-transparent">
          {/* Torn edge - desktop only */}
          <svg
            className="absolute inset-0 hidden h-full w-full lg:block"
            viewBox="0 0 671 711"
            preserveAspectRatio="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              fill="white"
              d="M24.2205 0H335.497V711H31.6959L21.5293 668.414L16.446 663.6L20.0342 640.641L25.1175 618.237L30.2008 611.016L18.5391 590.278L20.0342 574.725L7.77445 532.88L21.2303 514.179L16.1469 501.958L20.3332 487.702L16.1469 465.668V444.375L20.4827 422.249L30.2008 411.973L34.3871 406.603L37.6762 396.975L38.5733 376.608L31.3969 355.13L30.4998 310.739L26.0146 288.658L35.2841 278.475L30.4998 265.144L35.2841 222.004L33.49 202.931L26.9116 194.599L10.4656 198.304L10.7646 181.456L7.32594 171.176L8.07351 156.641L3.28919 145.717L3.28919 136.83L5.08333 129.424L10.1666 119.61V116.281L0 109.241L5.08333 103.688L1.7941 93.1354L5.68136 89.0584L1.7941 84.2479L10.1666 77.025L7.40067 69.8492L8.07351 64.0652L14.9509 57.9521L18.2401 48.6979L23.9214 24.6264L21.5293 12.9598L24.2205 0Z"
            />

            <path
              fillRule="evenodd"
              clipRule="evenodd"
              fill="white"
              d="M646.78 711H335.503V0H639.305L649.471 42.5848L654.554 47.4L650.966 70.3571L645.883 92.7639L640.8 99.9821L652.461 120.72L650.966 136.275L663.226 178.122L649.77 196.823L654.853 209.04L650.667 223.297L654.853 245.332V266.625L650.517 288.751L640.8 299.027L636.613 304.397L633.324 314.025L632.427 334.392L639.604 355.87L640.501 400.262L644.986 422.342L635.716 432.525L640.501 445.856L635.716 488.998L637.51 508.069L644.089 516.401L660.535 512.698L660.235 529.547L663.674 539.823L662.927 554.358L667.711 565.282V574.17L665.917 581.576L660.834 591.389V594.722L671 601.758L665.917 607.313L669.206 617.867L665.319 621.94L669.206 626.754L660.834 633.975L663.6 641.15L662.927 646.936L656.049 653.046L652.76 662.304L647.079 686.374L649.471 698.039L646.78 711Z"
            />
          </svg>

          <div className="relative z-10 flex min-h-full items-center justify-center px-5 py-10 sm:px-8 sm:py-12 lg:h-full lg:px-6 lg:py-0">
            <div className="mx-auto w-full max-w-[500px]">
              <form
                onSubmit={handleSubmit}
                className="w-full"
              >
                <p
                  className="text-center font-inter text-base font-semibold sm:text-lg"
                  style={{ color: "#0BA6DF" }}
                >
                  Welcome back to
                </p>

                <h1
                  className="text-center font-inter text-[32px] font-black sm:text-4xl"
                  style={{ color: "#081435" }}
                >
                  NORTHSAFE
                </h1>

                <button
                  type="button"
                  onClick={handleGoogleSignUp}
                  className="mt-6 flex h-[46px] w-full items-center justify-center gap-2 rounded-lg border border-[#969696] text-[15px] font-semibold shadow-sm transition-transform duration-150 active:scale-[0.99]"
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 18 18"
                  >
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

                  Sign Up with Google
                </button>

                {/* Email */}
                <div className="mt-5">
                  <label className={labelClass}>
                    Email Address
                  </label>

                  <input
                    type="email"
                    value={email}
                    onChange={(e) =>
                      setEmail(e.target.value)
                    }
                    placeholder="example.you@gmail.com"
                    className={inputClass}
                  />
                </div>

                {errorMessage && (
                  <p className="mt-4 text-sm font-medium text-[#D30004]">
                    {errorMessage}
                  </p>
                )}

                {/* Password */}
                <div className="mt-4">
                  <label className={labelClass}>
                    Password
                  </label>

                  <div className="relative mt-1">
                    <input
                      type={
                        showPassword
                          ? "text"
                          : "password"
                      }
                      value={password}
                      onChange={(e) =>
                        setPassword(e.target.value)
                      }
                      className="h-11 w-full rounded-[5px] border border-gray-300 px-4 pr-11 text-[15px] outline-none transition-shadow duration-150 focus:ring-2 focus:ring-teal"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(!showPassword)
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                    >
                      {showPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>
                </div>

                {/* Remember / Forgot */}
                <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <label className="flex items-center gap-2 text-[13px] text-gray-600">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) =>
                        setRememberMe(e.target.checked)
                      }
                      className="h-4 w-4"
                    />

                    Remember me
                  </label>

                  <Link
                    to="/forgot-password"
                    className="text-[13px] font-semibold"
                    style={{ color: "#0BA6DF" }}
                  >
                    Forgot Password?
                  </Link>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="mt-6 h-11 w-full rounded-[10px] font-inter text-sm font-bold tracking-widest text-white transition-transform duration-150 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                  style={{ backgroundColor: "#081435" }}
                >
                  {isSubmitting
                    ? "SIGNING IN..."
                    : "SIGN IN"}
                </button>

                {/* Sign Up */}
                <p className="mt-4 text-center font-inter text-[13px] text-gray-500">
                  Don't have an account?{" "}
                  <Link
                    to="/signup"
                    className="font-bold underline"
                    style={{ color: "#0BA6DF" }}
                  >
                    SIGN UP
                  </Link>
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignInPage;