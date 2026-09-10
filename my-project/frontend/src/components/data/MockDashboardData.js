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
//
// `id` was added for My Reports — hazardReports.reporterId is matched
// against this so "my reports" is a real ownership filter, not a guess
// based on matching display names.
export const currentUser = {
  id: "user-001",
  name: "Juan Dela Cruz",
  points: 140,
  prepaidLoad: 10,
  avatarUrl: null,
};

// ---------------------------------------------------------------------------
// Notifications
// ---------------------------------------------------------------------------
// `type` is a plain string, not an icon/color pair — which icon and color
// render for a given type is a UI concern, decided in
// utils/notificationSelectors.js, not baked into the data (a real backend
// would send a type string like this, not a lucide-react component).
//
// `timestamp` uses the same "mm/dd/yyyy h:mmAM/PM" format as
// hazardReports.dateTime so the same parseReportDateTime() parser works on
// both — `timeAgo` and Today/Older grouping are both DERIVED from this at
// render time, not stored as a static "7hrs" string that would silently
// go stale.
//
// `relatedReportId` ties a notification back to a specific hazardReports
// entry (for the "View" link) — same reference-by-id pattern as
// reporterId/recipientId rather than duplicating report data here.
export const notifications = [
  {
    id: 1,
    recipientId: "user-001",
    type: "rejected",
    title: "Report Has Been Rejected.",
    subtitle: "Large Pothole on Main Road Causing Traffic Delays",
    relatedReportId: 8,
    timestamp: "06/15/2026 04:30PM",
    read: false,
  },
  {
    id: 2,
    recipientId: "user-001",
    type: "downvoted",
    title: "James and 4 other people downvoted your report.",
    subtitle: "Large Pothole on Main Road Causing Traffic Delays",
    relatedReportId: 9,
    timestamp: "06/15/2026 04:25PM",
    read: false,
  },
  {
    id: 3,
    recipientId: "user-001",
    type: "verified",
    title: "Your report has been verified.",
    subtitle: "Large Pothole on Main Road Causing Traffic Delays",
    relatedReportId: 7,
    timestamp: "06/14/2026 04:00PM",
    read: true,
  },
];

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
// alert level everywhere they appear (HazardMap sidebar filters, My Reports
// filters, report submission forms, admin views later, etc). Components
// should import these rather than hardcoding option lists, so a new hazard
// type or barangay only ever needs to be added in one place.

export const hazardTypes = [
  "Fire",
  "Flood",
  "Road Damage",
  "Power Line",
  "Building Damage",
  "Illegal Dumping",
  "Fallen Tree",
];

// Hazard Map sidebar's "Hazards Status" filter — intentionally narrower than
// the full report pipeline (see reportStatuses below). Locked in as
// Pending/Resolved only per an earlier decision; not touching this without
// confirming first, since widening it changes the Hazard Map UI too.
export const hazardStatuses = ["Pending", "Resolved"];

// The fuller status pipeline used by My Reports (stats cards + status
// filter dropdown + the Hazard Reporting Timeline). Deliberately a separate
// list from hazardStatuses above rather than silently widening that one.
export const reportStatuses = ["Pending", "Verified", "Resolved", "Rejected"];

// The ordered pipeline a report's statusHistory walks through on the happy
// path. "Rejected" is a branch off Pending, not a step in this sequence —
// see the comment on statusHistory below.
export const reportStatusPipeline = [
  "Submitted",
  "Pending",
  "Verified",
  "Resolved",
  "Points Accumulated",
];

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

// ---------------------------------------------------------------------------
// Hazard reports
// ---------------------------------------------------------------------------
// alertLevel is "red" | "blue" | "white", matching the three AlertPill
// variants in HazardReportCard. lat/lng place the pin on the Hazard Map;
// barangay backs the Barangay filter on both the Hazard Map and My Reports.
//
// `statusHistory` replaces the old flat `status` + `verified` boolean with
// one combined timeline: each entry a report has actually reached gets a
// { status, timestamp } entry (optionally `pointsAwarded` on the final
// step). This is what both HazardReportCard's "Verified" badge and
// ReportStatusTimeline's stepper read from — a report is "verified" simply
// because "Verified" appears in its history, not because of a separate flag
// that could drift out of sync with the timeline.
//
// The happy path follows reportStatusPipeline (Submitted -> Pending ->
// Verified -> Resolved -> Points Accumulated). "Rejected" is a branch off
// Pending instead of continuing to Verified — see report id 8 below for an
// example. (No figma reference yet for the Rejected timeline's exact visual
// treatment — flag if you get one.)
//
// reporterId ties a report to currentUser.id (or another user) for
// ownership-based views like My Reports.
export const hazardReports = [
  {
    id: 1,
    reporterId: "user-jam-001",
    reporterName: "Jam Dagonio",
    timeAgo: "3 hrs ago",
    alertLevel: "red",
    title: "Large Pothole on Main Road Causing Traffic Delays",
    description: "Dangerous pothole discovered near the road intersection.",
    address: "Beside Barangay 167 Llano road in kamagong street",
    dateTime: "06/15/2026 11:26PM",
    hazardType: "Flood",
    barangay: 167,
    lat: 14.7569,
    lng: 120.9932,
    statusHistory: [
      { status: "Submitted", timestamp: "06/15/2026 11:26PM" },
      { status: "Pending", timestamp: "06/15/2026 11:30PM" },
      { status: "Verified", timestamp: "06/16/2026 08:00AM" },
    ],
    upvotes: 12,
    downvotes: 12,
    comments: 12,
    imageSrc: null,
  },
  {
    id: 2,
    reporterId: "user-jam-001",
    reporterName: "Jam Dagonio",
    timeAgo: "3 hrs ago",
    alertLevel: "blue",
    title: "Fallen Tree Blocking Barangay Road",
    description: "Large tree fell across the road after last night's storm.",
    address: "Near Barangay 174 Camarin Road",
    dateTime: "06/15/2026 11:26PM",
    hazardType: "Fallen Tree",
    barangay: 174,
    lat: 14.7621,
    lng: 121.0004,
    statusHistory: [
      { status: "Submitted", timestamp: "06/15/2026 11:26PM" },
      { status: "Pending", timestamp: "06/15/2026 11:30PM" },
    ],
    upvotes: 12,
    downvotes: 12,
    comments: 12,
    imageSrc: null,
  },
  {
    id: 3,
    reporterId: "user-jam-001",
    reporterName: "Jam Dagonio",
    timeAgo: "3 hrs ago",
    alertLevel: "white",
    title: "Exposed Electrical Wiring on Power Line",
    description: "Downed power line spotted hanging low over the sidewalk.",
    address: "Beside Barangay 177 Zapote Street",
    dateTime: "06/15/2026 11:26PM",
    hazardType: "Power Line",
    barangay: 177,
    lat: 14.7598,
    lng: 121.0041,
    statusHistory: [
      { status: "Submitted", timestamp: "06/10/2026 09:00AM" },
      { status: "Pending", timestamp: "06/10/2026 09:15AM" },
      { status: "Verified", timestamp: "06/11/2026 10:00AM" },
      { status: "Resolved", timestamp: "06/13/2026 03:00PM" },
      { status: "Points Accumulated", timestamp: "06/13/2026 03:01PM", pointsAwarded: 15 },
    ],
    upvotes: 12,
    downvotes: 12,
    comments: 12,
    imageSrc: null,
  },
  {
    id: 4,
    reporterId: "user-jam-001",
    reporterName: "Jam Dagonio",
    timeAgo: "3 hrs ago",
    alertLevel: "red",
    title: "Illegal Dumping Blocking Drainage Canal",
    description: "Garbage piled up near the canal, worsening flood risk.",
    address: "Beside Barangay 165 Deparo Road",
    dateTime: "06/15/2026 11:26PM",
    hazardType: "Illegal Dumping",
    barangay: 165,
    lat: 14.7487,
    lng: 120.9895,
    statusHistory: [
      { status: "Submitted", timestamp: "06/15/2026 11:26PM" },
      { status: "Pending", timestamp: "06/15/2026 11:30PM" },
    ],
    upvotes: 12,
    downvotes: 12,
    comments: 12,
    imageSrc: null,
  },
  {
    id: 5,
    reporterId: "user-jam-001",
    reporterName: "Jam Dagonio",
    timeAgo: "3 hrs ago",
    alertLevel: "red",
    title: "Structural Damage to Building Facade",
    description: "Cracked wall poses risk of collapse near a busy walkway.",
    address: "Beside Barangay 168 Llano Road",
    dateTime: "06/15/2026 11:26PM",
    hazardType: "Building Damage",
    barangay: 168,
    lat: 14.7543,
    lng: 120.9967,
    statusHistory: [
      { status: "Submitted", timestamp: "06/15/2026 11:26PM" },
      { status: "Pending", timestamp: "06/15/2026 11:30PM" },
      { status: "Verified", timestamp: "06/16/2026 08:00AM" },
    ],
    upvotes: 12,
    downvotes: 12,
    comments: 12,
    imageSrc: null,
  },

  // --- currentUser's own reports, for My Reports --------------------------
  {
    id: 6,
    reporterId: "user-001",
    reporterName: "Juan Dela Cruz",
    timeAgo: "3 hrs ago",
    alertLevel: "red",
    title: "Large Pothole on Main Road Causing Traffic Delays",
    description: "Dangerous pothole discovered near the road intersection.",
    address: "Beside Barangay 167 Llano road in kamagong street",
    dateTime: "06/15/2026 11:26PM",
    hazardType: "Flood",
    barangay: 167,
    lat: 14.7565,
    lng: 120.9938,
    statusHistory: [
      { status: "Submitted", timestamp: "06/15/2026 11:26PM" },
      { status: "Pending", timestamp: "06/15/2026 11:30PM" },
    ],
    upvotes: 12,
    downvotes: 12,
    comments: 12,
    imageSrc: null,
  },
  {
    id: 7,
    reporterId: "user-001",
    reporterName: "Juan Dela Cruz",
    timeAgo: "1 day ago",
    alertLevel: "blue",
    title: "Large Pothole on Main Road Causing Traffic Delays",
    description: "Dangerous pothole discovered near the road intersection.",
    address: "Beside Barangay 167 Llano road in kamagong street",
    dateTime: "06/14/2026 09:10AM",
    hazardType: "Road Damage",
    barangay: 167,
    lat: 14.7572,
    lng: 120.9945,
    statusHistory: [
      { status: "Submitted", timestamp: "06/14/2026 09:10AM" },
      { status: "Pending", timestamp: "06/14/2026 09:20AM" },
      { status: "Verified", timestamp: "06/14/2026 04:00PM" },
    ],
    upvotes: 8,
    downvotes: 1,
    comments: 3,
    imageSrc: null,
  },
  {
    id: 8,
    reporterId: "user-001",
    reporterName: "Juan Dela Cruz",
    timeAgo: "3 days ago",
    alertLevel: "white",
    title: "Suspected Illegal Dumping Near Creek",
    description: "Reported area turned out to be a permitted collection point.",
    address: "Near Barangay 169 Teofilo Samson Ave",
    dateTime: "06/12/2026 07:45AM",
    hazardType: "Illegal Dumping",
    barangay: 169,
    lat: 14.7521,
    lng: 120.9958,
    // Rejected branches off Pending instead of continuing to Verified.
    statusHistory: [
      { status: "Submitted", timestamp: "06/12/2026 07:45AM" },
      { status: "Pending", timestamp: "06/12/2026 08:00AM" },
      { status: "Rejected", timestamp: "06/12/2026 05:00PM" },
    ],
    upvotes: 1,
    downvotes: 4,
    comments: 2,
    imageSrc: null,
  },
  {
    id: 9,
    reporterId: "user-001",
    reporterName: "Juan Dela Cruz",
    timeAgo: "5 days ago",
    alertLevel: "red",
    title: "Large Pothole on Main Road Causing Traffic Delays",
    description: "Dangerous pothole discovered near the road intersection.",
    address: "Beside Barangay 167 Llano road in kamagong street",
    dateTime: "06/10/2026 06:30PM",
    hazardType: "Flood",
    barangay: 167,
    lat: 14.7558,
    lng: 120.9928,
    statusHistory: [
      { status: "Submitted", timestamp: "06/10/2026 06:30PM" },
      { status: "Pending", timestamp: "06/10/2026 06:45PM" },
      { status: "Verified", timestamp: "06/11/2026 09:00AM" },
      { status: "Resolved", timestamp: "06/12/2026 01:00PM" },
      { status: "Points Accumulated", timestamp: "06/12/2026 01:01PM", pointsAwarded: 15 },
    ],
    upvotes: 20,
    downvotes: 2,
    comments: 6,
    imageSrc: null,
  },
];