import { Search } from "lucide-react";
import HazardReportCard from "../components/HazardReportCard";

const recentReports = [1, 2, 3, 4];

function MapSidebar() {
  return (
    <div
      className="bg-white flex flex-col"
      style={{ width: "301px", height: "698px", boxShadow: "2px 0 8px rgba(0,0,0,0.1)" }}
    >
      <div className="p-5">
        <div
          className="flex items-center gap-2 px-3 rounded-lg"
          style={{ width: "251px", height: "40px", border: "1px solid #E5E5E5" }}
        >
          <Search size={16} className="text-gray-400" />
          <input
            type="text"
            placeholder="Search ..."
            className="flex-1 text-sm bg-transparent outline-none min-w-0"
          />
        </div>

        <p className="font-krub font-semibold text-[10px] mt-4" style={{ color: "#A3A3A3" }}>
          Recent Reports
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-5 flex flex-col gap-4 pb-5">
        {recentReports.map((id) => (
          <HazardReportCard key={id} compact />
        ))}
      </div>
    </div>
  );
}

export default MapSidebar;