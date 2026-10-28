import { useEffect, useState } from "react";

export const SEVERITY_RANK = { High: 0, Medium: 1, Low: 2 };

export const SEVERITY_STYLE = {
  High: "bg-red-500 text-white",
  Medium: "bg-orange-500 text-white",
  Low: "bg-emerald-500 text-white",
};

// One chip style per report status (shared by queue, detail, in-progress, resolved)
export const STATUS_CHIP = {
  "Under Review": "border-slate-200 bg-slate-50 text-slate-600",
  "Needs Info": "border-amber-200 bg-amber-50 text-amber-700",
  "Field Check": "border-sky-200 bg-sky-50 text-sky-700",
  Verified: "border-violet-200 bg-violet-50 text-violet-700",
  Forwarded: "border-indigo-200 bg-indigo-50 text-indigo-700",
  "In Progress": "border-orange-200 bg-orange-50 text-orange-700",
  Resolved: "border-emerald-200 bg-emerald-50 text-emerald-700",
  Rejected: "border-red-200 bg-red-50 text-red-700",
};

export function useNow(intervalMs = 30000) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);

  return now;
}

export function timeAgo(iso, now) {
  const mins = Math.max(0, Math.floor((now - new Date(iso)) / 60000));
  if (mins < 1) return "Just now";
  if (mins < 60) return mins + " min ago";
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return hrs + " hr ago";
  return Math.floor(hrs / 24) + " d ago";
}

export function formatDateTime(iso) {
  return new Date(iso).toLocaleString("en-PH", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function credibilityOf(score) {
  return score >= 70
    ? { label: "Likely credible", style: "border-emerald-200 bg-emerald-50 text-emerald-700" }
    : { label: "Needs staff check", style: "border-amber-200 bg-amber-50 text-amber-700" };
}

// OpenStreetMap embed centered on a report pin
export const mapSrc = (lat, lng) =>
  "https://www.openstreetmap.org/export/embed.html?bbox=" +
  [lng - 0.003, lat - 0.0015, lng + 0.003, lat + 0.0015].map((n) => n.toFixed(5)).join("%2C") +
  "&layer=mapnik&marker=" +
  lat.toFixed(5) +
  "%2C" +
  lng.toFixed(5);