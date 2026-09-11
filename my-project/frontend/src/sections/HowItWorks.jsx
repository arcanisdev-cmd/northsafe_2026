import { useState, useEffect } from "react";
import {
  UserCheck,
  ClipboardList,
  CircleCheck,
  Send,
} from "lucide-react";

const steps = [
  {
    icon: UserCheck,
    title: "Create or Access your account",
    description:
      "Create an Account to begin the registration process.",
  },
  {
    icon: ClipboardList,
    title: "Complete Registration Information",
    description:
      "Fill out the registration form with your required personal information.",
  },
  {
    icon: CircleCheck,
    title: "Verify Your Account via SMS",
    description:
      "A verification code will be sent to your registered mobile number upon registration.",
  },
  {
    icon: Send,
    title: "Submit a Hazard Report",
    description:
      "Click the Report a Hazard button to start submitting a report. Provide complete details about the hazard.",
  },
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
      className="scroll-mt-[100px] px-5 py-16 text-center sm:px-8 sm:py-20 md:px-12 md:py-24 lg:px-20"
      style={{
        background:
          "radial-gradient(circle at 15% 15%, rgba(120,80,200,0.35), transparent 45%), " +
          "radial-gradient(circle at 85% 20%, rgba(40,110,220,0.35), transparent 45%), " +
          "radial-gradient(circle at 80% 85%, rgba(30,150,180,0.25), transparent 45%), " +
          "#0A1128",
      }}
    >
      {/* Section label */}
      <p className="font-inter text-base font-semibold text-[#5EEAD4] sm:text-lg md:text-xl">
        HOW IT WORKS
      </p>

      {/* Heading */}
      <h2 className="mt-2 font-inter text-[28px] font-semibold leading-tight sm:text-3xl md:text-4xl">
        <span className="text-white">Get started in </span>
        <span className="text-[#5EEAD4]">4 Easy Steps</span>
      </h2>

      {/* Description */}
      <p className="mx-auto mt-4 max-w-[731px] font-krub text-base font-normal leading-6 text-white/75 sm:text-lg sm:leading-7">
        It only requires a few minutes to begin reporting a hazard after
        logging in.
      </p>

      {/* Desktop / Tablet Stepper */}
      <div className="mx-auto mt-12 hidden max-w-[1243px] md:block lg:mt-16">
        <div className="relative grid grid-cols-4 gap-x-8 lg:gap-x-[70px]">
          {/* Connecting line */}
          <div
            className="absolute left-[12%] right-[12%] top-[73px] z-0 border-t-[3px]"
            style={{
              borderColor: "rgba(255,255,255,0.25)",
            }}
          />

          {steps.map((step, index) => {
            const isActive = index === activeStep;
            const Icon = step.icon;

            return (
              <div
                key={step.title}
                className="relative z-10 flex flex-col items-center"
              >
                {/* Step icon */}
                <div
                  className="flex h-[120px] w-[120px] items-center justify-center rounded-full bg-white transition-all duration-500 lg:h-[146px] lg:w-[146px]"
                  style={{
                    border: isActive
                      ? "3px solid #5EEAD4"
                      : "2px solid rgba(255,255,255,0.4)",
                    boxShadow: isActive
                      ? "0 0 24px 4px rgba(94,234,212,0.5)"
                      : "none",
                    transform: isActive
                      ? "scale(1.08)"
                      : "scale(1)",
                  }}
                >
                  <Icon
                    size={36}
                    className="transition-colors duration-500 lg:h-10 lg:w-10"
                    style={{
                      color: isActive
                        ? "#0D9488"
                        : "#0D0B61",
                    }}
                  />
                </div>

                {/* Step text */}
                <div className="mt-6">
                  <h3
                    className="font-krub text-sm font-bold italic transition-colors duration-500 lg:text-base"
                    style={{
                      letterSpacing: "8%",
                      color: isActive
                        ? "#5EEAD4"
                        : "#FFFFFF",
                    }}
                  >
                    {step.title}
                  </h3>

                  <p
                    className="mt-2 font-krub text-sm font-normal leading-6 text-white/70 lg:text-base"
                    style={{
                      letterSpacing: "8%",
                    }}
                  >
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mobile Stepper */}
      <div className="mx-auto mt-10 max-w-[520px] md:hidden">
        <div className="relative">
          {/* Vertical connecting line */}
          <div
            className="absolute bottom-[72px] left-[31px] top-[72px] z-0 border-l-[3px]"
            style={{
              borderColor: "rgba(255,255,255,0.25)",
            }}
          />

          <div className="space-y-10 text-left">
            {steps.map((step, index) => {
              const isActive = index === activeStep;
              const Icon = step.icon;

              return (
                <div
                  key={step.title}
                  className="relative z-10 flex items-start gap-5"
                >
                  {/* Step icon */}
                  <div
                    className="flex h-[64px] w-[64px] shrink-0 items-center justify-center rounded-full bg-white transition-all duration-500"
                    style={{
                      border: isActive
                        ? "3px solid #5EEAD4"
                        : "2px solid rgba(255,255,255,0.4)",
                      boxShadow: isActive
                        ? "0 0 20px 3px rgba(94,234,212,0.45)"
                        : "none",
                      transform: isActive
                        ? "scale(1.08)"
                        : "scale(1)",
                    }}
                  >
                    <Icon
                      size={25}
                      className="transition-colors duration-500"
                      style={{
                        color: isActive
                          ? "#0D9488"
                          : "#0D0B61",
                      }}
                    />
                  </div>

                  {/* Step content */}
                  <div className="flex-1 pt-1">
                    <h3
                      className="font-krub text-sm font-bold italic leading-5 transition-colors duration-500 sm:text-base"
                      style={{
                        letterSpacing: "4%",
                        color: isActive
                          ? "#5EEAD4"
                          : "#FFFFFF",
                      }}
                    >
                      {step.title}
                    </h3>

                    <p
                      className="mt-2 font-krub text-sm leading-6 text-white/70"
                      style={{
                        letterSpacing: "2%",
                      }}
                    >
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

export default HowItWorks;