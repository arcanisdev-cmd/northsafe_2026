import { PhoneCall } from "lucide-react";
import { HOTLINES } from "./data/reportConfig";

function EmergencyBanner() {
  const lines = HOTLINES.filter((h) => h.number);
  return (
    <div
      role="alert"
      className="rounded-[10px] px-4 py-3 mt-4"
      style={{ backgroundColor: "#FEF2F2", border: "1px solid #FCA5A5" }}
    >
      <p className="font-inter font-bold text-sm" style={{ color: "#B91C1C" }}>
        This may be an emergency
      </p>
      <p className="font-inter text-xs mt-1" style={{ color: "#B91C1C" }}>
        NORTHSAFE cannot send responders. If someone is hurt or trapped, or there is an active fire, call for help now.
      </p>
      <div className="flex flex-wrap gap-2 mt-3">
        {lines.map((h) => (
          <a key={h.label} href={"tel:" + h.number} className="inline-flex items-center gap-1.5 rounded-[10px] px-3 py-2 text-white font-inter font-bold text-xs" style={{ backgroundColor: "#B91C1C" }}>
            <PhoneCall size={14} />
            {h.label}: {h.number}
          </a>
        ))}
      </div>
    </div>
  );
}

export default EmergencyBanner;