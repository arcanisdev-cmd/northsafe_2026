import { ChevronDown } from "lucide-react";

const filters = ["Hazard Category", "Hazard Status", "Baranggay", "Severity", "Date"];

function MapFilterBar() {
  return (
    <div className="flex items-center" style={{ gap: "9px" }}>
      {filters.map((filter) => (
        <button
          key={filter}
          type="button"
          className="flex items-center gap-2 bg-white rounded-lg px-4 whitespace-nowrap shrink-0"
          style={{ height: "35px", border: "1px solid #979797" }}
        >
          <span className="font-inter text-sm font-medium" style={{ color: "#626262" }}>
            {filter}
          </span>
          <ChevronDown size={14} style={{ color: "#626262" }} className="shrink-0" />
        </button>
      ))}
    </div>
  );
}

export default MapFilterBar;