const SEVERITY_ITEMS = [
  { label: "High", color: "#FF3C40" },
  { label: "Medium", color: "#EC8305" },
  { label: "Low", color: "#FEEC41" },
  { label: "Resolved", color: "#39DA10" },
];

export default function HazardMapReports() {
  return (
    <div className="relative w-full bg-[#E0F8F2] overflow-hidden px-16 py-12">
      {/* Faint blue accent, left side */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-[120px] -left-[180px] w-[620px] h-[620px] rounded-full blur-[10px]"
        style={{
          background:
            "radial-gradient(circle, rgba(120,170,255,0.35) 0%, rgba(120,170,255,0.12) 45%, rgba(120,170,255,0) 75%)",
        }}
      />

      {/* Row: map + info column */}
      <div className="relative flex items-start w-full max-w-[1319px] gap-20 mx-auto">
        {/*
          Map container: fixed 613 x 516, matches Figma exactly.
          Empty placeholder for now — the real interactive map (click a
          hazard pin -> populate the report card below) plugs in here
          later without touching anything outside this box.
        */}
        <div className="w-[613px] h-[516px] flex-shrink-0 rounded-[13px] bg-white shadow-lg flex items-center justify-center">
          <span className="text-sm text-gray-400">
            Hazard map will be integrated here
          </span>
        </div>

        {/* Info column: title, description, legend, then report card below it */}
        <div className="flex flex-col flex-1 min-w-0 h-[516px] gap-5">
          <h2 className="font-black text-[35px] leading-[44px] text-[#0C142E] m-0">
            Live Hazard Map
          </h2>

          <p className="max-w-[514px] font-normal text-[24px] leading-[30px] text-[#0C142E] text-justify m-0">
            Navigate the entire North Caloocan map and View the severity
            levels of each reported hazard near your area through the
            NORTHSAFE Live Hazard Map.
          </p>

          <div className="flex items-center justify-between w-full max-w-[592px]">
            {SEVERITY_ITEMS.map(({ label, color }) => (
              <div key={label} className="flex items-center gap-3">
                <span
                  className="inline-block w-5 h-5 rounded-full"
                  style={{ backgroundColor: color }}
                />
                <span className="text-lg text-[#0C142E]">{label}</span>
              </div>
            ))}
          </div>

          {/* Report card: outer white frame (same treatment as the map box),
              with the grey placeholder inset inside it — insets match the
              37 / 29 / 33 / 29 (L/T/R/B) spacing from the Figma spec. */}
          <div className="flex-1 min-h-0 rounded-[13px] bg-white shadow-lg pl-[37px] pr-[33px] pt-[29px] pb-[29px]">
            <div className="w-full h-full rounded-[13px] bg-[#F2F2F2] shadow-md flex items-center justify-center text-center px-8">
              <p className="text-sm text-gray-500 m-0">
                Select any hazard from the map
                <br />
                to view hazard report details.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}