export const HOTLINES = [
  { label: "National Emergency Hotline", number: "911" },
  // import mo 'yung mga nasa hotlines di2
];

export function normalizeCategory(category) {
  const raw =
    category && typeof category === "object"
      ? category.label ?? category.id ?? category.value
      : category;
  return String(raw ?? "").toLowerCase().replace(/[^a-z]+/g, " ").trim();
}

const blocked = ["No", "Partly", "Yes"];
const yesNoNotSure = ["No", "Yes", "Not sure"];


export const QUICK_QUESTIONS = {
  flood: [
    { id: "depth", label: "How deep is the water?", options: ["Ankle-deep or less", "Knee-deep", "Waist-deep or more"] },
    { id: "road_blocked", label: "Is the road blocked?", options: blocked },
    { id: "anyone_in_danger", label: "Is anyone in danger right now?", options: ["No", "Yes"], emergencyIf: "Yes" },
  ],
  fire: [
    { id: "fire_risk", label: "What is the fire risk?", options: ["Exposed or overloaded wiring", "Unsafe flammables", "Blocked fire lane or hydrant", "Burning waste", "Other"] },
    { id: "active_fire", label: "Is there an active fire or smoke right now?", options: ["No", "Yes"], emergencyIf: "Yes" },
  ],
  "road damage": [
    { id: "damage_type", label: "What kind of damage?", options: ["Open or missing manhole", "Pothole", "Broken sidewalk", "Unbarricaded excavation", "Damaged bridge or railing", "Broken signal or sign"] },
    { id: "blocking", label: "Is it blocking traffic or people?", options: blocked },
  ],
  "fallen tree": [
    { id: "blocking", label: "Is it blocking a road or path?", options: blocked },
    { id: "touching", label: "Is it touching power lines or a building?", options: yesNoNotSure },
  ],
  "power line": [
    { id: "line_issue", label: "What do you see?", options: ["Fallen or low-hanging line", "Sparking or exposed wire", "Leaning or damaged pole"] },
    { id: "near_water", label: "Is it touching water, a road or a building?", options: yesNoNotSure },
  ],
  "building damage": [
    { id: "building_issue", label: "What kind of damage?", options: ["Collapsed or partly collapsed", "Leaning or cracked", "Falling debris"] },
    { id: "people_near", label: "Are people inside or nearby?", options: yesNoNotSure },
  ],
  "illegal dumping": [
    { id: "dump_type", label: "What is it?", options: ["Waste blocking a road or drain", "Stagnant water", "Sewage or spill", "Dead animal"] },
    { id: "blocking", label: "Is it blocking a drain or road?", options: blocked },
  ],
};
// Aliases for the renames we discussed
QUICK_QUESTIONS["fire risk"] = QUICK_QUESTIONS.fire;
QUICK_QUESTIONS["downed wires"] = QUICK_QUESTIONS["power line"];
QUICK_QUESTIONS["typhoon damage"] = QUICK_QUESTIONS["fallen tree"];

export function getQuickQuestions(category) {
  return QUICK_QUESTIONS[normalizeCategory(category)] ?? [];
}


const EMERGENCY_PATTERNS = [
  /\b(injured|injury|bleeding|unconscious|not breathing|heart attack|ambulance|sugatan|duguan)\b/i,
  /\b(trapped|drowning|drowned|nalulunod|nalunod|naipit)\b/i,
  /\b(gunshot|gun shot|shooting|stabbed|stabbing|binaril|sinaksak|barilan)\b/i,
  /\b(suicide|nagpakamatay|magpapakamatay)\b/i,
  /\b(on fire|house fire|nasusunog|may sunog|explosion|sumabog)\b/i,
];

export function looksLikeEmergency(text) {
  return EMERGENCY_PATTERNS.some((pattern) => pattern.test(text || ""));
}