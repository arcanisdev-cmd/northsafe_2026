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
      className="flex px-[100px] py-[100px] gap-[106px] items-stretch scroll-mt-[100px]"
    >
      {/* Left Side */}
      <div style={{ width: "594px" }} className="shrink-0">
        <div className="flex flex-col items-center">
          <img
            src={caloocanLogo}
            alt="Caloocan"
            className="max-w-full h-auto"
          />

          <img
            src={emergencyHotlinesHeading}
            alt="Emergency Hotlines"
            className="max-w-full h-auto mt-[29px]"
          />
        </div>

        <p
          className="font-inter font-semibold text-base text-center mt-[29px]"
          style={{ color: "#4E4E4E" }}
        >
          For direct assistance, please contact the North Caloocan City DRRM
          Office using the numbers below.
        </p>

        {/* Phone Numbers */}
        <div className="flex flex-col gap-[30px] mt-[30px]">
          {phoneNumbers.map(function (phone) {
            return (
              <a
                key={phone.number}
                href={"tel:" + phone.number.replace(/[^\d+]/g, "")}
                className="flex items-center justify-center gap-3 font-inter font-bold text-2xl hover:opacity-80 transition-opacity"
                style={{ color: phone.color }}
              >
                <Phone size={24} />
                {phone.number}
              </a>
            );
          })}
        </div>

        {/* Office Information */}
        <div className="flex flex-col gap-[14px] mt-[30px] items-center">
          <p
            className="font-inter font-semibold text-sm text-center"
            style={{ color: "#4E4E4E" }}
          >
            North Caloocan City Disaster Risk Reduction and Management Office
          </p>

          <div className="flex items-center gap-2">
            <MapPin
              size={18}
              className="shrink-0"
              style={{ color: "#22A559" }}
            />

            <p
              className="font-inter text-sm"
              style={{ color: "#4E4E4E" }}
            >
              Zapote Rd, Barangay 177, Novaliches, Caloocan, 1400 Metro Manila
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Map */}
      <div
        className="shrink-0 self-stretch"
        style={{ width: "616.29px" }}
      >
        <img
          src={hotlinesMap}
          alt="North Caloocan DRRM Office location"
          className="w-full h-full object-cover"
        />
      </div>
    </section>
  );
}

export default EmergencyHotlines;