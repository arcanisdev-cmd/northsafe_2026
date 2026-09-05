import { Phone } from "lucide-react";

const hotlines = [
  { label: "National Emergency Hotline", number: "911", color: "#D30004" },
  { label: "Bureau of Fire Protection (BFP)", number: "(02) 8426-0219", color: "#F29D38" },
  { label: "Philippine National Police (PNP)", number: "0998-598-7860", color: "#0BA6DF" },
  { label: "Caloocan City Hall", number: "0917-766-2520", color: "#22A559" },
  { label: "Caloocan City Disaster Risk Reduction Management", number: "0905-547-7817", color: "#FFD60A" },
];

function HotlinesPanel() {
  return (
    <div className="flex flex-col gap-3 w-full">
      {hotlines.map(function (h) {
        const dialNumber = "tel:" + h.number.replace(/[^\d+]/g, "");
        return (
          <a
            key={h.label}
            href={dialNumber}
            className="flex items-center gap-4 rounded-lg px-5 py-3.5 transition-colors duration-150 hover:bg-white/20"
            style={{
              backgroundColor: "rgba(255,255,255,0.12)",
              boxShadow: "0 4px 14px rgba(0,0,0,0.35)",
            }}
          >
            <span
              className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
              style={{ backgroundColor: h.color, boxShadow: "0 2px 6px rgba(0,0,0,0.3)" }}
            >
              <Phone size={18} className="text-white" />
            </span>
            <span
              className="text-[15px] text-white flex-1 leading-snug"
              style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 600 }}
            >
              {h.label}
            </span>
            <span
              className="text-sm text-white/90 shrink-0"
              style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 500 }}
            >
              {h.number}
            </span>
          </a>
        );
      })}
    </div>
  );
}

export default HotlinesPanel;