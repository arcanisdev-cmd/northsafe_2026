import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const WEEKDAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

/**
 * Single-month, single-date-select calendar.
 * Clicking the already-selected day deselects it (clears the Date filter).
 */
function MiniCalendar({ selectedDate, onSelect }) {
  const [viewDate, setViewDate] = useState(selectedDate || new Date());

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells = [];
  for (let i = 0; i < firstWeekday; i++) cells.push(null);
  for (let day = 1; day <= daysInMonth; day++) cells.push(day);

  const isSelected = (day) =>
    !!selectedDate &&
    day === selectedDate.getDate() &&
    month === selectedDate.getMonth() &&
    year === selectedDate.getFullYear();

  const goPrevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const goNextMonth = () => setViewDate(new Date(year, month + 1, 1));

  const handleDayClick = (day) => {
    if (isSelected(day)) {
      onSelect(null);
    } else {
      onSelect(new Date(year, month, day));
    }
  };

  return (
    <div className="text-[13px]">
      <div className="flex items-center justify-between mb-2 px-1">
        <button
          type="button"
          onClick={goPrevMonth}
          className="p-1 rounded hover:bg-gray-100 transition-colors"
          aria-label="Previous month"
        >
          <ChevronLeft size={14} className="text-gray-500" />
        </button>
        <span className="font-medium text-gray-700 text-[12px]">
          {viewDate.toLocaleString("default", { month: "long", year: "numeric" })}
        </span>
        <button
          type="button"
          onClick={goNextMonth}
          className="p-1 rounded hover:bg-gray-100 transition-colors"
          aria-label="Next month"
        >
          <ChevronRight size={14} className="text-gray-500" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-y-1 text-center">
        {WEEKDAY_LABELS.map((label, i) => (
          <span key={i} className="text-[10px] text-gray-400 font-medium">
            {label}
          </span>
        ))}

        {cells.map((day, i) =>
          day === null ? (
            <span key={`blank-${i}`} />
          ) : (
            <button
              key={day}
              type="button"
              onClick={() => handleDayClick(day)}
              className={`h-6 w-6 mx-auto flex items-center justify-center rounded-full text-[12px] transition-colors duration-150 ${
                isSelected(day)
                  ? "bg-[#11406A] text-white font-semibold"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {day}
            </button>
          )
        )}
      </div>
    </div>
  );
}

export default MiniCalendar;