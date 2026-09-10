import { useState, useEffect } from "react";
import { UserCheck, ClipboardList, CircleCheck, Send } from "lucide-react";

const steps = [
  { icon: UserCheck, title: "Create or Access your account", description: "Create an Account to begin the registration process." },
  { icon: ClipboardList, title: "Complete Registration Information", description: "Fill out the registration form with your required personal information." },
  { icon: CircleCheck, title: "Verify Your Account via SMS", description: "A verification code will be sent to your registered mobile number upon registration." },
  { icon: Send, title: "Submit a Hazard Report", description: "Click the Report a Hazard button to start submitting a report. Provide complete details about the hazard." },
];

function HowItWorks() {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % steps.length);
    }, 2500);
    return () => clearInterval(timer);
  }, []);

  return (
    <section
      id="how-it-works"
      className="py-24 text-center scroll-mt-[100px]"
      style={{
        background:
          "radial-gradient(circle at 15% 15%, rgba(120,80,200,0.35), transparent 45%), " +
          "radial-gradient(circle at 85% 20%, rgba(40,110,220,0.35), transparent 45%), " +
          "radial-gradient(circle at 80% 85%, rgba(30,150,180,0.25), transparent 45%), " +
          "#0A1128",
      }}
    >
      <p className="font-inter font-semibold text-xl" style={{ color: "#5EEAD4" }}>
        HOW IT WORKS
      </p>

      <h2 className="font-inter font-semibold text-4xl mt-2">
        <span className="text-white">Get started in </span>
        <span style={{ color: "#5EEAD4" }}>4 Easy Steps</span>
      </h2>

      <p
        className="font-krub font-normal text-lg mx-auto mt-4"
        style={{ maxWidth: "731px", letterSpacing: "8%", color: "rgba(255,255,255,0.75)" }}
      >
        It only requires a few minutes to begin reporting a hazard after logging in.
      </p>

      <div
        className="relative mx-auto mt-16"
        style={{ display: "grid", gridTemplateColumns: "repeat(4, 258px)", columnGap: "70px", width: "1243px" }}
      >
        <div className="absolute left-0 right-0 top-[73px] border-t-[3px] z-0" style={{ borderColor: "rgba(255,255,255,0.25)" }} />

        {steps.map((step, index) => {
          const isActive = index === activeStep;
          return (
            <div key={step.title} className="relative z-10 flex justify-center">
              <div
                className="rounded-full bg-white flex items-center justify-center transition-all duration-500"
                style={{
                  width: "146px",
                  height: "146px",
                  border: isActive ? "3px solid #5EEAD4" : "2px solid rgba(255,255,255,0.4)",
                  boxShadow: isActive ? "0 0 24px 4px rgba(94,234,212,0.5)" : "none",
                  transform: isActive ? "scale(1.08)" : "scale(1)",
                }}
              >
                <step.icon size={40} style={{ color: isActive ? "#0D9488" : "#0D0B61" }} />
              </div>
            </div>
          );
        })}
      </div>

      <div
        className="mx-auto mt-6"
        style={{ display: "grid", gridTemplateColumns: "repeat(4, 258px)", columnGap: "70px", width: "1243px" }}
      >
        {steps.map((step, index) => {
          const isActive = index === activeStep;
          return (
            <div key={step.title}>
              <h3
                className="font-krub font-bold italic text-base transition-colors duration-500"
                style={{ letterSpacing: "8%", color: isActive ? "#5EEAD4" : "#FFFFFF" }}
              >
                {step.title}
              </h3>
              <p
                className="font-krub font-normal text-base mt-2"
                style={{ letterSpacing: "8%", color: "rgba(255,255,255,0.7)" }}
              >
                {step.description}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default HowItWorks;