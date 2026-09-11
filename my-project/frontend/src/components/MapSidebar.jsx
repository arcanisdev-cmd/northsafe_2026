import { useMemo, useState } from "react";
import {
  Search,
  Home,
  Waves,
  TriangleAlert,
  History,
  Building2,
  SlidersHorizontal,
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  hazardTypes,
  hazardStatuses,
  barangayOptions,
  alertLevelOptions,
  hazardReports,
} from "./data/MockDashboardData";
import { countByField } from "../utils/hazardFilters";
import MiniCalendar from "./MiniCalendar";

const SECTIONS = {
  EVACUATION_CENTERS: "evacuationCenters",
  FLOODED_ROADS: "floodedRoads",
  HAZARDS: "hazards",
  HAZARDS_STATUS: "hazardsStatus",
  BARANGAY: "barangay",
  ALERT_LEVEL: "alertLevel",
  DATE: "date",
};

const ACTIVE_BG = "#EAF1FC";
const INK = "#11406A";
const MUTED = "#A3A3A3";

function toggleInArray(array, value) {
  return array.includes(value)
    ? array.filter((v) => v !== value)
    : [...array, value];
}

function AccordionRow({ icon: Icon, label, isOpen, onToggle, children }) {
  return (
    <div>
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between px-[10px] py-[10px] rounded-md transition-colors duration-200"
        style={{ backgroundColor: isOpen ? ACTIVE_BG : "transparent" }}
      >
        <span className="flex items-center gap-2 min-w-0">
          <Icon size={16} style={{ color: INK }} className="shrink-0" />

          <span
            className="font-medium text-[14px] leading-[20px] truncate"
            style={{ color: INK }}
          >
            {label}
          </span>
        </span>

        <ChevronDown
          size={16}
          style={{ color: INK }}
          className={`shrink-0 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      <div
        className="grid transition-[grid-template-rows] duration-300 ease-in-out"
        style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden">
          <div className="px-[10px] pb-3 pt-1">{children}</div>
        </div>
      </div>
    </div>
  );
}

function ToggleRow({ icon: Icon, label, active, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="w-full flex items-center gap-2 px-[10px] py-[10px] rounded-md transition-colors duration-200"
      style={{ backgroundColor: active ? ACTIVE_BG : "transparent" }}
    >
      <Icon size={16} style={{ color: INK }} className="shrink-0" />

      <span
        className="font-medium text-[14px] leading-[20px]"
        style={{ color: INK }}
      >
        {label}
      </span>
    </button>
  );
}

function CheckboxRow({ label, count, checked, onChange }) {
  return (
    <label className="flex items-center justify-between py-1.5 cursor-pointer select-none">
      <span className="flex items-center gap-2 min-w-0">
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className="h-4 w-4 rounded border-gray-300 accent-[#11406A] shrink-0"
        />

        <span className="text-[13px] text-gray-700 truncate">
          {label}
        </span>
      </span>

      {typeof count === "number" && (
        <span className="text-[12px] text-gray-400 shrink-0 ml-2">
          {count}
        </span>
      )}
    </label>
  );
}

function AlertLevelRow({ option, checked, onChange }) {
  return (
    <button
      type="button"
      onClick={onChange}
      className="w-full flex items-center gap-2 py-1.5 text-left"
    >
      <span
        className="h-3 w-3 rounded-full shrink-0 transition-transform duration-150"
        style={{
          backgroundColor: checked ? option.dot : "transparent",
          border: `1.5px solid ${option.dot}`,
          transform: checked ? "scale(1)" : "scale(0.85)",
        }}
      />

      <span className="text-[13px] text-gray-700">
        {option.label}
      </span>
    </button>
  );
}

function MapSidebar({
  collapsed,
  onToggleCollapsed,
  filters,
  onChangeFilters,
}) {
  const [openSection, setOpenSection] = useState(null);
  const [search, setSearch] = useState("");

  const hazardTypeCounts = useMemo(
    () => countByField(hazardReports, "hazardType"),
    []
  );

  const hazardStatusCounts = useMemo(
    () => countByField(hazardReports, "status"),
    []
  );

  const handleSectionToggle = (section) => {
    setOpenSection((prev) => (prev === section ? null : section));
  };

  const handleMultiToggle = (field, value) => {
    onChangeFilters((prev) => ({
      ...prev,
      [field]: toggleInArray(prev[field], value),
    }));
  };

  return (
    <div
      className={`
        relative
        bg-white
        flex
        flex-col
        transition-[width]
        duration-300
        ease-in-out
        h-full
        shadow-[2px_0_8px_rgba(0,0,0,0.08)]
        ${collapsed ? "w-[64px]" : "w-[250px] max-w-[calc(100vw-16px)]"}
      `}
    >
      <div
        className="flex-1 overflow-y-auto"
        style={{
          padding: collapsed ? "25px 12px" : "25px 20px",
        }}
      >
        {/* SEARCH */}
        {collapsed ? (
          <div className="flex items-center justify-center w-[40px] h-[40px]">
            <Search size={16} style={{ color: MUTED }} />
          </div>
        ) : (
          <div
            className="
              flex
              items-center
              rounded-[17.5px]
              bg-white
              w-full
              h-[40px]
            "
            style={{
              padding: "12px 16px",
              boxShadow: "0px 2px 6px rgba(0,0,0,0.12)",
            }}
          >
            <Search
              size={16}
              style={{ color: MUTED }}
              className="shrink-0 mr-2"
            />

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search ..."
              className="flex-1 bg-transparent outline-none min-w-0 font-krub font-medium text-[12px]"
              style={{ color: MUTED }}
            />
          </div>
        )}

        <div className="mt-4 flex flex-col gap-1">
          {collapsed ? (
            <>
              <div className="flex justify-center py-[10px]">
                <Home size={16} style={{ color: INK }} />
              </div>

              <div className="flex justify-center py-[10px]">
                <Waves size={16} style={{ color: INK }} />
              </div>

              <div className="flex justify-center py-[10px]">
                <TriangleAlert size={16} style={{ color: INK }} />
              </div>

              <div className="flex justify-center py-[10px]">
                <History size={16} style={{ color: INK }} />
              </div>

              <div className="flex justify-center py-[10px]">
                <Building2 size={16} style={{ color: INK }} />
              </div>

              <div className="flex justify-center py-[10px]">
                <SlidersHorizontal size={16} style={{ color: INK }} />
              </div>

              <div className="flex justify-center py-[10px]">
                <Calendar size={16} style={{ color: INK }} />
              </div>
            </>
          ) : (
            <>
              <ToggleRow
                icon={Home}
                label="Evacuation Centers"
                active={filters.evacuationCentersOn}
                onToggle={() =>
                  onChangeFilters((prev) => ({
                    ...prev,
                    evacuationCentersOn: !prev.evacuationCentersOn,
                  }))
                }
              />

              <ToggleRow
                icon={Waves}
                label="Flooded Roads"
                active={filters.floodedRoadsOn}
                onToggle={() =>
                  onChangeFilters((prev) => ({
                    ...prev,
                    floodedRoadsOn: !prev.floodedRoadsOn,
                  }))
                }
              />

              <AccordionRow
                icon={TriangleAlert}
                label="Hazards"
                isOpen={openSection === SECTIONS.HAZARDS}
                onToggle={() =>
                  handleSectionToggle(SECTIONS.HAZARDS)
                }
              >
                {hazardTypes.map((type) => (
                  <CheckboxRow
                    key={type}
                    label={type}
                    count={hazardTypeCounts[type] || 0}
                    checked={filters.hazardTypes.includes(type)}
                    onChange={() =>
                      handleMultiToggle("hazardTypes", type)
                    }
                  />
                ))}
              </AccordionRow>

              <AccordionRow
                icon={History}
                label="Hazards Status"
                isOpen={
                  openSection === SECTIONS.HAZARDS_STATUS
                }
                onToggle={() =>
                  handleSectionToggle(SECTIONS.HAZARDS_STATUS)
                }
              >
                {hazardStatuses.map((status) => (
                  <CheckboxRow
                    key={status}
                    label={status}
                    count={hazardStatusCounts[status] || 0}
                    checked={filters.hazardStatuses.includes(status)}
                    onChange={() =>
                      handleMultiToggle(
                        "hazardStatuses",
                        status
                      )
                    }
                  />
                ))}
              </AccordionRow>

              <AccordionRow
                icon={Building2}
                label="Barangay"
                isOpen={openSection === SECTIONS.BARANGAY}
                onToggle={() =>
                  handleSectionToggle(SECTIONS.BARANGAY)
                }
              >
                <div className="max-h-[180px] overflow-y-auto pr-1">
                  {barangayOptions.map((opt) => (
                    <CheckboxRow
                      key={opt.value}
                      label={opt.label}
                      checked={filters.barangays.includes(
                        opt.value
                      )}
                      onChange={() =>
                        handleMultiToggle(
                          "barangays",
                          opt.value
                        )
                      }
                    />
                  ))}
                </div>
              </AccordionRow>

              <AccordionRow
                icon={SlidersHorizontal}
                label="Alert Level"
                isOpen={
                  openSection === SECTIONS.ALERT_LEVEL
                }
                onToggle={() =>
                  handleSectionToggle(SECTIONS.ALERT_LEVEL)
                }
              >
                {alertLevelOptions.map((opt) => (
                  <AlertLevelRow
                    key={opt.value}
                    option={opt}
                    checked={filters.alertLevels.includes(
                      opt.value
                    )}
                    onChange={() =>
                      handleMultiToggle(
                        "alertLevels",
                        opt.value
                      )
                    }
                  />
                ))}
              </AccordionRow>

              <AccordionRow
                icon={Calendar}
                label="Date"
                isOpen={openSection === SECTIONS.DATE}
                onToggle={() =>
                  handleSectionToggle(SECTIONS.DATE)
                }
              >
                <MiniCalendar
                  selectedDate={filters.date}
                  onSelect={(date) =>
                    onChangeFilters((prev) => ({
                      ...prev,
                      date,
                    }))
                  }
                />
              </AccordionRow>
            </>
          )}
        </div>
      </div>

      {/* COLLAPSE BUTTON */}
      <button
        type="button"
        onClick={onToggleCollapsed}
        aria-label={
          collapsed ? "Expand filters" : "Collapse filters"
        }
        className="
          absolute
          flex
          items-center
          justify-center
          bg-white
          transition-colors
          hover:bg-gray-50
          right-[-30px]
          top-[328px]
          w-[30px]
          h-[40px]
          rounded-r-lg
          shadow-[2px_0_6px_rgba(0,0,0,0.08)]
        "
        style={{
          padding: "8px 12px",
        }}
      >
        {collapsed ? (
          <ChevronRight size={14} style={{ color: INK }} />
        ) : (
          <ChevronLeft size={14} style={{ color: INK }} />
        )}
      </button>
    </div>
  );
}

export default MapSidebar;