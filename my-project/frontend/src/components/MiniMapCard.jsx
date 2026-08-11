import { MapPin, Plus, Minus, Maximize2 } from "lucide-react";

function MiniMapCard() {
  return (
    <div className="rounded-2xl bg-white p-3" style={{ border: "1px solid #E5E5E5" }}>
      <div className="relative w-full h-[260px] rounded-xl bg-gray-200 overflow-hidden flex items-center justify-center">
        <span className="text-sm text-gray-400">Map integration goes here</span>

        <MapPin size={28} className="absolute text-[#FF4747] fill-[#FF4747]" style={{ top: "45%", left: "40%" }} />

        {/* Zoom controls */}
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
  );
}

export default MiniMapCard;