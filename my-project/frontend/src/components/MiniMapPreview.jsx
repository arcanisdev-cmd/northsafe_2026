import { useState } from "react";
import { MapPin } from "lucide-react";

function MiniMapPreview({ onLocationSelect }) {
  const [pin, setPin] = useState(null); // { x: percent, y: percent } — placeholder for real lat/lng

  const handleClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setPin({ x, y });
    onLocationSelect?.({ x, y }); // swap for real lat/lng once a map library is wired in
  };

  return (
    <div
      onClick={handleClick}
      className="relative bg-gray-200 rounded-[10px] cursor-crosshair overflow-hidden"
      style={{ width: "404px", height: "133px" }}
    >
      {!pin && (
        <span className="absolute inset-0 flex items-center justify-center text-sm text-gray-400">
          Tap to select location on map
        </span>
      )}

      {pin && (
        <MapPin
          size={28}
          className="absolute text-[#FF3B30] fill-[#FF3B30] transition-all duration-150"
          style={{
            left: `${pin.x}%`,
            top: `${pin.y}%`,
            transform: "translate(-50%, -100%)",
          }}
        />
      )}
    </div>
  );
}

export default MiniMapPreview;