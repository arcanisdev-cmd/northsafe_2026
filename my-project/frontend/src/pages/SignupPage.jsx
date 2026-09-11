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
  const apiBaseUrl = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

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
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const requirements = [
    { label: "8+ characters", met: password.length >= 8 },
    { label: "Uppercase (A-Z)", met: /[A-Z]/.test(password) },
    { label: "Lowercase (a-z)", met: /[a-z]/.test(password) },
    { label: "Number (0-9)", met: /[0-9]/.test(password) },
    { label: "Special character", met: /[^A-Za-z0-9]/.test(password) },
  ];

  const allRequirementsMet = requirements.every((r) => r.met);
  const passwordsMatch =
    password.length > 0 && password === confirmPassword;

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
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
          ? ""
          : "Enter a valid email address";

      case "phone":
        return /^9\d{2} \d{3} \d{4}$/.test(value)
          ? ""
          : "Enter a valid 10-digit mobile number";

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

    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleBlur = (field) => () => {
    setTouched((prev) => ({
      ...prev,
      [field]: true,
    }));
  };

  const handleAgree = () => {
    setTermsAgreed(true);
    setIsTermsModalOpen(false);
  };

  const allFieldsValid = Object.values(errors).every(
    (e) => e === ""
  );

  const isBot = formData.companyWebsite.length > 0;

  const canSubmit =
    termsAgreed &&
    allRequirementsMet &&
    passwordsMatch &&
    allFieldsValid &&
    !isBot;

  const inputClass = (field) =>
    "mt-1 h-11 w-full rounded-[5px] border px-3 text-[15px] outline-none transition-shadow duration-150 focus:ring-2 focus:ring-teal " +
    (touched[field] && errors[field]
      ? "border-[#D30004]"
      : "border-gray-300");

  const labelClass =
    "font-inter text-[13px] font-medium text-[#1C1C1C]";

  async function handleSubmit(e) {
    e.preventDefault();

    if (!canSubmit || isSubmitting) return;

    setSubmitError("");
    setIsSubmitting(true);

    try {
      const response = await fetch(`${apiBaseUrl}/api/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          middleName: formData.middleName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          barangay: formData.barangay,
          companyWebsite: formData.companyWebsite,
          password,
          password_confirmation: confirmPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setSubmitError(
          data?.message ?? "Unable to create your account."
        );
        return;
      }

      localStorage.setItem("northsafe_token", data.token);
      localStorage.setItem(
        "northsafe_user",
        JSON.stringify(data.user)
      );

      navigate("/dashboard");
    } catch {
      setSubmitError(
        "Unable to reach the authentication server."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen overflow-x-hidden">
      <LoginNavbar />

      <div className="mx-auto w-full max-w-[1532px] lg:relative lg:h-[793px]">
        {/* Emergency Hotlines */}
        <div className="relative h-auto min-h-[520px] w-full overflow-hidden sm:min-h-[560px] lg:absolute lg:inset-y-0 lg:left-0 lg:h-auto lg:w-[68.28%]">
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

        {/* Form Panel */}
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
                <h1
                  className="text-center font-inter text-2xl font-black"
                  style={{ color: "#028C95" }}
                >
                  JOIN NORTHSAFE
                </h1>

                <button
                  type="button"
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

                <div className="mt-5 flex items-center gap-3">
                  <div className="h-px flex-1 bg-gray-200" />

                  <span className="whitespace-nowrap font-inter text-[10px] font-black text-[#C2C2C2] sm:text-[12px]">
                    OR COMPLETE THE FORM
                  </span>

                  <div className="h-px flex-1 bg-gray-200" />
                </div>

                {submitError && (
                  <p className="mt-4 text-sm font-medium text-[#D30004]">
                    {submitError}
                  </p>
                )}

                <div
                  className="absolute left-[-9999px] top-[-9999px]"
                  aria-hidden="true"
                >
                  <input
                    type="text"
                    tabIndex={-1}
                    autoComplete="off"
                    value={formData.companyWebsite}
                    onChange={handleChange("companyWebsite")}
                  />
                </div>

                {/* Name */}
                <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div>
                    <label className={labelClass}>
                      First Name{" "}
                      <span className="text-[#D30004]">*</span>
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
                      Middle Name{" "}
                      <span className="text-[#D30004]">*</span>
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
                      Last Name{" "}
                      <span className="text-[#D30004]">*</span>
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

                {/* Email + Phone */}
                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className={labelClass}>
                      Email Address{" "}
                      <span className="text-[#D30004]">*</span>
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
                      Phone Number{" "}
                      <span className="text-[#D30004]">*</span>
                    </label>

                    <div className="mt-1 flex">
                      <span className="flex h-11 shrink-0 items-center rounded-l-[5px] border border-gray-300 bg-gray-50 px-3 text-[15px]">
                        +63
                      </span>

                      <input
                        type="tel"
                        placeholder="9XX XXX XXXX"
                        value={formData.phone}
                        onChange={handleChange("phone")}
                        onBlur={handleBlur("phone")}
                        className="h-11 min-w-0 flex-1 rounded-r-[5px] border border-l-0 border-gray-300 px-3 text-[15px] outline-none focus:ring-2 focus:ring-teal"
                      />
                    </div>
                  </div>
                </div>

                {/* Barangay */}
                <div className="mt-4">
                  <BarangaySelect
                    value={formData.barangay}
                    onChange={(val) =>
                      setFormData((prev) => ({
                        ...prev,
                        barangay: val,
                      }))
                    }
                    onBlur={() => setBarangayTouched(true)}
                    error={errors.barangay}
                    touched={barangayTouched}
                  />
                </div>

                {/* Passwords */}
                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="relative">
                    <label className={labelClass}>
                      Password{" "}
                      <span className="text-[#D30004]">*</span>
                    </label>

                    <div className="relative mt-1">
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Minimum of 8 characters"
                        value={password}
                        onChange={(e) =>
                          setPassword(e.target.value)
                        }
                        onFocus={() =>
                          setPasswordFocused(true)
                        }
                        onBlur={() =>
                          setPasswordFocused(false)
                        }
                        className="h-11 w-full rounded-[5px] border border-gray-300 px-3 pr-10 text-[15px] outline-none transition-shadow duration-150 focus:ring-2 focus:ring-teal"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setShowPassword(!showPassword)
                        }
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400"
                      >
                        {showPassword ? (
                          <EyeOff size={16} />
                        ) : (
                          <Eye size={16} />
                        )}
                      </button>
                    </div>

                    <div
                      className={
                        "absolute left-0 top-full z-20 mt-1.5 w-full rounded-lg border border-gray-200 bg-white p-3 shadow-lg transition-all duration-150 sm:w-[240px] " +
                        (passwordFocused && password.length > 0
                          ? "translate-y-0 opacity-100 pointer-events-auto"
                          : "-translate-y-1 pointer-events-none opacity-0")
                      }
                    >
                      <div className="grid grid-cols-1 gap-1">
                        {requirements.map((r) => (
                          <div
                            key={r.label}
                            className="flex items-center gap-1.5"
                          >
                            <span
                              className="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full border transition-colors duration-150"
                              style={{
                                backgroundColor: r.met
                                  ? "#0BA6DF"
                                  : "transparent",
                                borderColor: r.met
                                  ? "#0BA6DF"
                                  : "#D1D5DB",
                              }}
                            >
                              {r.met && (
                                <Check
                                  size={9}
                                  className="text-white"
                                />
                              )}
                            </span>

                            <span
                              className="text-[11px]"
                              style={{
                                color: r.met
                                  ? "#0BA6DF"
                                  : "#9CA3AF",
                              }}
                            >
                              {r.label}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>
                      Confirm Password{" "}
                      <span className="text-[#D30004]">*</span>
                    </label>

                    <div className="relative mt-1">
                      <input
                        type={
                          showConfirmPassword
                            ? "text"
                            : "password"
                        }
                        value={confirmPassword}
                        onChange={(e) =>
                          setConfirmPassword(e.target.value)
                        }
                        className="h-11 w-full rounded-[5px] border border-gray-300 px-3 pr-10 text-[15px] outline-none transition-shadow duration-150 focus:ring-2 focus:ring-teal"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(
                            !showConfirmPassword
                          )
                        }
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400"
                      >
                        {showConfirmPassword ? (
                          <EyeOff size={16} />
                        ) : (
                          <Eye size={16} />
                        )}
                      </button>
                    </div>

                    {!passwordsMatch &&
                      confirmPassword.length > 0 && (
                        <p className="mt-1 text-[11px] text-[#D30004]">
                          Passwords do not match.
                        </p>
                      )}
                  </div>
                </div>

                {/* Terms */}
                <div className="mt-5 flex items-start gap-2">
                  <input
                    type="checkbox"
                    checked={termsAgreed}
                    readOnly
                    onClick={() => {
                      if (!termsAgreed) {
                        setIsTermsModalOpen(true);
                      }
                    }}
                    className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer"
                  />

                  <label className="font-inter text-[13px] leading-snug text-[#1C1C1C]">
                    I agree with the{" "}
                    <button
                      type="button"
                      onClick={() =>
                        setIsTermsModalOpen(true)
                      }
                      className="font-medium underline"
                      style={{ color: "#46B5FF" }}
                    >
                      Terms and Condition
                    </button>{" "}
                    and{" "}
                    <button
                      type="button"
                      onClick={() =>
                        setIsTermsModalOpen(true)
                      }
                      className="font-medium underline"
                      style={{ color: "#46B5FF" }}
                    >
                      Privacy Policy
                    </button>
                  </label>
                </div>

                {/* Actions */}
                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:gap-4">
                  <Link
                    to="/signin"
                    className="flex h-11 w-full items-center justify-center rounded-[10px] text-sm font-bold transition-transform duration-150 active:scale-[0.98] sm:flex-1"
                    style={{
                      backgroundColor: "#B2B2B2",
                      color: "#1C1C1C",
                      fontFamily: "Roboto, sans-serif",
                    }}
                  >
                    SIGN IN
                  </Link>

                  <button
                    type="submit"
                    disabled={!canSubmit || isSubmitting}
                    className="h-11 w-full rounded-[10px] text-sm font-bold text-white transition-all duration-150 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 disabled:active:scale-100 sm:flex-1"
                    style={{
                      backgroundColor: "#10245B",
                      fontFamily: "Roboto, sans-serif",
                    }}
                  >
                    {isSubmitting
                      ? "CREATING..."
                      : "CREATE AN ACCOUNT"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <TermsModal
        isOpen={isTermsModalOpen}
        onClose={() => setIsTermsModalOpen(false)}
        onAgree={handleAgree}
      />
    </div>
  );
}

export default SignupPage;