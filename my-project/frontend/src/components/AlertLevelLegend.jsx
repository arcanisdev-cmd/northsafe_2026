import { alertLevelOptions } from "./data/MockDashboardData";
function AlertLevelLegend() {
  return (
    <div
      className="
        absolute
        bg-white
        rounded-2xl
        right-3
        sm:right-6
        bottom-[84px]
        sm:bottom-[96px]
        w-[146px]
        p-4
        shadow-[0px_4px_16px_rgba(0,0,0,0.12)]
      "
    >
      <p className="text-[13px] font-semibold text-gray-900 mb-2">
        Alert Level
      </p>

      <div className="flex flex-col gap-2">
        {alertLevelOptions.map((option) => (
          <div
            key={option.value}
            className="flex items-center gap-2"
          >
            <span
              className="h-2.5 w-2.5 rounded-full shrink-0"
              style={{ backgroundColor: option.dot }}
            />

            <span className="text-[12px] text-gray-600">
              {option.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AlertLevelLegend;

