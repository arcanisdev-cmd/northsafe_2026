import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Check } from "lucide-react";
import ndrrmcBg from "../assets/ndrrmc.png";
import LoginNavbar from "../layouts/LoginNavbar";
import HotlinesPanel from "../components/HotlinesPanel";
import BarangaySelect from "../components/BarangaySelect";
import TermsModal from "../components/TermsModal";
 
const NAME_FILTER = /[^A-Za-zÀ-ÿ'\-\s]/g;
 
function SignupPage() {
  const navigate = useNavigate();
 
  const [formData, setFormData] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    email: "",
    phone: "",
    barangay: "",
    companyWebsite: "",
  });
  const [touched, setTouched] = useState({});
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);
  const [barangayTouched, setBarangayTouched] = useState(false);
 
  const requirements = [
    { label: "8+ characters", met: password.length >= 8 },
    { label: "Uppercase (A-Z)", met: /[A-Z]/.test(password) },
    { label: "Lowercase (a-z)", met: /[a-z]/.test(password) },
    { label: "Number (0-9)", met: /[0-9]/.test(password) },
    { label: "Special character", met: /[^A-Za-z0-9]/.test(password) },
  ];
  const allRequirementsMet = requirements.every((r) => r.met);
  const passwordsMatch = password.length > 0 && password === confirmPassword;
 
  // Normalizes whatever the person types (09XX..., +639XX..., 639XX...) down to
  // the bare 9XXXXXXXXX shape the +63 prefix box already implies, then groups it.
  function formatPhone(raw) {
    let digits = raw.replace(/\D/g, "");
    if (digits.startsWith("63")) digits = digits.slice(2);
    if (digits.startsWith("0")) digits = digits.slice(1);
    digits = digits.slice(0, 10);
    const p1 = digits.slice(0, 3);
    const p2 = digits.slice(3, 6);
    const p3 = digits.slice(6, 10);
    return [p1, p2, p3].filter(Boolean).join(" ");
  }
 
  function validate(field, value) {
    switch (field) {
      case "firstName":
        return value.trim() ? "" : "First name is required";
      case "middleName":
        return value.trim() ? "" : "Middle name is required";
      case "lastName":
        return value.trim() ? "" : "Last name is required";
      case "email":
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? "" : "Enter a valid email address";
      case "phone":
        return /^9\d{2} \d{3} \d{4}$/.test(value) ? "" : "Enter a valid 10-digit mobile number";
      case "barangay":
        return value ? "" : "Please select your barangay";
      default:
        return "";
    }
  }
 
  const errors = Object.keys(formData).reduce((acc, key) => {
    if (key === "companyWebsite") return acc;
    acc[key] = validate(key, formData[key]);
    return acc;
  }, {});
 
  const handleChange = (field) => (e) => {
    let value = e.target.value;
    if (["firstName", "middleName", "lastName"].includes(field)) {
      value = value.replace(NAME_FILTER, "");
    }
    if (field === "phone") value = formatPhone(value);
    if (field === "email") value = value.toLowerCase();
    setFormData((prev) => ({ ...prev, [field]: value }));
  };
 
  const handleBlur = (field) => () => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };
 
  const handleAgree = () => {
    setTermsAgreed(true);
    setIsTermsModalOpen(false);
  };
 
  const allFieldsValid = Object.values(errors).every((e) => e === "");
  const isBot = formData.companyWebsite.length > 0;
  const canSubmit = termsAgreed && allRequirementsMet && passwordsMatch && allFieldsValid && !isBot;
 
  // Labels and inputs bumped up in scale (was text-[10px] / h-10 / text-sm) so
  // the form doesn't read as small/cramped against the amount of panel space
  // available to it.
  const inputClass = (field) =>
    "w-full h-11 mt-1 px-3 border rounded-[5px] text-[15px] outline-none transition-shadow duration-150 focus:ring-2 focus:ring-teal " +
    (touched[field] && errors[field] ? "border-[#D30004]" : "border-gray-300");
 
  const labelClass = "font-inter text-[13px] font-medium text-[#1C1C1C]";
 
  function handleSubmit(e) {
    e.preventDefault();
    if (!canSubmit) return;
    navigate("/dashboard");
  }
 
  return (
    <div className="overflow-x-hidden min-h-screen">
      <LoginNavbar />
 
      <div className="max-w-[1532px] mx-auto lg:relative lg:h-[793px]">
        {/* Left — Hotlines panel over photo. Fills the full container height
            (no separate top/bottom offset) so it sits flush under the navbar
            with no leftover gap above or below. */}
        <div
          className="relative w-full h-[560px] overflow-hidden lg:h-auto lg:absolute lg:inset-y-0 lg:left-0 lg:w-[68.28%]"
        >
          <img src={ndrrmcBg} alt="NDRRMC operations center" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-navy/80" />
 
          {/* lg:-translate-x-[52px] nudges the whole group (heading + list) left
              (switched to an arbitrary pixel value here since Tailwind's
              default spacing scale skips from 12 to 14 — no "13" step)
              as one unit. The panel's true visible width is narrower on the
              right than the flex container's box because the jagged torn
              overlay from the right panel eats into it — centering against
              the full box therefore reads as shifted right. This offset
              compensates so it looks centered against the visible area.
              Tweak the -translate-x value if it needs to shift further. */}
          <div className="relative z-10 flex flex-col items-center justify-center h-full px-6 py-8 gap-4 lg:-translate-x-[52px]">
            <h2
              className="text-[36px] leading-none text-[#D30004] text-center tracking-wide"
              style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 700 }}
            >
              EMERGENCY HOTLINES
            </h2>
            <p
              className="text-[13px] text-white -mt-2"
              style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 500 }}
            >
              Automatic Dials
            </p>
            <div className="w-full max-w-[566px]">
              <HotlinesPanel />
            </div>
          </div>
        </div>
 
        {/* Right — form panel, torn-edge shape from Figma, overlaps the left panel.
            Also fills the full container height to match the left panel. */}
        <div
          className="relative w-full bg-white lg:absolute lg:inset-y-0 lg:left-[56.2%] lg:w-[43.8%] lg:z-10 lg:bg-transparent"
        >
          {/* Exact torn-edge panel shape exported from Figma — desktop only.
              Both edges are intentionally jagged (matches the site's torn-paper motif). */}
          <svg
            className="hidden lg:block absolute inset-0 w-full h-full"
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
 
          {/* Container widened from max-w-[426px] and given more generous vertical
              rhythm throughout so it fills more of the panel's available height
              and width instead of floating in a sea of margin. */}
          <div className="relative z-10 h-full flex items-center justify-center px-6 py-8 lg:py-0">
            <div className="w-full max-w-[500px] mx-auto">
              <form onSubmit={handleSubmit} className="w-full">
                <h1
                  className="font-inter font-black text-2xl text-center"
                  style={{ color: "#028C95" }}
                >
                  JOIN NORTHSAFE
                </h1>
 
                <button
                  type="button"
                  className="w-full h-[46px] mt-6 flex items-center justify-center gap-2 border border-[#969696] rounded-lg text-[15px] font-semibold shadow-sm transition-transform duration-150 active:scale-[0.99]"
                >
                  <svg width="18" height="18" viewBox="0 0 18 18">
                    <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 01-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62z" />
                    <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 009 18z" />
                    <path fill="#FBBC05" d="M3.97 10.72A5.4 5.4 0 013.68 9c0-.6.1-1.18.29-1.72V4.95H.96A9 9 0 000 9c0 1.45.35 2.83.96 4.05l3.01-2.33z" />
                    <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 00.96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58z" />
                  </svg>
                  Sign Up with Google
                </button>
 
                <div className="flex items-center gap-3 mt-5">
                  <div className="flex-1 h-px bg-gray-200" />
                  <span className="font-inter font-black text-[12px] text-[#C2C2C2]">OR COMPLETE THE FORM</span>
                  <div className="flex-1 h-px bg-gray-200" />
                </div>
 
                <div style={{ position: "absolute", left: "-9999px", top: "-9999px" }} aria-hidden="true">
                  <input
                    type="text"
                    tabIndex={-1}
                    autoComplete="off"
                    value={formData.companyWebsite}
                    onChange={handleChange("companyWebsite")}
                  />
                </div>
 
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-5">
                  <div>
                    <label className={labelClass}>
                      First Name <span className="text-[#D30004]">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Juan"
                      value={formData.firstName}
                      onChange={handleChange("firstName")}
                      onBlur={handleBlur("firstName")}
                      className={inputClass("firstName")}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>
                      Middle Name <span className="text-[#D30004]">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Santos"
                      value={formData.middleName}
                      onChange={handleChange("middleName")}
                      onBlur={handleBlur("middleName")}
                      className={inputClass("middleName")}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>
                      Last Name <span className="text-[#D30004]">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Dela Cruz"
                      value={formData.lastName}
                      onChange={handleChange("lastName")}
                      onBlur={handleBlur("lastName")}
                      className={inputClass("lastName")}
                    />
                  </div>
                </div>
 
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className={labelClass}>
                      Email Address <span className="text-[#D30004]">*</span>
                    </label>
                    <input
                      type="email"
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={handleChange("email")}
                      onBlur={handleBlur("email")}
                      className={inputClass("email")}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>
                      Phone Number <span className="text-[#D30004]">*</span>
                    </label>
                    <div className="flex mt-1">
                      <span className="flex items-center px-3 h-11 border border-gray-300 rounded-l-[5px] bg-gray-50 text-[15px] shrink-0">+63</span>
                      <input
                        type="tel"
                        placeholder="9XX XXX XXXX"
                        value={formData.phone}
                        onChange={handleChange("phone")}
                        onBlur={handleBlur("phone")}
                        className="flex-1 min-w-0 h-11 px-3 border border-l-0 border-gray-300 rounded-r-[5px] text-[15px] outline-none focus:ring-2 focus:ring-teal"
                      />
                    </div>
                  </div>
                </div>
 
                <div className="mt-4">
                  <BarangaySelect
                    value={formData.barangay}
                    onChange={(val) => setFormData((prev) => ({ ...prev, barangay: val }))}
                    onBlur={() => setBarangayTouched(true)}
                    error={errors.barangay}
                    touched={barangayTouched}
                  />
                </div>
 
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                  <div className="relative">
                    <label className={labelClass}>
                      Password <span className="text-[#D30004]">*</span>
                    </label>
                    <div className="relative mt-1">
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Minimum of 8 characters"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onFocus={() => setPasswordFocused(true)}
                        onBlur={() => setPasswordFocused(false)}
                        className="w-full h-11 px-3 pr-9 border border-gray-300 rounded-[5px] text-[15px] outline-none transition-shadow duration-150 focus:ring-2 focus:ring-teal"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400"
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
 
                    {/* Floating requirement checklist — doesn't push the layout down,
                        so the buttons never move and the page never needs to scroll. */}
                    <div
                      className={
                        "absolute left-0 top-full mt-1.5 w-full sm:w-[240px] bg-white border border-gray-200 rounded-lg shadow-lg p-3 z-20 transition-all duration-150 " +
                        (passwordFocused && password.length > 0
                          ? "opacity-100 translate-y-0 pointer-events-auto"
                          : "opacity-0 -translate-y-1 pointer-events-none")
                      }
                    >
                      <div className="grid grid-cols-1 gap-1">
                        {requirements.map((r) => (
                          <div key={r.label} className="flex items-center gap-1.5">
                            <span
                              className="w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 transition-colors duration-150"
                              style={{ backgroundColor: r.met ? "#0BA6DF" : "transparent", borderColor: r.met ? "#0BA6DF" : "#D1D5DB" }}
                            >
                              {r.met && <Check size={9} className="text-white" />}
                            </span>
                            <span className="text-[11px]" style={{ color: r.met ? "#0BA6DF" : "#9CA3AF" }}>
                              {r.label}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
 
                  <div>
                    <label className={labelClass}>
                      Confirm Password <span className="text-[#D30004]">*</span>
                    </label>
                    <div className="relative mt-1">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full h-11 px-3 pr-9 border border-gray-300 rounded-[5px] text-[15px] outline-none transition-shadow duration-150 focus:ring-2 focus:ring-teal"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400"
                      >
                        {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    {!passwordsMatch && confirmPassword.length > 0 && (
                      <p className="text-[11px] text-[#D30004] mt-1">Passwords do not match.</p>
                    )}
                  </div>
                </div>
 
                <div className="flex items-start gap-2 mt-5">
                  <input
                    type="checkbox"
                    checked={termsAgreed}
                    readOnly
                    onClick={() => {
                      if (!termsAgreed) setIsTermsModalOpen(true);
                    }}
                    className="w-3.5 h-3.5 mt-0.5 cursor-pointer"
                  />
                  <label className="font-inter text-[13px] text-[#1C1C1C] leading-snug">
                    I agree with the{" "}
                    <button
                      type="button"
                      onClick={() => setIsTermsModalOpen(true)}
                      className="underline font-medium"
                      style={{ color: "#46B5FF" }}
                    >
                      Terms and Condition
                    </button>{" "}
                    and{" "}
                    <button
                      type="button"
                      onClick={() => setIsTermsModalOpen(true)}
                      className="underline font-medium"
                      style={{ color: "#46B5FF" }}
                    >
                      Privacy Policy
                    </button>
                  </label>
                </div>
 
                <div className="flex gap-4 mt-6">
                  <Link
                    to="/signin"
                    className="flex-1 h-11 rounded-[10px] flex items-center justify-center font-bold text-sm transition-transform duration-150 active:scale-[0.98]"
                    style={{ backgroundColor: "#B2B2B2", color: "#1C1C1C", fontFamily: "Roboto, sans-serif" }}
                  >
                    SIGN IN
                  </Link>
                  <button
                    type="submit"
                    disabled={!canSubmit}
                    className="flex-1 h-11 rounded-[10px] text-white font-bold text-sm transition-all duration-150 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100"
                    style={{ backgroundColor: "#10245B", fontFamily: "Roboto, sans-serif" }}
                  >
                    CREATE AN ACCOUNT
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
 
      <TermsModal isOpen={isTermsModalOpen} onClose={() => setIsTermsModalOpen(false)} onAgree={handleAgree} />
    </div>
  );
}
 
export default SignupPage;