import { alertLevelOptions } from "./data/MockDashboardData";

/**
 * Floating "Alert Level" legend for the Hazard Map, bottom-right of the map.
 *
 * NOTE: I don't have your existing SeverityLegend.jsx source to edit in
 * place, so this is a fresh build matching the figma (title, dot + label
 * rows, red/blue/white via alertLevelOptions). If you'd rather I edit your
 * original file directly instead of swapping in this one, paste it and I'll
 * patch it precisely rather than rebuild it.
 *
 * Positioned with right/bottom offsets (not fixed left/top math) so it stays
 * anchored to the map's corner regardless of exact map width.
 */
function AlertLevelLegend() {
  return (
    <div
      className="absolute bg-white rounded-2xl"
      style={{
        right: "24px",
        bottom: "96px", // sits above LayersToggle, matching the figma stack
        width: "146px",
        padding: "16px",
        boxShadow: "0px 4px 16px rgba(0,0,0,0.12)",
      }}
    >
      <p className="text-[13px] font-semibold text-gray-900 mb-2">Alert Level</p>
      <div className="flex flex-col gap-2">
        {alertLevelOptions.map((option) => (
          <div key={option.value} className="flex items-center gap-2">
            <span
              className="h-2.5 w-2.5 rounded-full shrink-0"
              style={{ backgroundColor: option.dot }}
            />
            <span className="text-[12px] text-gray-600">{option.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AlertLevelLegend;
