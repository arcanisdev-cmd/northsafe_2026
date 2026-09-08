export const typhoonAlert = {
  title: "Typhoon Warning",
  date: "AUGUST 29, 2026",
  time: "5:24 PM",
  message:
    "Red rainfall warning sa Zambales, Tarlac, Pampanga, Bataan at Bulacan. Asahan ang matinding pag-ulan, pagbaha at pag guho ng lupa. Maaaring lumikas sa pinakamalapit na evacuation centers sa inyong mga barangay at makipag-ugnayan sa LGU's para sa agarang pag-responde.",
  primaryCta: { label: "View Evacuation Centers", to: "/evacuation-centers" },
  secondaryCta: { label: "More Info", to: "/alerts/typhoon-warning" },
};

export const hotlines = [
  { label: "National Emergency Hotline", number: "911", color: "#D30004" },
  { label: "Bureau of Fire Protection (BFP)", number: "(02) 8426-0219", color: "#F29D38" },
  { label: "Philippine National Police (PNP)", number: "0998-598-7860", color: "#0BA6DF" },
  { label: "Caloocan City Hall", number: "0917-766-2520", color: "#22A559" },
  {
    label: "Caloocan City Disaster Risk Reduction Management",
    number: "0905-547-7817",
    color: "#FFD60A",
  },
];

// Placeholder for the logged-in user shown in AuthNavbar and RewardsCard.
// Shaped to match whatever the real auth/session endpoint will eventually
// return. RewardsCard reads points from here directly (not a separate
// duplicate field) so the navbar and rewards panel never drift out of sync.
export const currentUser = {
  name: "Juan Dela Cruz",
  points: 140,
  prepaidLoad: 10,
  avatarUrl: null,
};

// NOTE for backend integration: unlike the other mock data in this file,
// this one stands in for a live third-party weather API response (e.g.
// OpenWeatherMap), not your own backend endpoint — flagging that this is a
// different kind of integration point than currentUser/hazardReports/etc.
export const weatherData = {
  condition: "Partly Cloudy",
  temp: 30,
  date: "Monday, July 13, 2026",
  location: "Brgy. 167, Caloocan City",
};

// ---------------------------------------------------------------------------
// Canonical filter enums
// ---------------------------------------------------------------------------
// These are the single source of truth for hazard type / status / barangay /
// alert level everywhere they appear (HazardMap sidebar filters, report
// submission forms, admin views later, etc). Components should import these
// rather than hardcoding option lists, so a new hazard type or barangay only
// ever needs to be added in one place.

export const hazardTypes = [
  "Fire",
  "Flood",
  "Road Damage",
  "Power Line",
  "Building Damage",
  "Illegal Dumping",
  "Fallen Tree",
];

export const hazardStatuses = ["Pending", "Resolved"];

// Barangay 165 through Barangay 188 (North Caloocan range confirmed for MVP).
export const barangayOptions = Array.from({ length: 188 - 165 + 1 }, (_, i) => {
  const number = 165 + i;
  return { value: number, label: `Barangay ${number}` };
});

// alertLevel is "red" | "blue" | "white", matching the three AlertPill
// variants in HazardReportCard. The `dot` color here is a separate,
// more-saturated value from the existing pill bg/text colors — the pill
// colors (e.g. RED #FFC4C4 bg) are pale tints meant for a badge with text
// inside; they're too washed out to read as a small solid legend/filter dot,
// so `dot` gives each level a color built for that smaller UI instead.
export const alertLevelOptions = [
  { value: "red", label: "Red Alert", dot: "#BA1A1A" },
  { value: "blue", label: "Blue Alert", dot: "#1E1391" },
  { value: "white", label: "White Alert", dot: "#A9A9A9" },
];

// No content yet — both are simple on/off map-layer toggles in the sidebar
// (no sub-list under them). Kept as real arrays rather than omitted keys so
// MapSidebar's toggle rows and a future backend dev both have a concrete
// shape to check against once this layer's data exists.
export const evacuationCenters = [];
export const floodedRoads = [];

// Placeholder hazard reports for the feed and the Hazard Map. alertLevel is
// "red" | "blue" | "white", matching the three AlertPill variants in
// HazardReportCard. lat/lng place the pin on the map; barangay and status
// back the Hazard Map sidebar's Barangay and Hazards Status filters.
export const hazardReports = [
  {
    id: 1,
    reporterName: "Jam Dagonio",
    timeAgo: "3 hrs ago",
    alertLevel: "red",
    title: "Large Pothole on Main Road Causing Traffic Delays",
    description: "Dangerous pothole discovered near the road intersection.",
    address: "Beside Barangay 167 Llano road in kamagong street",
    dateTime: "06/15/2026 11:26PM",
    hazardType: "Flood",
    status: "Pending",
    barangay: 167,
    lat: 14.7569,
    lng: 120.9932,
    verified: true,
    upvotes: 12,
    downvotes: 12,
    comments: 12,
    imageSrc: null,
  },
  {
    id: 2,
    reporterName: "Jam Dagonio",
    timeAgo: "3 hrs ago",
    alertLevel: "blue",
    title: "Fallen Tree Blocking Barangay Road",
    description: "Large tree fell across the road after last night's storm.",
    address: "Near Barangay 174 Camarin Road",
    dateTime: "06/15/2026 11:26PM",
    hazardType: "Fallen Tree",
    status: "Pending",
    barangay: 174,
    lat: 14.7621,
    lng: 121.0004,
    verified: true,
    upvotes: 12,
    downvotes: 12,
    comments: 12,
    imageSrc: null,
  },
  {
    id: 3,
    reporterName: "Jam Dagonio",
    timeAgo: "3 hrs ago",
    alertLevel: "white",
    title: "Exposed Electrical Wiring on Power Line",
    description: "Downed power line spotted hanging low over the sidewalk.",
    address: "Beside Barangay 177 Zapote Street",
    dateTime: "06/15/2026 11:26PM",
    hazardType: "Power Line",
    status: "Resolved",
    barangay: 177,
    lat: 14.7598,
    lng: 121.0041,
    verified: true,
    upvotes: 12,
    downvotes: 12,
    comments: 12,
    imageSrc: null,
  },
  {
    id: 4,
    reporterName: "Jam Dagonio",
    timeAgo: "3 hrs ago",
    alertLevel: "red",
    title: "Illegal Dumping Blocking Drainage Canal",
    description: "Garbage piled up near the canal, worsening flood risk.",
    address: "Beside Barangay 165 Deparo Road",
    dateTime: "06/15/2026 11:26PM",
    hazardType: "Illegal Dumping",
    status: "Pending",
    barangay: 165,
    lat: 14.7487,
    lng: 120.9895,
    verified: true,
    upvotes: 12,
    downvotes: 12,
    comments: 12,
    imageSrc: null,
  },
  {
    id: 5,
    reporterName: "Jam Dagonio",
    timeAgo: "3 hrs ago",
    alertLevel: "red",
    title: "Structural Damage to Building Facade",
    description: "Cracked wall poses risk of collapse near a busy walkway.",
    address: "Beside Barangay 168 Llano Road",
    dateTime: "06/15/2026 11:26PM",
    hazardType: "Building Damage",
    status: "Pending",
    barangay: 168,
    lat: 14.7543,
    lng: 120.9967,
    verified: true,
    upvotes: 12,
    downvotes: 12,
    comments: 12,
    imageSrc: null,
  },
];