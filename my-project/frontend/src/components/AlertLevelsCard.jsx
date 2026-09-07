import { Siren } from "lucide-react";
const levels = [
  {
    dotColor: "#A9A9A9", // matches the WHITE alert pill's neutral fill
    title: "WHITE ALERT (EMERGENCY)",
    description:
      "For immediate medical and personal safety emergencies. Examples: Trauma, suicide or self-harm, gunshot incidents.",
  },
  {
    dotColor: "#1E1391", // matches the BLUE alert pill's text color
    title: "BLUE (HAZARD)",
    description:
      "For environmental and community hazards that may threaten public safety. Examples: Flooding, severe weather, leptospirosis risk, trapped victims.",
  },
  {
    dotColor: "#BA1A1A", // matches the RED alert pill's text color
    title: "RED (CRITICAL EMERGENCY)",
    description:
      "For severe incidents requiring immediate protective action or evacuation. Examples: Earthquakes, forced evacuation, major community emergencies.",
  },
];

function AlertLevelsCard() {
  return (
    // Slightly enlarged per feedback: width bumped from 569.6 to a
    // responsive w-full (matching the sidebar column), padding increased,
    // and body/heading font sizes nudged up a notch.
    <div
      className="w-full"
      style={{
        backgroundColor: "#FFCECF",
        borderRadius: "15px",
        paddingTop: "50px",
        paddingRight: "30px",
        paddingBottom: "55px",
        paddingLeft: "30px",
      }}
    >
      <div className="flex items-center justify-center gap-2">
        <Siren size={22} style={{ color: "#042545" }} />
        <h2
          className="text-center"
          style={{
            fontFamily: "'Krub', sans-serif",
            fontWeight: 700,
            fontSize: "22px",
            lineHeight: "22px",
            color: "#042545",
          }}
        >
          ALERT LEVELS
        </h2>
      </div>

      <div className="flex flex-col gap-4 mt-6">
        {levels.map((level) => (
          <div key={level.title} className="flex items-start gap-2">
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0 mt-1.5"
              style={{ backgroundColor: level.dotColor }}
            />
            <div>
              <p
                style={{
                  fontFamily: "'Krub', sans-serif",
                  fontWeight: 700,
                  fontSize: "15px",
                  lineHeight: "20px",
                  color: "#042545",
                }}
              >
                {level.title}
              </p>
              <p
                className="mt-0.5"
                style={{
                  fontFamily: "'Krub', sans-serif",
                  fontWeight: 500,
                  fontSize: "15px",
                  lineHeight: "21px",
                  color: "#042545",
                }}
              >
                {level.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AlertLevelsCard;