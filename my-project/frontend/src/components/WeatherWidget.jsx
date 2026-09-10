import { Cloud, MapPin } from "lucide-react";

const FALLBACK_WEATHER = {
  condition: "Partly Cloudy",
  temp: 30,
  date: "Monday, July 13, 2026",
  location: "Brgy. 167, Caloocan City",
};

function WeatherWidget({ weather = FALLBACK_WEATHER }) {
  const { condition, temp, date, location } = weather;

  return (
    // Fixed 570.04 wide, hugs to 126.7 tall. Solid navy #17436A per spec
    // (replacing the previous blue gradient). Children are absolute
    // positioned at their exact figma coordinates — condition+temp form a
    // left column, day/date+location form a middle column, and the weather
    // icon sits on the right.
    <div
      className="relative rounded-2xl"
      style={{ width: "570.04px", minHeight: "126.7px", backgroundColor: "#17436A" }}
    >
      <p
        className="absolute text-white"
        style={{
          left: "32.87px",
          top: "25.2px",
          fontFamily: "Inter, sans-serif",
          fontWeight: 500,
          fontSize: "16px",
          lineHeight: "20px",
        }}
      >
        {condition}
      </p>

      <p
        className="absolute text-white"
        style={{
          left: "47.64px",
          top: "65.24px",
          fontFamily: "Inter, sans-serif",
          fontWeight: 400,
          fontSize: "50px",
          lineHeight: "20px",
        }}
      >
        {temp}°
      </p>

      <p
        className="absolute text-white"
        style={{
          left: "200.35px",
          top: "43.86px",
          fontFamily: "Inter, sans-serif",
          fontWeight: 500,
          fontSize: "16px",
          lineHeight: "20px",
        }}
      >
        {date}
      </p>

      {/* MapPin (white) + location text — the ~27px gap between this row's
          x=200.35 start and the day/date line above it matches an icon+gap
          pattern, so the icon sits at the day/date's left edge with the
          text itself starting further right at the spec's x=227.19. */}
      <div className="absolute flex items-center gap-2" style={{ left: "200.35px", top: "73.64px" }}>
        <MapPin size={16} className="text-white shrink-0" fill="white" strokeWidth={0} />
        <p
          className="text-white"
          style={{ fontFamily: "Inter, sans-serif", fontWeight: 500, fontSize: "16px", lineHeight: "20px" }}
        >
          {location}
        </p>
      </div>

      {/* Weather icon — spec's bounding box (226.09x82) is almost
          certainly the Figma component instance's own internal canvas
          rather than the visible glyph size (an icon that wide would
          overflow the 570px-wide card). Sized to look proportionate
          instead of matching that box literally. */}
      <Cloud
        size={72}
        className="absolute text-white/90"
        style={{ left: "430px", top: "27px" }}
      />
    </div>
  );
}

export default WeatherWidget;