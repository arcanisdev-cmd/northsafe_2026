import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, Eye, EyeOff, Check } from "lucide-react";
import Button from "../components/Button";
import TermsModal from "../components/TermsModal";
import BarangaySelect from "../components/BarangaySelect";
import Footer from "../layouts/Footer";

function SignupPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    email: "",
    phone: "",
    barangay: "",
    companyWebsite: "", // honeypot — real users never see or fill this
  });
  const [touched, setTouched] = useState({});
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);

  const requirements = [
    { label: "8+ characters", met: password.length >= 8 },
    { label: "Uppercase (A-Z)", met: /[A-Z]/.test(password) },
    { label: "Lowercase (a-z)", met: /[a-z]/.test(password) },
    { label: "Number (0-9)", met: /[0-9]/.test(password) },
    { label: "Special character", met: /[^A-Za-z0-9]/.test(password) },
  ];
  const allRequirementsMet = requirements.every((req) => req.met);
  const passwordsMatch = password.length > 0 && password === confirmPassword;

  function formatPhone(raw) {
    const digits = raw.replace(/\D/g, "").slice(0, 10);
    const part1 = digits.slice(0, 3);
    const part2 = digits.slice(3, 6);
    const part3 = digits.slice(6, 10);
    return [part1, part2, part3].filter(Boolean).join(" ");
  }

  function validate(field, value) {
    switch (field) {
      case "firstName":
        return value.trim() ? "" : "First name is required";
      case "lastName":
        return value.trim() ? "" : "Last name is required";
      case "middleName":
        return "";
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
    if (key === "companyWebsite") return acc; // honeypot has no visible error state
    acc[key] = validate(key, formData[key]);
    return acc;
  }, {});

  const handleChange = (field) => (e) => {
    let value = e.target.value;

    if (["firstName", "middleName", "lastName"].includes(field)) {
      value = value.replace(/[^A-Za-zÀ-ÿ'\-\s]/g, "");
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

  const allFieldsValid = Object.values(errors).every((err) => err === "");
  const isBot = formData.companyWebsite.length > 0;
  const canSubmit = termsAgreed && allRequirementsMet && passwordsMatch && allFieldsValid && !isBot;

  const inputClass = (field) =>
    `w-full h-11 mt-1 px-4 border rounded-lg text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-teal ${
      touched[field] && errors[field] ? "border-[#D30004]" : "border-gray-300"
    }`;

  return (
    <div className="overflow-x-hidden min-h-screen bg-gradient-to-b from-[#EAF0FB] to-white">
      <div className="relative max-w-[1532px] mx-auto" style={{ minHeight: "946px" }}>

        {/* Top bar */}
        <div className="absolute top-0 left-0 right-0 h-16 flex items-center justify-between px-[38px]">
          <Link to="/" className="flex items-center gap-2 font-roboto font-bold text-base text-navy">
            <ChevronLeft size={20} />
            Back to Home
          </Link>
          <Button variant="navy" className="w-[117px] h-[46.29px] shadow-md">
            Sign In
          </Button>
        </div>

        {/* Combined card */}
        <div
          className="absolute left-[86px] top-[100px] w-[1339px] h-[785px] rounded-[30px] overflow-hidden flex shadow-lg"
          style={{ border: "0.25px solid #999999" }}
        >
          {/* Left half — photo/branding */}
          <div
            className="w-[591px] h-full shrink-0"
            style={{ background: "linear-gradient(180deg, #081435 0%, #0B1E3D 100%)" }}
          >
            {/* Logo, headline, background photo — still pending */}
          </div>

          {/* Right half — form */}
          <div className="flex-1 h-full bg-white relative overflow-y-auto">
            <form className="mx-auto w-[596px] mt-[46px] pb-10">

              <div className="text-center">
                <h2 className="font-inter font-black text-2xl text-[#042545]">Join Northsafe</h2>
                <p className="font-inter font-semibold text-xs text-[#5C5C5C] mt-2" style={{ letterSpacing: "-1%" }}>
                  Already have an account?{" "}
                  <Link to="/signin" className="font-inter font-extrabold text-[13px] text-[#0BA6DF]" style={{ letterSpacing: "12%" }}>
                    SIGN IN
                  </Link>
                </p>
              </div>

              {/* Honeypot — invisible to real users, catches bots */}
              <div style={{ position: "absolute", left: "-9999px", top: "-9999px" }} aria-hidden="true">
                <label htmlFor="companyWebsite">Website</label>
                <input
                  id="companyWebsite"
                  type="text"
                  name="companyWebsite"
                  tabIndex={-1}
                  autoComplete="off"
                  value={formData.companyWebsite}
                  onChange={handleChange("companyWebsite")}
                />
              </div>

              {/* Name row */}
              <div className="flex gap-5 mt-8">
                <div className="flex-1">
                  <label htmlFor="firstName" className="font-inter text-sm text-[#1C1C1C]">
                    First Name <span className="text-[#D30004]">*</span>
                  </label>
                  <input
                    id="firstName"
                    type="text"
                    placeholder="Juan"
                    value={formData.firstName}
                    onChange={handleChange("firstName")}
                    onBlur={handleBlur("firstName")}
                    aria-invalid={touched.firstName && !!errors.firstName}
                    aria-describedby="firstName-error"
                    className={inputClass("firstName")}
                  />
                  <p id="firstName-error" className="text-xs text-[#D30004] min-h-[14px]">
                    {touched.firstName && errors.firstName ? errors.firstName : ""}
                  </p>
                </div>

                <div className="flex-1">
                  <label htmlFor="middleName" className="font-inter text-sm text-[#1C1C1C]">Middle Name</label>
                  <input
                    id="middleName"
                    type="text"
                    placeholder="Santos"
                    value={formData.middleName}
                    onChange={handleChange("middleName")}
                    onBlur={handleBlur("middleName")}
                    className={inputClass("middleName")}
                  />
                  <p className="text-xs text-[#D30004] min-h-[14px]"></p>
                </div>

                <div className="flex-1">
                  <label htmlFor="lastName" className="font-inter text-sm text-[#1C1C1C]">
                    Last Name <span className="text-[#D30004]">*</span>
                  </label>
                  <input
                    id="lastName"
                    type="text"
                    placeholder="Dela Cruz"
                    value={formData.lastName}
                    onChange={handleChange("lastName")}
                    onBlur={handleBlur("lastName")}
                    aria-invalid={touched.lastName && !!errors.lastName}
                    aria-describedby="lastName-error"
                    className={inputClass("lastName")}
                  />
                  <p id="lastName-error" className="text-xs text-[#D30004] min-h-[14px]">
                    {touched.lastName && errors.lastName ? errors.lastName : ""}
                  </p>
                </div>
              </div>

              {/* Email + Phone row */}
              <div className="flex gap-5 mt-4">
                <div className="flex-1">
                  <label htmlFor="email" className="font-inter font-medium text-sm text-[#1C1C1C]">
                    Email Address <span className="text-[#D30004]">*</span>
                  </label>
                  <input
                    id="email"
                    type="email"
                    placeholder="example@gmail.com"
                    value={formData.email}
                    onChange={handleChange("email")}
                    onBlur={handleBlur("email")}
                    aria-invalid={touched.email && !!errors.email}
                    aria-describedby="email-error"
                    className={inputClass("email")}
                  />
                  <p id="email-error" className="text-xs text-[#D30004] min-h-[14px]">
                    {touched.email && errors.email ? errors.email : ""}
                  </p>
                </div>

                <div className="flex-1">
                  <label htmlFor="phone" className="font-inter font-medium text-sm text-[#1C1C1C]">
                    Phone Number <span className="text-[#D30004]">*</span>
                  </label>
                  <div className="flex mt-1">
                    <span className="flex items-center px-3 h-11 border border-gray-300 rounded-l-lg bg-gray-50 text-sm text-[#1C1C1C]">
                      +63
                    </span>
                    <input
                      id="phone"
                      type="tel"
                      placeholder="9XX XXX XXXX"
                      value={formData.phone}
                      onChange={handleChange("phone")}
                      onBlur={handleBlur("phone")}
                      aria-invalid={touched.phone && !!errors.phone}
                      aria-describedby="phone-error"
                      className={`flex-1 h-11 px-4 border border-l-0 rounded-r-lg text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-teal ${
                        touched.phone && errors.phone ? "border-[#D30004]" : "border-gray-300"
                      }`}
                    />
                  </div>
                  <p id="phone-error" className="text-xs text-[#D30004] min-h-[14px]">
                    {touched.phone && errors.phone ? errors.phone : ""}
                  </p>
                </div>
              </div>

              {/* Barangay */}
              <div className="mt-4">
                <BarangaySelect
                  value={formData.barangay}
                  onChange={(val) => setFormData((prev) => ({ ...prev, barangay: val }))}
                  onBlur={handleBlur("barangay")}
                  error={errors.barangay}
                  touched={touched.barangay}
                />
              </div>

              {/* Password + Confirm Password row */}
              <div className="flex gap-5 mt-4">
                <div className="flex-1">
                  <label htmlFor="password" className="font-inter font-medium text-sm text-[#1C1C1C]">
                    Password <span className="text-[#D30004]">*</span>
                  </label>
                  <div className="relative mt-1">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Create a password"
                      className="w-full h-11 px-4 pr-11 border border-gray-300 rounded-lg text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-teal"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="flex-1">
                  <label htmlFor="confirmPassword" className="font-inter font-medium text-sm text-[#1C1C1C]">
                    Confirm Password <span className="text-[#D30004]">*</span>
                  </label>
                  <div className="relative mt-1">
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter password"
                      className="w-full h-11 px-4 pr-11 border border-gray-300 rounded-lg text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-teal"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              </div>

              <p className="text-xs text-[#D30004] min-h-[14px]">
                {!passwordsMatch && confirmPassword.length > 0 ? "Passwords do not match." : ""}
              </p>

              {/* Live requirement checklist */}
              <div className="grid grid-cols-2 gap-x-6 gap-y-2 mt-1">
                {requirements.map((req) => (
                  <div key={req.label} className="flex items-center gap-2">
                    <span
                      className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        req.met ? "bg-teal border-teal" : "border-gray-300"
                      }`}
                    >
                      {req.met && <Check size={10} className="text-white" />}
                    </span>
                    <span className={`text-xs ${req.met ? "text-navy" : "text-gray-400"}`}>{req.label}</span>
                  </div>
                ))}
              </div>

              {/* Terms checkbox */}
              <div className="flex items-center gap-2 mt-5">
                <input
                  type="checkbox"
                  id="terms"
                  checked={termsAgreed}
                  onChange={(e) => setTermsAgreed(e.target.checked)}
                  className="w-4 h-4"
                />
                <label htmlFor="terms" className="text-sm text-[#1C1C1C]">
                  I agree with the{" "}
                  <button
                    type="button"
                    onClick={() => setIsTermsModalOpen(true)}
                    className="text-[#D30004] font-medium underline"
                  >
                    Terms and Condition and Privacy Policy
                  </button>
                </label>
              </div>

              {/* Google (alternative) + Create Account */}
              <div className="flex gap-4 mt-5">
                <button
                  type="button"
                  className="flex-1 h-12 flex items-center justify-center border border-gray-300 rounded-lg"
                >
                  <svg width="18" height="18" viewBox="0 0 18 18">
                    <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 01-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62z" />
                    <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 009 18z" />
                    <path fill="#FBBC05" d="M3.97 10.72A5.4 5.4 0 013.68 9c0-.6.1-1.18.29-1.72V4.95H.96A9 9 0 000 9c0 1.45.35 2.83.96 4.05l3.01-2.33z" />
                    <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 00.96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58z" />
                  </svg>
                </button>

                <button
                  type="submit"
                  disabled={!canSubmit}
                  className="flex-1 h-12 rounded-lg bg-[#4A90D9] text-white font-inter font-bold text-sm disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  CREATE AN ACCOUNT
                </button>
              </div>

            </form>
          </div>
        </div>

      </div>

      <Footer />

      <TermsModal
        isOpen={isTermsModalOpen}
        onClose={() => setIsTermsModalOpen(false)}
        onAgree={handleAgree}
      />
    </div>
  );
}

export default SignupPage;