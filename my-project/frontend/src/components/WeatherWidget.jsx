import { Cloud } from "lucide-react";

function WeatherWidget({
  condition = "Partly Cloudy",
  temp = 30,
  date = "Monday, July 13, 2026",
  location = "Brgy. 167, Caloocan City",
}) {
  return (
    <div
      className="rounded-2xl p-6 flex items-center justify-between text-white"
      style={{ background: "linear-gradient(135deg, #46B5FF 0%, #0BA6DF 100%)" }}
    >
      <div>
        <p className="font-inter text-sm">{condition}</p>
        <p className="font-inter font-bold text-4xl mt-1">{temp}°</p>
        <p className="font-inter text-xs mt-3">{date}</p>
        <p className="font-inter text-xs mt-1 opacity-90">{location}</p>
      </div>
      <Cloud size={56} className="text-white/90" />
    </div>
  );
}

export default WeatherWidget;