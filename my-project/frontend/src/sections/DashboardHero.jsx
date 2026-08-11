import { FileText, AlertTriangle, CheckCircle, Users, Camera } from "lucide-react";
import ndrrmcBg from "../assets/ndrrmc.png";
import phoneMockup from "../assets/phone-mockup.png";

const stats = [
  { icon: FileText, value: "2,458", label: "Total Reports" },
  { icon: AlertTriangle, value: "189", label: "Active Hazards" },
  { icon: CheckCircle, value: "95%", label: "Resolved Cases" },
  { icon: Users, value: "1,200", label: "Active Users" },
];

function DashboardHero() {
  return (
    <section className="relative overflow-hidden" style={{ height: "685px" }}>
      {/* Background photo */}
      <img
        src={ndrrmcBg}
        alt="NDRRMC operations center"
        className="absolute object-cover"
        style={{ left: "-33px", top: "0px", width: "1597px", height: "685px" }}
      />
      <div className="absolute inset-0 bg-navy/40" />

      {/* Content row — vertically centered, fills the section naturally */}
      <div className="relative h-full flex items-center justify-between px-[80px]">

        {/* Text block */}
        <div className="flex flex-col" style={{ maxWidth: "660px" }}>
          <h1 className="font-inter font-extrabold text-white text-[52px] leading-[1.1]">
            Report Community Hazards,
          </h1>

          <p className="font-inter font-bold text-[#0BA6DF] text-2xl mt-3">
            Build a safer North Caloocan together.
          </p>

          <p className="font-krub font-medium text-white text-xl leading-[1.6] mt-5">
            Submit community hazard reports, stay informed, and help make North Caloocan City safer for everyone.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-x-10 gap-y-3 mt-8">
            {stats.map((stat) => (
              <div key={stat.label} className="flex items-center gap-2">
                <stat.icon size={20} className="text-[#00BAFF]" />
                <p className="font-inter text-base text-white">
                  <span className="font-bold text-[#00BAFF]">{stat.value}</span> {stat.label}
                </p>
              </div>
            ))}
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-4 mt-9">
            <button
              type="button"
              className="flex items-center gap-2 h-16 px-8 rounded-full bg-[#FF6F47] text-white font-inter font-bold text-base"
            >
              <Camera size={20} />
              Report a Hazard
            </button>

            <button
              type="button"
              className="flex items-center gap-2 h-16 px-8 rounded-full border-2 border-[#46B5FF] text-white font-inter font-bold text-base"
            >
              <Camera size={20} />
              View Hazard Map
            </button>
          </div>
        </div>

        {/* Phone mockup — no longer needs manual centering math, flex handles it */}
        <img
          src={phoneMockup}
          alt="Emergency hotlines app preview"
          className="object-contain shrink-0"
          style={{ width: "340px", height: "auto" }}
        />
      </div>
    </section>
  );
}

export default DashboardHero;

