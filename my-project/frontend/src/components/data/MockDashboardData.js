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

// Placeholder hazard reports for the feed. alertLevel is "red" | "blue" |
// "white", matching the three AlertPill variants in HazardReportCard.
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
    title: "Large Pothole on Main Road Causing Traffic Delays",
    description: "Dangerous pothole discovered near the road intersection.",
    address: "Beside Barangay 167 Llano road in kamagong street",
    dateTime: "06/15/2026 11:26PM",
    hazardType: "Flood",
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
    title: "Large Pothole on Main Road Causing Traffic Delays",
    description: "Dangerous pothole discovered near the road intersection.",
    address: "Beside Barangay 167 Llano road in kamagong street",
    dateTime: "06/15/2026 11:26PM",
    hazardType: "Flood",
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
    title: "Large Pothole on Main Road Causing Traffic Delays",
    description: "Dangerous pothole discovered near the road intersection.",
    address: "Beside Barangay 167 Llano road in kamagong street",
    dateTime: "06/15/2026 11:26PM",
    hazardType: "Flood",
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
    title: "Large Pothole on Main Road Causing Traffic Delays",
    description: "Dangerous pothole discovered near the road intersection.",
    address: "Beside Barangay 167 Llano road in kamagong street",
    dateTime: "06/15/2026 11:26PM",
    hazardType: "Flood",
    verified: true,
    upvotes: 12,
    downvotes: 12,
    comments: 12,
    imageSrc: null,
  },
];