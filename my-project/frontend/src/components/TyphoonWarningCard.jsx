import { AlertCircle, LifeBuoy, Info } from "lucide-react";

function TyphoonWarningCard({
  title = "Typhoon Warning",
  message = "LUIS is forecast to intensify into a tropical storm in the next 24 hours while moving over the sea east of Central Luzon. It will likely remain a tropical storm for only a short period. Afterwards, as LUIS begins to turn generally east northeastward, a weakening trend is expected.",
}) {
  return (
    <div
      className="rounded-2xl p-6 text-white"
      style={{ background: "linear-gradient(135deg, #FF4747 0%, #FF8A47 100%)" }}
    >
      <div className="flex items-center gap-2">
        <AlertCircle size={20} />
        <h3 className="font-inter font-bold text-lg">{title}</h3>
      </div>

      <p className="font-inter text-sm leading-relaxed mt-3 text-white/90">
        {message}
      </p>

      <div className="flex items-center gap-3 mt-4">
        <button
          type="button"
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-white text-[#FF4747] text-xs font-bold"
        >
          <LifeBuoy size={14} />
          View Evacuation Centers
        </button>
        <button
          type="button"
          className="flex items-center gap-2 px-4 py-2 rounded-full border border-white text-white text-xs font-bold"
        >
          <Info size={14} />
          More Info
        </button>
      </div>
    </div>
  );
}

export default TyphoonWarningCard;