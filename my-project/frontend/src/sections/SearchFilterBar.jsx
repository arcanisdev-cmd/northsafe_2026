import { Search, SlidersHorizontal, ChevronDown } from "lucide-react";

const filters = ["Hazard Category", "Hazard Status", "Baranggay"];

function SearchFilterBar({ userFirstName = "Juan" }) {
  return (
    <section
      className="flex flex-col justify-center"
      style={{ backgroundColor: "#BAC6E8", height: "200px", paddingLeft: "157px", paddingRight: "157px" }}
    >
      {/* Greeting + subtext, one line */}
      <p className="font-inter text-lg">
        <span className="font-bold" style={{ color: "#042545" }}>
          Good Morning,
        </span>{" "}
        <span className="font-bold" style={{ color: "#1B3959" }}>
          {userFirstName}!
        </span>{" "}
        <span className="text-base" style={{ color: "#4E4E4E" }}>
          Stay updated with hazards happening around your community.
        </span>
      </p>

      {/* Search + filters row */}
      <div className="flex items-center gap-4 mt-6">
        {/* Search bar */}
        <div
          className="flex items-center gap-3 bg-white rounded-full px-5 flex-1"
          style={{ height: "40.29px", maxWidth: "718px", border: "1px solid #A3A3A3" }}
        >
          <Search size={18} style={{ color: "#626262" }} className="shrink-0" />
          <input
            type="text"
            placeholder="Search hazard reports or locations ..."
            className="flex-1 text-sm bg-transparent outline-none min-w-0"
            style={{ color: "#4E4E4E" }}
          />
        </div>

        {/* Filter icon + dropdowns, hugged group, no wrap */}
        <div className="flex items-center shrink-0" style={{ gap: "13px" }}>
          <button type="button" className="p-2 shrink-0" aria-label="More filters">
            <SlidersHorizontal size={20} style={{ color: "#626262" }} />
          </button>

          {filters.map((filter) => (
            <button
              key={filter}
              type="button"
              className="flex items-center gap-2 bg-white rounded-full px-5 whitespace-nowrap shrink-0"
              style={{ height: "35px", border: "1px solid #A3A3A3" }}
            >
              <span className="font-inter text-sm" style={{ color: "#042545" }}>
                {filter}
              </span>
              <ChevronDown size={14} style={{ color: "#626262" }} className="shrink-0" />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

export default SearchFilterBar;