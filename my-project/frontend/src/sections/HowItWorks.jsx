import { UserCheck, ClipboardList, CircleCheck, Send } from "lucide-react";

const steps = [
  {
    icon: UserCheck,
    title: "Create or Access your account",
    description: "Create an Account to begin the registration process.",
  },
  {
    icon: ClipboardList,
    title: "Complete Registration Information",
    description: "Fill out the registration form with your required personal information.",
  },
  {
    icon: CircleCheck,
    title: "Verify your account via SMS",
    description: "A verification code will be sent to your registered mobile number upon registration.",
  },
  {
    icon: Send,
    title: "Submit a Hazard Report",
    description: "Click the Report a Hazard button to start submitting a report. Provide complete details about the hazard.",
  },
];

function HowItWorks() {
  return (
    <section className="py-24 text-center">
      <p className="font-inter font-semibold text-xl text-[#0D0B61]">
        How It Works
      </p>

      <h2 className="font-inter font-semibold text-4xl mt-2">
        <span className="text-black">Get started in </span>
        <span className="text-[#41AEAF]">4 Easy Steps</span>
      </h2>

      <p
        className="font-krub font-normal text-lg text-black max-w-[731px] mx-auto mt-4"
        style={{ letterSpacing: "8%" }}
      >
        It only requires a few minutes to begin reporting a hazard after logging in.
      </p>

      {/* Circles + connecting line — same grid dimensions as the text row below */}
      <div
        className="relative mx-auto mt-16"
        style={{ display: "grid", gridTemplateColumns: "repeat(4, 258px)", columnGap: "70px", width: "1243px" }}
      >
        {/* Line behind the circles, vertically centered on them */}
        <div className="absolute left-0 right-0 top-[73px] border-t-[3px] border-[#848484] z-0" />

        {steps.map((step) => (
          <div key={step.title} className="relative z-10 flex justify-center">
            <div className="w-[146px] h-[146px] rounded-full bg-white border-2 border-[#848484] flex items-center justify-center">
              <step.icon size={40} className="text-[#0D0B61]" />
            </div>
          </div>
        ))}
      </div>

      {/* Titles + descriptions — identical grid, guarantees alignment with circles above */}
      <div
        className="mx-auto mt-6"
        style={{ display: "grid", gridTemplateColumns: "repeat(4, 258px)", columnGap: "70px", width: "1243px" }}
      >
        {steps.map((step) => (
          <div key={step.title}>
            <h3 className="font-krub font-bold text-base text-black" style={{ letterSpacing: "8%" }}>
              {step.title}
            </h3>
            <p className="font-krub font-normal text-base text-black mt-2" style={{ letterSpacing: "8%" }}>
              {step.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default HowItWorks;