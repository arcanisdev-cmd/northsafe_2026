import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import NavBar from "../layouts/NavBar";
import ndrrmcBg from "../assets/ndrrmc.png";
import phoneMockup from "../assets/phone-mockup.png";

const steps = [
  {
    number: 1,
    title: "Log In",
    description: (
      <>
        Sign in or{" "}
        <Link to="/signup" className="underline font-semibold">
          create your NORTHSAFE account
        </Link>
        .
      </>
    ),
  },
  { number: 2, title: "Report", description: "Add the hazard details, location, and photo." },
  { number: 3, title: "Submit", description: "AI analyzes your report and sends it for verification." },
  { number: 4, title: "Track", description: "Follow your report's status and receive updates." },
];

function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // Backend integration point:
    // await fetch("/api/login", { method: "POST", body: JSON.stringify({ email, password }) });
    console.log("Signing in:", { email, password, rememberMe });
    navigate("/dashboard");
  };

  return (
    <div className="overflow-x-hidden">
      <NavBar />

      <div className="relative flex" style={{ height: "750px" }}>
        {/* Left panel — photo, fills the full width behind everything */}
        <div className="absolute inset-0 overflow-hidden">
          <img
            src={ndrrmcBg}
            alt="NDRRMC operations center"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-navy/75" />
        </div>

        {/* Real SVG shape, drawn exactly as exported from Figma — this IS the white panel */}
        <svg
          className="absolute right-0 top-0"
          width="490"
          height="750"
          viewBox="0 0 490 750"
          style={{ overflow: "visible" }}
        >
          <path
            fill="white"
            d="M35.3742 0H489.996V750H46.292L31.4436 705.078L24.0195 700L29.2601 675.781L36.6842 652.148L44.1085 644.531L27.0765 622.656L29.2601 606.25L11.3546 562.11L31.007 542.383L23.5827 529.492L29.6968 514.453L23.5827 491.211V468.75L29.9152 445.41L44.1085 434.57L50.2226 428.906L55.0264 418.75L56.3366 397.266L45.8554 374.61L44.5452 327.783L37.9945 304.492L51.5326 293.75L44.5452 279.688L51.5326 234.182L48.9123 214.062L39.3046 205.273L15.2851 209.182L15.7218 191.409L10.6996 180.565L11.7914 165.233L4.80388 153.71V144.335L7.42423 136.523L14.8484 126.171V122.659L0 115.233L7.42423 109.375L2.62029 98.2441L8.29767 93.9435L2.62029 88.8691L14.8484 81.25L10.8087 73.6806L11.7914 67.5793L21.8359 61.131L26.6398 51.3691L34.9374 25.9772L31.4436 13.6707L35.3742 0Z"
          />
        </svg>

        {/* Left content — headline, steps, phone mockup */}
        <div className="relative z-10 flex items-center h-full pl-16 gap-10" style={{ width: "calc(100% - 490px)" }}>
          <img
            src={phoneMockup}
            alt="NorthSafe app preview"
            className="object-contain shrink-0"
            style={{ width: "200px", height: "auto" }}
          />

          <div className="min-w-0">
            <h2 className="font-inter font-bold text-3xl text-[#0BA6DF] mb-8 leading-tight">
              Build a safer North Caloocan together.
            </h2>

            <div className="flex flex-col gap-6">
              {steps.map((step) => (
                <div key={step.number} className="flex gap-4">
                  <span className="font-inter font-extrabold text-3xl text-white shrink-0" style={{ width: "32px" }}>
                    {step.number}
                  </span>
                  <div className="min-w-0">
                    <p className="font-inter font-bold text-sm text-white uppercase tracking-wide">
                      {step.title}
                    </p>
                    <p className="font-inter text-sm text-white/90 mt-1">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right content — sign-in form, positioned over the SVG's solid white area */}
        <div
          className="absolute right-0 top-0 h-full flex items-center z-10"
          style={{ width: "490px" }}
        >
          <form onSubmit={handleSubmit} className="w-full px-12 pl-20">
            <p className="font-inter font-semibold text-lg text-center" style={{ color: "#0BA6DF" }}>
              Welcome back to
            </p>
            <h1 className="font-inter font-black text-4xl text-center" style={{ color: "#081435" }}>
              NORTHSAFE
            </h1>

            <p className="font-inter text-sm text-center text-gray-500 mt-3">
              Don't have an account?{" "}
              <Link to="/signup" className="font-bold underline" style={{ color: "#0BA6DF" }}>
                SIGN UP
              </Link>
            </p>

            <label className="font-inter font-semibold text-sm text-black mt-8 block">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example.you@gmail.com"
              className="w-full h-11 mt-1.5 px-4 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-teal"
            />

            <label className="font-inter font-semibold text-sm text-black mt-4 block">
              Password
            </label>
            <div className="relative mt-1.5">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-11 px-4 pr-11 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-teal"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <div className="flex items-center justify-between mt-4">
              <label className="flex items-center gap-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4"
                />
                Remember me
              </label>
              <Link to="/forgot-password" className="text-sm font-semibold" style={{ color: "#0BA6DF" }}>
                Forgot Password?
              </Link>
            </div>

            <button
              type="submit"
              className="w-full h-12 rounded-lg text-white font-inter font-bold text-sm mt-6 tracking-widest"
              style={{ backgroundColor: "#081435" }}
            >
              SIGN IN
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default SignInPage;