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
//
// `comments` used to be a hand-typed count with no backing content. It's
// now DERIVED (see HazardReportCard) from `commentsList.length` below, so
// the number shown on the card and the actual thread can never drift apart.
// `commentsList` entries: { id, name, avatarUrl, message, timeAgo }.
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
    comments: 5,
    commentsList: [
      {
        id: "c1-1",
        name: "Jam Dagonio",
        avatarUrl: null,
        message: "Di naman totoo yan. wala namang ganyang baha dito sa baranggay 167",
        timeAgo: "5 hr ago",
      },
      {
        id: "c1-2",
        name: "Jak Roberto",
        avatarUrl: null,
        message: "Fake news po iyan. Delete mo na post mo.",
        timeAgo: "5 hrs ago",
      },
      {
        id: "c1-3",
        name: "Josephine Bracken",
        avatarUrl: null,
        message: "Liar kang kankaloo ka!",
        timeAgo: "3 hrs ago",
      },
      {
        id: "c1-4",
        name: "Josefine",
        avatarUrl: null,
        message: "ay oo. bumabaha dito piro hinde ganyan",
        timeAgo: "2 hrs ago",
      },
      {
        id: "c1-5",
        name: "Rey Valera",
        avatarUrl: null,
        message: "Grabe naman itong report na ito, sino ba nagbigay nito.",
        timeAgo: "1 hrs ago",
      },
    ],
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
    comments: 0,
    commentsList: [],
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
    comments: 1,
    commentsList: [
      {
        id: "c3-1",
        name: "Rey Valera",
        avatarUrl: null,
        message: "Ingat po dyan, malapit yan sa waiting shed.",
        timeAgo: "6 hrs ago",
      },
    ],
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
    comments: 0,
    commentsList: [],
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
    comments: 0,
    commentsList: [],
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
    comments: 0,
    commentsList: [],
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
    commentsList: [
      {
        id: "c7-1",
        name: "Maria Santos",
        avatarUrl: null,
        message: "Same po dito sa amin, sana ma-ayos na agad.",
        timeAgo: "20 hrs ago",
      },
      {
        id: "c7-2",
        name: "Bong Cruz",
        avatarUrl: null,
        message: "Nareport ko na rin ito sa barangay hall.",
        timeAgo: "18 hrs ago",
      },
      {
        id: "c7-3",
        name: "Jam Dagonio",
        avatarUrl: null,
        message: "Salamat sa pag-verify, ingat lahat dyan.",
        timeAgo: "10 hrs ago",
      },
    ],
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
    commentsList: [
      {
        id: "c8-1",
        name: "Josephine Bracken",
        avatarUrl: null,
        message: "Permitted collection point po talaga yan, nagtanong na ako sa LGU.",
        timeAgo: "2 days ago",
      },
      {
        id: "c8-2",
        name: "Rey Valera",
        avatarUrl: null,
        message: "Ah okay, pasensya na sa maling report.",
        timeAgo: "2 days ago",
      },
    ],
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
    commentsList: [
      {
        id: "c9-1",
        name: "Maria Santos",
        avatarUrl: null,
        message: "Grabe malaki pala ito, salamat sa report.",
        timeAgo: "4 days ago",
      },
      {
        id: "c9-2",
        name: "Bong Cruz",
        avatarUrl: null,
        message: "Na-fix na ba ito? Dadaan ako mamaya.",
        timeAgo: "3 days ago",
      },
      {
        id: "c9-3",
        name: "Jak Roberto",
        avatarUrl: null,
        message: "Oo na-resolve na, ayos na daanan.",
        timeAgo: "2 days ago",
      },
      {
        id: "c9-4",
        name: "Josefine",
        avatarUrl: null,
        message: "Ang bilis, galing ng LGU natin.",
        timeAgo: "2 days ago",
      },
      {
        id: "c9-5",
        name: "Rey Valera",
        avatarUrl: null,
        message: "Sana ganito palagi ang response time.",
        timeAgo: "1 day ago",
      },
      {
        id: "c9-6",
        name: "Josephine Bracken",
        avatarUrl: null,
        message: "Salamat Juan sa pag-report nito!",
        timeAgo: "1 day ago",
      },
    ],
    imageSrc: null,
  },
];

// ---------------------------------------------------------------
// STAFF (Barangay Personnel)
// ---------------------------------------------------------------
export const staffOfficer = {
  id: "staff-001",
  name: "Juan Dela Cruz",
  initials: "JD",
  role: "staff",
  avatarUrl: null,
  assignedBarangays: ["Barangay 171 (Bagumbong)"],
};

// Field check pipeline. fieldChecksPending is derived from this.
export const staffFieldChecks = {
  awaitingCheck: 3,
  inProgress: 2,
  findingsToRecord: 1,
};

export const staffDashboardStats = {
  totalReports: 1248,
  weeklyChangePct: 14,
  pendingReview: 24,
  highSeverity: 18,
  resolved: 1152,
  flagged: 14,
  fieldChecksPending: Object.values(staffFieldChecks).reduce(
    (sum, n) => sum + n,
    0
  ),
};

// Mock timestamps are relative to "now" so "x min ago" always looks live
const minutesAgo = (m) => new Date(Date.now() - m * 60000).toISOString();

// Shape of a future GET /staff/reports?status=pending&sort=priority
export const staffPriorityReports = [
  {
    id: "NS-2026-000123",
    title: "Knee-deep flood on main road",
    location: "Susano Rd cor. Bagumbong",
    category: "Flood",
    severity: "High",
    credibility: 97,
    submittedAt: minutesAgo(4),
    thumbnailUrl: null,
  },
  {
    id: "NS-2026-000124",
    title: "Pothole near school",
    location: "Near Bagumbong Elementary School",
    category: "Road Damage",
    severity: "Medium",
    credibility: 46,
    submittedAt: minutesAgo(9),
    thumbnailUrl: null,
  },
  {
    id: "NS-2026-000128",
    title: "Fallen tree blocking road",
    location: "Bagumbong Creek Road",
    category: "Road Damage",
    severity: "Medium",
    credibility: 82,
    submittedAt: minutesAgo(15),
    thumbnailUrl: null,
  },
  {
    id: "NS-2026-000130",
    title: "Downed power line",
    location: "Sector 4",
    category: "Electrical Hazard",
    severity: "Low",
    credibility: 82,
    submittedAt: minutesAgo(22),
    thumbnailUrl: null,
  },
  {
    id: "NS-2026-000131",
    title: "Blocked drainage",
    location: "Susano Rd",
    category: "Flood",
    severity: "Low",
    credibility: 58,
    submittedAt: minutesAgo(31),
    thumbnailUrl: null,
  },
];

// Named categories only. "Other" is derived so the donut always sums to totalReports.
const NAMED_CATEGORIES = [
  { label: "Flood", count: 349, color: "#2563EB" },
  { label: "Road Damage", count: 274, color: "#F97316" },
  { label: "Electrical Hazard", count: 175, color: "#FACC15" },
  { label: "Fire Risk", count: 112, color: "#EF4444" },
];

export const staffHazardCategories = [
  ...NAMED_CATEGORIES,
  {
    label: "Other",
    count:
      staffDashboardStats.totalReports -
      NAMED_CATEGORIES.reduce((sum, c) => sum + c.count, 0),
    color: "#94A3B8",
  },
];

// Shape of a future GET /staff/activity?limit=4
export const staffRecentActivity = [
  { id: "NS-2026-000118", type: "Verified", hazard: "Flood", location: "Bagumbong", note: "by Juan Dela Cruz", at: minutesAgo(12) },
  { id: "NS-2026-000117", type: "Field Check", hazard: "Road Damage", location: "Bagumbong", note: "by Juan Dela Cruz", at: minutesAgo(28) },
  { id: "NS-2026-000116", type: "Forwarded", hazard: "Fire Risk", location: "Bagumbong", note: "to BFP (call)", at: minutesAgo(60) },
  { id: "NS-2026-000113", type: "Rejected", hazard: "Electrical Hazard", location: "Bagumbong", note: "Reused photo", at: minutesAgo(120) },
];

// Mock for the OpenWeather API (already in your stack)
export const staffWeather = {
  tempC: 28,
  condition: "Heavy rain",
  location: "Bagumbong, North Caloocan",
};

// Sidebar badges read from the same stats, so they always match the cards
export const staffNavBadges = {
  reviewQueue: staffDashboardStats.pendingReview,
  inProgress: 3,
  fieldChecks: staffDashboardStats.fieldChecksPending,
  notifications: 3,
};

// ---------------------------------------------------------------
// STAFF REVIEW QUEUE
// ---------------------------------------------------------------
const REPORTERS = ["M. Reyes", "K. Villanueva", "R. Santos", "A. Mercado", "J. Lim"];

const QUEUE_TEMPLATES = [
  { title: "Knee-deep flood on main road", location: "Susano Rd cor. Bagumbong", category: "Flood", severity: "High", credibility: 97, status: "Under Review", confirmations: 3, disputes: 0, reusedPhoto: false, aiMatch: true, description: "Floodwater is about knee-deep and covering both lanes. Tricycles and pedestrians cannot pass safely." },
  { title: "Pothole near school", location: "Near Bagumbong Elementary School", category: "Road Damage", severity: "Medium", credibility: 46, status: "Field Check", confirmations: 0, disputes: 0, reusedPhoto: true, aiMatch: false, aiCategory: "Other", description: "Large pothole at the school gate. Students walk around it into the road." },
  { title: "Fallen tree blocking road", location: "Bagumbong Creek Road", category: "Other", severity: "Medium", credibility: 62, status: "Needs Info", confirmations: 1, disputes: 0, reusedPhoto: false, aiMatch: true, description: "A tree fell across one lane after last night's rain. Traffic is slowed down." },
  { title: "Downed power line", location: "Sector 4", category: "Electrical Hazard", severity: "Low", credibility: 82, status: "Under Review", confirmations: 2, disputes: 0, reusedPhoto: false, aiMatch: true, description: "A cable is hanging low over the alley beside the sari-sari store." },
  { title: "Blocked drainage", location: "Susano Rd", category: "Flood", severity: "Low", credibility: 58, status: "Needs Info", confirmations: 0, disputes: 0, reusedPhoto: false, aiMatch: true, description: "Drain cover is clogged with garbage and water pools after light rain." },
  { title: "Gas leak smell", location: "Zone 3", category: "Fire Risk", severity: "High", credibility: 64, status: "Under Review", confirmations: 0, disputes: 0, reusedPhoto: false, aiMatch: true, description: "Residents smell gas near a row of eateries. No flames or smoke seen." },
  { title: "Illegal dumping", location: "Near Bagumbong Creek", category: "Waste", severity: "Medium", credibility: 74, status: "Under Review", confirmations: 1, disputes: 0, reusedPhoto: false, aiMatch: true, description: "Piles of household waste along the creek bank, growing for several days." },
  { title: "Cracked wall on old structure", location: "Sector 2", category: "Building Damage", severity: "Medium", credibility: 52, status: "Field Check", confirmations: 0, disputes: 2, reusedPhoto: false, aiMatch: false, aiCategory: "Road Damage", description: "Long diagonal crack on the wall of an old building beside the footpath." },
];

// 24 reports (3 cycles of 8 templates). Shape of a future GET /staff/reports?status=pending
export const staffReviewQueue = Array.from({ length: 24 }, (_, i) => {
  const t = QUEUE_TEMPLATES[i % QUEUE_TEMPLATES.length];
  return {
    ...t,
    id: "NS-2026-" + String(123 + i).padStart(6, "0"),
    credibility: Math.min(99, Math.max(10, t.credibility + ((i * 7) % 9) - 4)),
    aiCategory: t.aiCategory || t.category,
    aiSeverity: t.severity,
    reporter: REPORTERS[i % REPORTERS.length],
    lat: 14.754 + ((i * 37) % 20) / 10000,
    lng: 121.0295 + ((i * 53) % 30) / 10000,
    submittedAt: minutesAgo(4 + i * 9),
    thumbnailUrl: null,
  };
});

export const staffReportStatuses = ["Under Review", "Needs Info", "Field Check"];

// Keep the sidebar badge and dashboard cards in sync with the queue
staffNavBadges.reviewQueue = staffReviewQueue.length;
staffDashboardStats.pendingReview = staffReviewQueue.length;
staffDashboardStats.highSeverity = staffReviewQueue.filter(
  (r) => r.severity === "High"
).length;

// ---------------------------------------------------------------
// STAFF REPORT DETAIL (forwarding + decisions)
// ---------------------------------------------------------------
// Receiving offices. Routing configuration is owned by Admin.
export const staffReceivingOffices = [
  "BFP",
  "City Health Department",
  "PSTMD",
  "City Engineering Department",
  "CDRRMO / EOC",
];

export const staffForwardMethods = ["Phone call", "Text message", "Messaging app"];

// Mock of the Admin routing rules: suggested office per hazard category
export const staffRoutingSuggestions = {
  Flood: "CDRRMO / EOC",
  "Road Damage": "City Engineering Department",
  "Electrical Hazard": "City Engineering Department",
  "Fire Risk": "BFP",
  Waste: "City Health Department",
  "Building Damage": "City Engineering Department",
  Other: "CDRRMO / EOC",
};

export const staffRejectReasons = [
  "Reused or stolen photo",
  "Location does not match the report",
  "Not a physical or environmental hazard",
  "Duplicate report",
  "Outside Barangay 171 coverage",
  "Other",
];

export const staffSuspiciousReasons = [
  "Photo looks edited or AI-generated",
  "Reused photo from another report",
  "Location does not match the photo",
  "Repeated false reports from this account",
  "Other",
];

export const staffDeactivationReasons = [
  "Repeated false or fake reports",
  "Abusive or misleading content",
  "Suspected duplicate or fake account",
  "Other",
];

// Mock reporter history (a future GET /staff/reporters/:id/history)
export const staffReporterHistory = {
  "M. Reyes": { submitted: 14, verified: 12, rejected: 1 },
  "K. Villanueva": { submitted: 6, verified: 5, rejected: 0 },
  "R. Santos": { submitted: 9, verified: 4, rejected: 3 },
  "A. Mercado": { submitted: 3, verified: 1, rejected: 2 },
  "J. Lim": { submitted: 21, verified: 19, rejected: 1 },
};

// ---------------------------------------------------------------
// STAFF IN PROGRESS (forwarded + in-progress seed reports)
// ---------------------------------------------------------------
const IN_PROGRESS_TEMPLATES = [
  { id: "NS-2026-000112", title: "Flooding on main road", location: "Susano Rd cor. Bagumbong", category: "Flood", severity: "High", credibility: 95, status: "In Progress", confirmations: 4, reporter: "M. Reyes", description: "Knee-deep flood near the market area. Vehicles are having difficulty passing.", office: "CDRRMO / EOC", method: "Phone call", contact: "Duty officer", fwdNote: "Reported knee-deep flooding on Susano Rd.", forwardedAgo: 420, updates: [{ note: "Office confirmed the report and is checking drainage.", method: "Phone call", ago: 240 }, { note: "Water is slowly receding on one lane.", method: "Text message", ago: 60 }] },
  { id: "NS-2026-000116", title: "Overloaded extension cords near stalls", location: "Zone 3", category: "Fire Risk", severity: "Medium", credibility: 81, status: "In Progress", confirmations: 2, reporter: "J. Lim", description: "Many extension cords are daisy-chained along a row of food stalls. Fire risk only, no fire.", office: "BFP", method: "Phone call", contact: "Fire safety desk", fwdNote: "Possible electrical fire risk at the stalls.", forwardedAgo: 300, updates: [{ note: "BFP will schedule a safety inspection.", method: "Phone call", ago: 150 }] },
  { id: "NS-2026-000119", title: "Downed power line", location: "Sector 4", category: "Electrical Hazard", severity: "Low", credibility: 84, status: "In Progress", confirmations: 2, reporter: "K. Villanueva", description: "A cable hangs low over the alley beside the sari-sari store.", office: "City Engineering Department", method: "Text message", contact: "", fwdNote: "Low-hanging cable over a walkway.", forwardedAgo: 600, updates: [{ note: "Crew assigned; repair expected within the day.", method: "Text message", ago: 200 }] },
  { id: "NS-2026-000120", title: "Fallen tree blocking road", location: "Bagumbong Creek Road", category: "Other", severity: "Medium", credibility: 78, status: "Forwarded", confirmations: 1, reporter: "R. Santos", description: "A tree fell across one lane after last night's rain.", office: "CDRRMO / EOC", method: "Phone call", contact: "", fwdNote: "Tree blocking one lane of the creek road.", forwardedAgo: 95, updates: [] },
  { id: "NS-2026-000121", title: "Illegal dumping", location: "Near Bagumbong Creek", category: "Waste", severity: "Medium", credibility: 72, status: "Forwarded", confirmations: 1, reporter: "A. Mercado", description: "Household waste is piling up along the creek bank.", office: "City Health Department", method: "Messaging app", contact: "", fwdNote: "Growing dump site beside the creek.", forwardedAgo: 180, updates: [] },
  { id: "NS-2026-000122", title: "Cracked wall on old structure", location: "Sector 2", category: "Building Damage", severity: "Medium", credibility: 76, status: "Forwarded", confirmations: 2, reporter: "J. Lim", description: "Long diagonal crack on an old building beside the footpath. Field check confirmed it.", office: "City Engineering Department", method: "Phone call", contact: "Engineering desk", fwdNote: "Field check confirmed the crack is widening.", forwardedAgo: 45, updates: [] },
];

export const staffInProgressReports = IN_PROGRESS_TEMPLATES.map((t, i) => {
  const { office, method, contact, fwdNote, forwardedAgo, updates, ...rest } = t;
  const submittedAt = minutesAgo(forwardedAgo + 90);
  const forwardedAt = minutesAgo(forwardedAgo);
  return {
    ...rest,
    aiCategory: rest.category,
    aiSeverity: rest.severity,
    disputes: 0,
    reusedPhoto: false,
    aiMatch: true,
    lat: 14.7532 + i * 0.0003,
    lng: 121.0301 + i * 0.0004,
    submittedAt,
    thumbnailUrl: null,
    forwarding: { office, method, contact, note: fwdNote, at: forwardedAt },
    updates: updates.map((u) => ({ note: u.note, method: u.method, at: minutesAgo(u.ago), by: staffOfficer.name })),
    timeline: [
      { label: "Report submitted", detail: "By " + rest.reporter, at: submittedAt, by: "Reporter" },
      { label: "Verified by staff", detail: "Ready to forward to the receiving office.", at: minutesAgo(forwardedAgo + 30), by: staffOfficer.name },
      { label: "Forwarded to " + office, detail: "Via " + method + ". " + fwdNote, at: forwardedAt, by: staffOfficer.name },
      ...updates.map((u) => ({ label: "Progress update", detail: u.note + " (via " + u.method.toLowerCase() + ")", at: minutesAgo(u.ago), by: staffOfficer.name })),
    ],
  };
});

staffNavBadges.inProgress = staffInProgressReports.length;

// ---------------------------------------------------------------
// STAFF FIELD CHECKS (guides + findings outcomes)
// ---------------------------------------------------------------
export const staffFieldChecklists = {
  Flood: ["Estimate the water depth", "Check whether the road is passable", "Look for blocked drains or canals", "Note how many households are affected"],
  "Road Damage": ["Note the size and depth of the damage", "Check how much traffic is affected", "Look for walkways or a school nearby", "Take a clear photo for the record"],
  "Electrical Hazard": ["Keep your distance and never touch a wire", "Note the pole or line location and height", "Look for sparks or burn marks", "Note whether people pass by often"],
  "Fire Risk": ["Look for overloaded outlets or loose wiring", "Check whether exits are blocked", "Note flammable materials nearby", "If you see flames or smoke, call the emergency hotlines right away"],
  Waste: ["Estimate the volume of waste", "Check whether it is near drains or water", "Note any smell or health concern", "Ask how long it has been piling up"],
  "Building Damage": ["Measure the crack width and length", "Check whether walls lean or sag", "Note whether people stay near the structure", "Take a clear photo for the record"],
  Other: ["Describe the hazard in your own words", "Note what it blocks or affects", "Take a clear photo for the record"],
};

// Each outcome decides the report's next status
export const staffFieldOutcomes = [
  { value: "Hazard confirmed on site", status: "Verified", result: "The report becomes Verified and can be forwarded." },
  { value: "Hazard not found at the location", status: "Rejected", result: "The report is rejected and leaves the queue." },
  { value: "Could not confirm (no access or unclear)", status: "Needs Info", result: "The report goes back to Needs Info for the reporter." },
];