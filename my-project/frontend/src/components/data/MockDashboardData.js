// Placeholder data for the dashboard hero. Structured so the backend dev can
// swap these for real API responses without touching component code — the
// shape here is what DashboardHero.jsx expects as props/imports.

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

// Placeholder for the logged-in user shown in AuthNavbar. Shaped to match
// whatever the real auth/session endpoint will eventually return.
export const currentUser = {
  name: "Juan Dela Cruz",
  points: 140,
  avatarUrl: null,
};