import { useRef } from "react";
import { Camera, ImagePlus, Info } from "lucide-react";

const isTouchDevice = () =>
  typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches;

// Only these categories involve physical danger at the scene
const DANGEROUS_CATEGORY = /fire|flood|power|building/i;

function PhotoSourceButtons({
  onTakePhoto,
  widePhoto,
  onWidePhotoSelect,
  recommendWide,
  error,
  category = "",
}) {
  const cameraRef = useRef(null);
  const wideRef = useRef(null);
  const touch = isTouchDevice();
  const showSafetyNote = DANGEROUS_CATEGORY.test(category);

  const handle = (callback) => (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) callback(file);
    e.target.value = "";
  };

  return (
    <div className="w-full max-w-[383px] mt-3">
      {touch && (
        <>
          <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handle(onTakePhoto)} />
          <button
            type="button"
            onClick={() => cameraRef.current && cameraRef.current.click()}
            className="w-full flex items-center justify-center gap-2 rounded-[10px] text-white font-inter font-bold text-sm"
            style={{ height: "40px", backgroundColor: "#00BAFF" }}
          >
            <Camera size={16} />
            Take a photo now
          </button>
        </>
      )}

      <input ref={wideRef} type="file" accept="image/png,image/jpeg" className="hidden" onChange={handle(onWidePhotoSelect)} />
      <button
        type="button"
        onClick={() => wideRef.current && wideRef.current.click()}
        className="w-full mt-2 flex items-center justify-center gap-2 rounded-[10px] font-inter font-semibold text-sm"
        style={{ height: "40px", border: "1px solid #BCBCBC", color: "#042545" }}
      >
        <ImagePlus size={16} />
        {widePhoto ? "Change wide shot" : "Add a wide shot (optional)"}
      </button>
      {widePhoto && <p className="font-inter text-xs mt-1 text-gray-600 truncate">{widePhoto.name}</p>}
      {recommendWide && !widePhoto && (
        <p className="font-inter text-xs mt-1 text-gray-600">
          Recommended: add a wide shot showing a nearby landmark.
        </p>
      )}

      {error && (
        <p role="alert" className="font-inter text-xs mt-2" style={{ color: "#B91C1C" }}>
          {error}
        </p>
      )}

      {showSafetyNote && (
        <div className="flex items-start gap-2 mt-3">
          <Info size={14} className="shrink-0 mt-0.5" />
          <p className="font-inter text-xs text-gray-600">
            Stay safe: keep away from live wires, floodwater, unstable structures and fires. Do not photograph injured people.
          </p>
        </div>
      )}
    </div>
  );
}

export default PhotoSourceButtons;