import { MapPin, Plus, Minus, Maximize2 } from "lucide-react";

function MiniMapCard() {
  return (
    // Outer frame: 571x488, radius 15, white fill, #F6F6F6 stroke — per
    // spec. Option A per your call: this stays a styled placeholder for
    // now; real map-library integration (with hazard-type legend pins) is
    // a separate future task once a provider is picked.
    <div
      className="bg-white"
      style={{
        width: "571px",
        height: "488px",
        borderRadius: "15px",
        border: "1px solid #F6F6F6",
        boxShadow: "0 4px 14px rgba(0,0,0,0.12)",
      }}
    >
      {/* Inner placeholder: padding 45px on all sides reproduces the
          spec's inner box almost exactly (571 - 2*45 = 481, matching
          w=481 exactly; 488 - 2*45 = 398 vs spec's 395 — within a few px,
          likely minor rounding in the original file). */}
      <div className="p-[45px] h-full">
        <div
          className="relative w-full h-full bg-gray-200 overflow-hidden flex items-center justify-center"
          style={{ borderRadius: "5px" }}
        >
          <span className="text-sm text-gray-400">Map integration goes here</span>

          <MapPin size={28} className="absolute text-[#FF4747] fill-[#FF4747]" style={{ top: "45%", left: "40%" }} />

          {/* Zoom controls + fullscreen button — kept as-is per your note
              to eyeball these, no exact spec given. */}
          <div className="absolute bottom-3 left-3 flex flex-col rounded-lg overflow-hidden shadow">
            <button type="button" className="w-8 h-8 bg-white flex items-center justify-center border-b border-gray-200">
              <Plus size={14} />
            </button>
            <button type="button" className="w-8 h-8 bg-white flex items-center justify-center">
              <Minus size={14} />
            </button>
          </div>

          <button type="button" className="absolute bottom-3 right-3 w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow">
            <Maximize2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default MiniMapCard;