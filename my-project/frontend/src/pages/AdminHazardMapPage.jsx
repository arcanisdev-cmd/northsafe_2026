import { useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Polygon, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  Search,
  ChevronDown,
  Calendar,
  Compass,
  Plus,
  Minus,
  Maximize,
  ShieldAlert,
  ShieldCheck,
  Users,
  Clock3,
} from "lucide-react";
import AdminSidebar from "../layouts/AdminSidebar";
import AdminHeader from "../layouts/AdminHeader";

// ---------------------------------------------------------------------------
// Mock data — page-local (nothing here is reused elsewhere yet).
// ---------------------------------------------------------------------------

const mapCenter = [14.755, 120.996];
const mapZoom = 15;

// Dashed polygon boundary overlays — outline only, no fill, matching the
// mockup's monitored/at-risk zone outlines.
const mapZones = [
  {
    id: "zone-phase1-north",
    color: "#D4B106",
    positions: [
      [14.7625, 120.9895],
      [14.7625, 120.9995],
      [14.7565, 120.9995],
      [14.7565, 120.9895],
    ],
  },
  {
    id: "zone-riverbank-east",
    color: "#4C4CE0",
    positions: [
      [14.7605, 120.9945],
      [14.7605, 121.0035],
      [14.7515, 121.0035],
      [14.7515, 120.9945],
    ],
  },
];

// `type`: "verified" | "hotspot" | "flood" | "info" | "cluster"
// NOTE: the original design had two hotspot styles — a large translucent
// radius circle (with a flame icon + count badge) and this square "boxed"
// marker. Per instruction, only the boxed style is implemented; the
// radius-circle style is intentionally left out.
const mapMarkers = [
  { id: "m1", type: "verified", lat: 14.7615, lng: 120.992 },
  {
    id: "m2",
    type: "hotspot",
    lat: 14.758,
    lng: 120.9925,
    barangay: "Barangay 176",
    activeReports: 12,
  },
  { id: "m3", type: "cluster", lat: 14.7628, lng: 120.9955, count: 14, barangay: "BRGY 176" },
  { id: "m4", type: "info", lat: 14.755, lng: 121.0005, variant: "blue" },
  { id: "m5", type: "flood", lat: 14.753, lng: 120.9985 },
  { id: "m6", type: "info", lat: 14.749, lng: 120.995, variant: "gray" },
];

const alertLevelCounts = { white: 64, blue: 28, red: 9 };

const mapStats = {
  activeHazards: { total: 101, red: 9, blue: 28, white: 64 },
  verifiedReports: { inField: 76, note: "Rescue & Barangay Tanod deployed" },
  resolvedToday: { cleared: 25, avgResponseMinutes: 38 },
};

const tacticalLegend = [
  { label: "Red Alert - Evacuate/Life", color: "#E11D2E" },
  { label: "White Alert - Advisory", color: "#94A3B8" },
  { label: "Blue Alert - Moderate", color: "#2F6FD9" },
  { label: "Verified In Site", color: "#16A34A" },
];

// ---------------------------------------------------------------------------
// Leaflet divIcon builders. Raw HTML/inline-styles are used (not Tailwind
// classes) since this markup is handed directly to Leaflet outside React's
// render tree — inline styles guarantee it renders regardless of how the
// build tool processes class names.
// ---------------------------------------------------------------------------

const HOME_PATH = "M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1V9.5z";
const CHECK_PATH = "M5 13l4 4L19 7";
const DROP_PATH = "M12 2C12 2 5 10.5 5 15a7 7 0 0 0 14 0C19 10.5 12 2 12 2z";

function verifiedBadgeHtml() {
  return `
    <div style="position:absolute;bottom:-4px;right:-4px;width:16px;height:16px;border-radius:9999px;background:#16A34A;border:2px solid white;display:flex;align-items:center;justify-content:center;">
      <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="${CHECK_PATH}"/></svg>
    </div>`;
}

function verifiedIcon() {
  return L.divIcon({
    className: "",
    html: `
      <div style="width:32px;height:32px;border-radius:9999px;background:#16A34A;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 6px rgba(0,0,0,0.25);">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="${CHECK_PATH}"/></svg>
      </div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
}

// The pulsing hotspot marker — this is the "boxed red" style requested.
// Two expanding-ring pseudo-elements (defined in the <style> block below,
// via the .hotspot-pulse-ring class) sit behind a static rounded-square icon.
function hotspotIcon() {
  return L.divIcon({
    className: "",
    html: `
      <div style="position:relative;width:44px;height:44px;display:flex;align-items:center;justify-content:center;">
        <span class="hotspot-pulse-ring" style="animation-delay:0s;"></span>
        <span class="hotspot-pulse-ring" style="animation-delay:1s;"></span>
        <div style="position:relative;width:36px;height:36px;border-radius:10px;background:#E11D2E;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(225,29,46,0.5);border:2px solid white;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="white" stroke="white"><path d="${HOME_PATH}"/></svg>
          ${verifiedBadgeHtml()}
        </div>
      </div>`,
    iconSize: [44, 44],
    iconAnchor: [22, 22],
  });
}

function floodIcon() {
  return L.divIcon({
    className: "",
    html: `
      <div style="position:relative;width:36px;height:36px;border-radius:9999px;background:#2F6FD9;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 6px rgba(0,0,0,0.25);border:2px solid white;">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="${DROP_PATH}"/></svg>
        ${verifiedBadgeHtml()}
      </div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });
}

function infoIcon(variant) {
  const bg = variant === "blue" ? "#2F6FD9" : "#F1F5F9";
  const fg = variant === "blue" ? "#FFFFFF" : "#64748B";
  return L.divIcon({
    className: "",
    html: `
      <div style="width:28px;height:28px;border-radius:9999px;background:${bg};display:flex;align-items:center;justify-content:center;font-family:sans-serif;font-weight:700;font-size:13px;color:${fg};box-shadow:0 1px 4px rgba(0,0,0,0.2);border:2px solid white;">i</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
}

function clusterIcon(count, barangay) {
  return L.divIcon({
    className: "",
    html: `
      <div style="display:flex;flex-direction:column;align-items:center;gap:2px;">
        <div style="min-width:34px;height:26px;padding:0 8px;border-radius:8px;background:#0B1830;color:white;display:flex;align-items:center;justify-content:center;font-family:sans-serif;font-weight:700;font-size:12px;box-shadow:0 2px 6px rgba(0,0,0,0.3);">+${count}</div>
        <div style="background:white;padding:1px 6px;border-radius:4px;font-family:sans-serif;font-size:9px;font-weight:600;color:#0B1830;box-shadow:0 1px 3px rgba(0,0,0,0.2);white-space:nowrap;">${barangay}</div>
      </div>`,
    iconSize: [70, 44],
    iconAnchor: [35, 22],
  });
}

function iconFor(marker) {
  switch (marker.type) {
    case "verified":
      return verifiedIcon();
    case "hotspot":
      return hotspotIcon();
    case "flood":
      return floodIcon();
    case "info":
      return infoIcon(marker.variant);
    case "cluster":
      return clusterIcon(marker.count, marker.barangay);
    default:
      return verifiedIcon();
  }
}

// ---------------------------------------------------------------------------
// Small local sub-components
// ---------------------------------------------------------------------------

function FilterBar({ search, onSearchChange }) {
  return (
    <div className="mb-4 flex flex-wrap items-center gap-3">
      <div className="relative min-w-[220px]">
        <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Bagong Silang, Phs 8A"
          className="w-full rounded-lg border border-[#E5EEF9] bg-white py-2.5 pl-9 pr-3 text-sm text-slate-700 outline-none focus:border-[#2F6FD9]"
        />
      </div>

      {/* TODO: wire to real hazard-type filtering */}
      <div className="relative">
        <select className="appearance-none rounded-lg border border-[#E5EEF9] bg-white py-2.5 pl-3 pr-9 text-sm font-medium text-slate-600 outline-none focus:border-[#2F6FD9]">
          <option>All Hazards (Flooding, Fire, Road...)</option>
        </select>
        <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
      </div>

      {/* TODO: wire these to actually filter markers by alert level */}
      <div className="flex items-center gap-2 rounded-lg border border-[#E5EEF9] bg-white px-3 py-2 text-xs font-semibold">
        <span className="flex items-center gap-1.5 text-slate-500">
          <span className="h-2 w-2 rounded-full bg-slate-400" /> White Alert
          <span className="rounded bg-slate-100 px-1.5 py-0.5 text-slate-600">{alertLevelCounts.white}</span>
        </span>
        <span className="flex items-center gap-1.5 text-blue-600">
          <span className="h-2 w-2 rounded-full bg-blue-600" /> Blue Alert
          <span className="rounded bg-blue-100 px-1.5 py-0.5">{alertLevelCounts.blue}</span>
        </span>
        <span className="flex items-center gap-1.5 text-red-600">
          <span className="h-2 w-2 rounded-full bg-red-600" /> Red Alert
          <span className="rounded bg-red-100 px-1.5 py-0.5">{alertLevelCounts.red}</span>
        </span>
      </div>

      {/* TODO: wire to a real date range picker */}
      <button type="button" className="flex items-center gap-2 rounded-lg border border-[#E5EEF9] bg-white px-3 py-2.5 text-sm font-medium text-slate-600 hover:border-slate-300">
        <Calendar size={14} className="text-slate-400" />
        Today (Last 24 Hours)
      </button>
    </div>
  );
}

function MapControls() {
  const map = useMap();
  const btnClass =
    "flex h-9 w-9 items-center justify-center rounded-lg border border-[#E5EEF9] bg-white text-slate-600 shadow-sm transition-colors hover:bg-slate-50";

  const toggleFullscreen = () => {
    const el = map.getContainer().parentElement;
    if (!document.fullscreenElement) {
      el?.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  };

  return (
    <div className="absolute right-4 top-1/2 z-[1000] flex -translate-y-1/2 flex-col gap-2">
      <button type="button" onClick={() => map.setView(mapCenter, mapZoom)} className={btnClass} title="Recenter">
        <Compass size={16} />
      </button>
      <button type="button" onClick={() => map.zoomIn()} className={btnClass} title="Zoom in">
        <Plus size={16} />
      </button>
      <button type="button" onClick={() => map.zoomOut()} className={btnClass} title="Zoom out">
        <Minus size={16} />
      </button>
      <button type="button" onClick={toggleFullscreen} className={btnClass} title="Fullscreen">
        <Maximize size={16} />
      </button>
    </div>
  );
}

function StatCard({ icon: Icon, iconColor, label, value, valueColor, children }) {
  return (
    <div className="rounded-2xl border border-[#E5EEF9] bg-white p-4 shadow-sm">
      <div className="mb-1 flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p>
        <Icon size={16} style={{ color: iconColor }} />
      </div>
      <p className="text-2xl font-bold" style={{ color: valueColor }}>{value}</p>
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function AdminHazardMapPage() {
  const [search, setSearch] = useState("");

  const handleLogout = () => {
    // TODO: wire up to LogoutConfirmModal.jsx.
    console.log("logout clicked");
  };

  return (
    <div className="flex min-h-screen bg-[#EAF2FB]">
      {/* Radar-style pulsing ring animation for the hotspot marker */}
      <style>{`
        .hotspot-pulse-ring {
          position: absolute;
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: rgba(225, 29, 46, 0.45);
          animation: hotspotPulse 2s ease-out infinite;
        }
        @keyframes hotspotPulse {
          0% { transform: scale(1); opacity: 0.7; }
          100% { transform: scale(2.4); opacity: 0; }
        }
      `}</style>

      <AdminSidebar onLogout={handleLogout} />

      <div className="flex min-w-0 flex-1 flex-col">
        <AdminHeader title="HAZARD MAP" subtitle="" />

        <main className="flex-1 space-y-5 p-6">
          <FilterBar search={search} onSearchChange={setSearch} />

          <div className="relative h-[540px] overflow-hidden rounded-2xl border border-[#E5EEF9] shadow-sm">
            <MapContainer center={mapCenter} zoom={mapZoom} zoomControl={false} className="h-full w-full">
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {mapZones.map((zone) => (
                <Polygon
                  key={zone.id}
                  positions={zone.positions}
                  pathOptions={{ color: zone.color, weight: 2, dashArray: "6 6", fillOpacity: 0.03 }}
                />
              ))}

              {mapMarkers.map((marker) => (
                <Marker
                  key={marker.id}
                  position={[marker.lat, marker.lng]}
                  icon={iconFor(marker)}
                  eventHandlers={{
                    click: () => {
                      // TODO: clicking a hotspot should open a detail
                      // popup/panel (active reports, barangay, etc).
                      // Deferred — this pass is replication-only.
                      if (marker.type === "hotspot") {
                        console.log("hotspot clicked — detail view not built yet", marker);
                      }
                    },
                  }}
                />
              ))}

              <MapControls />
            </MapContainer>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard icon={ShieldAlert} iconColor="#E11D2E" label="Active Hazards" value={`${mapStats.activeHazards.total} Active`} valueColor="#0B1830">
              <p className="mt-1 text-xs text-slate-500">
                <span className="font-semibold text-red-600">{mapStats.activeHazards.red} Red</span> ·{" "}
                <span className="font-semibold text-blue-600">{mapStats.activeHazards.blue} Blue</span> ·{" "}
                <span className="font-semibold text-slate-500">{mapStats.activeHazards.white} White</span>
              </p>
            </StatCard>

            <StatCard icon={ShieldCheck} iconColor="#16A34A" label="Verified Reports" value={`${mapStats.verifiedReports.inField} In Field`} valueColor="#16A34A">
              <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                <Users size={12} /> {mapStats.verifiedReports.note}
              </p>
            </StatCard>

            <StatCard icon={ShieldCheck} iconColor="#16A34A" label="Resolved Today" value={`${mapStats.resolvedToday.cleared} Cleared`} valueColor="#16A34A">
              <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                <Clock3 size={12} /> {mapStats.resolvedToday.avgResponseMinutes} mins avg · Response resolution time
              </p>
            </StatCard>

            <div className="rounded-2xl border border-[#E5EEF9] bg-white p-4 shadow-sm">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Tactical Map Legend</p>
                <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-500">CDRRMO</span>
              </div>
              <ul className="space-y-1">
                {tacticalLegend.map((item) => (
                  <li key={item.label} className="flex items-center gap-2 text-xs text-slate-600">
                    <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: item.color }} />
                    {item.label}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
