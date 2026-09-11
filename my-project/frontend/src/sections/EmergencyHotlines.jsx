import { Phone, MapPin } from "lucide-react";
import caloocanLogo from "../assets/caloocan-logo.png";
import emergencyHotlinesHeading from "../assets/emergency-hotlines-heading.png";
import hotlinesMap from "../assets/hotlines-map.png";

const phoneNumbers = [
  { number: "(02) 888-25664", color: "#000000" },
  { number: "0998-51-25664", color: "#FF4C1A" },
  { number: "0908-81-25664", color: "#000000" },
];

function EmergencyHotlines() {
  return (
    <section
      id="hotlines"
      className="scroll-mt-[100px] px-5 py-16 sm:px-8 sm:py-20 md:px-12 md:py-24 lg:flex lg:items-stretch lg:gap-[106px] lg:px-[100px] lg:py-[100px]"
    >
      {/* Left Side */}
      <div className="w-full shrink-0 lg:w-[594px]">
        <div className="flex flex-col items-center">
          <img
            src={caloocanLogo}
            alt="Caloocan"
            className="h-auto max-w-full"
          />

          <img
            src={emergencyHotlinesHeading}
            alt="Emergency Hotlines"
            className="mt-6 h-auto max-w-full sm:mt-7"
          />
        </div>

        <p className="mt-6 text-center font-inter text-sm font-semibold leading-6 text-[#4E4E4E] sm:mt-7 sm:text-base">
          For direct assistance, please contact the North Caloocan City DRRM
          Office using the numbers below.
        </p>

        {/* Phone Numbers */}
        <div className="mt-7 flex flex-col gap-4 sm:gap-5 md:gap-6 lg:gap-[30px]">
          {phoneNumbers.map(function (phone) {
            const dialNumber = phone.number.replace(/[^\d+]/g, "");

            return (
              <a
                key={phone.number}
                href={`tel:${dialNumber}`}
                aria-label={`Call ${phone.number}`}
                className="flex min-h-[48px] w-full items-center justify-center gap-3 rounded-lg px-4 py-2 font-inter text-xl font-bold transition-opacity duration-150 hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0BA6DF] focus-visible:ring-offset-2 active:scale-[0.99] sm:text-2xl"
                style={{ color: phone.color }}
              >
                <Phone
                  size={22}
                  className="shrink-0 sm:h-6 sm:w-6"
                />

                <span>{phone.number}</span>
              </a>
            );
          })}
        </div>

        {/* Office Information */}
        <div className="mt-7 flex flex-col items-center gap-3 sm:mt-[30px] sm:gap-[14px]">
          <p className="text-center font-inter text-sm font-semibold leading-5 text-[#4E4E4E]">
            North Caloocan City Disaster Risk Reduction and Management Office
          </p>

          <div className="flex w-full items-start justify-center gap-2">
            <MapPin
              size={18}
              className="mt-0.5 shrink-0 text-[#22A559]"
            />

            <p className="max-w-[520px] text-center font-inter text-sm leading-5 text-[#4E4E4E]">
              Zapote Rd, Barangay 177, Novaliches, Caloocan, 1400 Metro Manila
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Map */}
      <div className="mt-10 h-[360px] w-full shrink-0 overflow-hidden rounded-xl sm:h-[420px] md:h-[480px] lg:mt-0 lg:h-auto lg:w-[616.29px] lg:rounded-none">
        <img
          src={hotlinesMap}
          alt="North Caloocan DRRM Office location"
          className="h-full w-full object-cover"
        />
      </div>
    </section>
  );
}

export default EmergencyHotlines;