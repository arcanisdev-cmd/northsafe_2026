import { Layers } from "lucide-react";

function LayersToggle() {
  return (
    <button
      type="button"
      className="absolute bottom-6 right-6 w-12 h-12 rounded-xl bg-[#2C2C2C] flex items-center justify-center shadow-lg"
      aria-label="Toggle map layers"
    >
      <Layers size={20} className="text-white" />
    </button>
  );
}

export default LayersToggle;