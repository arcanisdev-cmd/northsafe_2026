import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  RefreshCw,
  ChevronDown,
  Flame,
  Info,
  ArrowRight,
  Compass,
  Plus,
  Minus,
  Maximize,
} from "lucide-react";
import StaffSidebar from "../layouts/StaffSidebar";
import StaffHeader from "../layouts/StaffHeader";
import {
  getStaffMapReports,
  staffSiteCoords,
} from "../components/data/MockDashboardData";
import { SEVERITY_RANK, SEVERITY_STYLE, useNow, timeAgo } from "../utils/staffHelpers";

// ---------------------------------------------------------------
// CONSTANTS
// ---------------------------------------------------------------
const TZ = "Asia/Manila";
const MAP_CENTER = [14.7558, 121.0396];
const MAP_ZOOM = 16;
const NEARBY_M = 120; // "nearby / possible duplicate" radius
const HOTSPOT_M = 150; // hotspot grouping radius
const HOTSPOT_MIN = 3; // reports needed to form a hotspot

const SEVERITY_COLOR = { High: "#EF4444", Medium: "#F97316", Low: "#22C55E" };
const SEVERITY_DOT = { High: "bg-red-500", Medium: "bg-orange-500", Low: "bg-emerald-500" };

const STATUS_GLYPH = {
  "Under Review": "R",
  "Needs Info": "?",
  "Field Check": "F",
  Verified: "V",
  Forwarded: "→",
  "In Progress": "P",
  Resolved: "✓",
};
const MAP_STATUSES = Object.keys(STATUS_GLYPH);

const STATUS_STYLE = {
  "Under Review": "border-blue-200 bg-blue-50 text-blue-700",
  "Needs Info": "border-amber-200 bg-amber-50 text-amber-700",
  "Field Check": "border-violet-200 bg-violet-50 text-violet-700",
  Verified: "border-emerald-200 bg-emerald-50 text-emerald-700",
  Forwarded: "border-indigo-200 bg-indigo-50 text-indigo-700",
  "In Progress": "border-sky-200 bg-sky-50 text-sky-700",
  Resolved: "border-slate-200 bg-slate-50 text-slate-600",
};

const SUBMITTED_OPTIONS = [
  { value: "any", label: "Any time" },
  { value: "1440", label: "Last 24 hours" },
  { value: "10080", label: "Last 7 days" },
  { value: "43200", label: "Last 30 days" },
];

const INITIAL_FILTERS = { category: "All", severity: "All", status: "All", submitted: "any" };

const SITES = Object.entries(staffSiteCoords).map(([name, c]) => ({ name, lat: c[0], lng: c[1] }));

const withAll = (values, allLabel) => [
  { value: "All", label: allLabel },
  ...values.map((v) => ({ value: v, label: v })),
];

const fmtDateTime = (iso) =>
  new Date(iso).toLocaleString("en-PH", {
    timeZone: TZ,
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

// ---------------------------------------------------------------
// MAP HELPERS
// ---------------------------------------------------------------
function distanceM(a, b) {
  const R = 6371000;
  const rad = Math.PI / 180;
  const dLat = (b.lat - a.lat) * rad;
  const dLng = (b.lng - a.lng) * rad;
  const h =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  return 2 * R * Math.asin(Math.sqrt(h));
}

function nearestSiteName(point) {
  let best = SITES[0];
  SITES.forEach((s) => {
    if (distanceM(point, s) < distanceM(point, best)) best = s;
  });
  return best.name;
}

// Descriptive grouping only: a hotspot is NOT verification
function findHotspots(list) {
  const left = [...list];
  const spots = [];

  while (left.length) {
    const seed = left.shift();
    const group = [seed];
    for (let i = left.length - 1; i >= 0; i--) {
      if (distanceM(seed, left[i]) <= HOTSPOT_M) group.push(left.splice(i, 1)[0]);
    }
    if (group.length < HOTSPOT_MIN) continue;

    const center = {
      lat: group.reduce((s, r) => s + r.lat, 0) / group.length,
      lng: group.reduce((s, r) => s + r.lng, 0) / group.length,
    };
    const radius = Math.max(...group.map((r) => distanceM(center, r))) + 40;
    const top = group.reduce((a, b) => (SEVERITY_RANK[b.severity] < SEVERITY_RANK[a.severity] ? b : a));

    spots.push({
      key: group[0].id,
      count: group.length,
      center,
      radius,
      topSeverity: top.severity,
      name: nearestSiteName(center),
    });
  }

  return spots.sort((a, b) => b.count - a.count);
}

function pinIcon(r, selected) {
  const size = selected ? 38 : 30;
  const style =
    "width:" + size + "px;height:" + size + "px;display:flex;align-items:center;justify-content:center;" +
    "border-radius:9999px;color:#fff;font:700 12px/1 system-ui,sans-serif;" +
    "box-shadow:0 1px 4px rgba(0,0,0,.35);background:" + SEVERITY_COLOR[r.severity] + ";" +
    "opacity:" + (r.status === "Resolved" ? 0.6 : 1) + ";" +
    "border:" + (selected ? "4px solid #1B2A8E" : "3px solid #fff") + ";";

  return L.divIcon({
    html: '<div style="' + style + '">' + STATUS_GLYPH[r.status] + "</div>",
    className: "",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

// Same boxed, pulsing hotspot marker used on the admin Hazard Map.
// The corner badge shows the report count (not a "verified" check,
// because a concentration of reports is not verification).
const HOME_PATH = "M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1V9.5z";

function hotspotIcon(count, color) {
  return L.divIcon({
    className: "",
    html:
      '<div style="position:relative;width:44px;height:44px;display:flex;align-items:center;justify-content:center;">' +
      '<span class="hotspot-pulse-ring" style="background:' + color + '73;animation-delay:0s;"></span>' +
      '<span class="hotspot-pulse-ring" style="background:' + color + '73;animation-delay:1s;"></span>' +
      '<div style="position:relative;width:36px;height:36px;border-radius:10px;background:' + color +
      ';display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px ' + color +
      '80;border:2px solid white;">' +
      '<svg width="18" height="18" viewBox="0 0 24 24" fill="white" stroke="white"><path d="' + HOME_PATH + '"/></svg>' +
      '<div style="position:absolute;bottom:-6px;right:-8px;min-width:18px;height:18px;padding:0 4px;border-radius:9999px;background:#0B1830;border:2px solid white;color:white;display:flex;align-items:center;justify-content:center;font:700 10px/1 system-ui,sans-serif;">' +
      count + "</div>" +
      "</div></div>",
    iconSize: [44, 44],
    iconAnchor: [22, 22],
  });
}

function verificationOf(r) {
  if (["Verified", "Forwarded", "In Progress", "Resolved"].includes(r.status)) {
    return r.fieldChecked ? "Field verified" : "Staff verified";
  }
  return r.confirmations > 0 ? "Community confirmed" : "Unverified";
}

function workspaceFor(r) {
  if (r.reopened || r.status === "Resolved") {
    return { to: "/staff/resolved?report=" + r.id, label: "Resolved Reports" };
  }
  if (r.status === "Field Check") {
    return { to: "/staff/field-checks?report=" + r.id, label: "Field Checks" };
  }
  if (["Verified", "Forwarded", "In Progress"].includes(r.status)) {
    return { to: "/staff/in-progress?report=" + r.id, label: "In Progress" };
  }
  return { to: "/staff/review-queue/" + r.id, label: "Review Queue" };
}

// ---------------------------------------------------------------
// SMALL LOCAL COMPONENTS
// ---------------------------------------------------------------
function FilterSelect({ label, value, onChange, options, disabled }) {
  return (
    <label className="block min-w-0">
      <span className="mb-1 block text-xs font-semibold text-slate-500">{label}</span>
      <div className="relative">
        <select
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none rounded-xl border border-[#E3E8F4] bg-white py-2 pl-3 pr-9 text-sm text-[#0F1B4D] focus:border-[#1B2A8E] focus:outline-none focus:ring-2 focus:ring-[#1B2A8E]/15 disabled:bg-[#F7F8FD] disabled:text-slate-500"
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDown
          size={16}
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
        />
      </div>
    </label>
  );
}

function Panel({ title, children }) {
  return (
    <section className="rounded-2xl border border-[#E3E8F4] bg-white p-5">
      <h2 className="mb-3 text-sm font-bold text-[#0F1B4D]">{title}</h2>
      {children}
    </section>
  );
}

function Row({ label, children }) {
  return (
    <div className="flex items-start justify-between gap-4 py-1 text-sm">
      <span className="shrink-0 text-slate-500">{label}</span>
      <span className="text-right font-medium text-[#0F1B4D]">{children}</span>
    </div>
  );
}

function ToolButton({ active, onClick, icon: Icon, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={[
        "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
        active
          ? "border-[#1B2A8E] bg-[#1B2A8E] text-white"
          : "border-[#E3E8F4] bg-white text-slate-600 hover:bg-slate-50",
      ].join(" ")}
    >
      <Icon size={13} strokeWidth={2.2} />
      <span>{children}</span>
    </button>
  );
}

// Same control stack as the admin map: recenter, zoom in, zoom out, fullscreen
const MAP_BTN =
  "flex h-9 w-9 items-center justify-center rounded-lg border border-[#E3E8F4] bg-white text-slate-600 shadow-sm transition-colors hover:bg-slate-50";

function MapControls({ onRecenter, onZoomIn, onZoomOut, onFullscreen }) {
  return (
    <div className="absolute right-4 top-1/2 z-[1000] flex -translate-y-1/2 flex-col gap-2">
      <button type="button" onClick={onRecenter} className={MAP_BTN} title="Recenter">
        <Compass size={16} />
      </button>
      <button type="button" onClick={onZoomIn} className={MAP_BTN} title="Zoom in">
        <Plus size={16} />
      </button>
      <button type="button" onClick={onZoomOut} className={MAP_BTN} title="Zoom out">
        <Minus size={16} />
      </button>
      <button type="button" onClick={onFullscreen} className={MAP_BTN} title="Fullscreen">
        <Maximize size={16} />
      </button>
    </div>
  );
}

// ---------------------------------------------------------------
// PAGE
// ---------------------------------------------------------------
export default function StaffMapMonitorPage() {
  const navigate = useNavigate();
  const now = useNow();

  const wrapEl = useRef(null);
  const mapEl = useRef(null);
  const mapRef = useRef(null);
  const markerLayer = useRef(null);
  const hotspotLayer = useRef(null);

  const [version, setVersion] = useState(0);
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [showHotspots, setShowHotspots] = useState(true);
  const [showLegend, setShowLegend] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatedAt, setUpdatedAt] = useState(() => new Date().toISOString());

  // Re-read the shared mock lists whenever "version" changes
  const allReports = useMemo(() => getStaffMapReports(), [version]);

  const categories = useMemo(
    () => [...new Set(allReports.map((r) => r.category))].sort(),
    [allReports]
  );

  const visible = useMemo(() => {
    const q = search.toLowerCase();
    const nowMs = Date.now();

    return allReports.filter((r) => {
      if (filters.category !== "All" && r.category !== filters.category) return false;
      if (filters.severity !== "All" && r.severity !== filters.severity) return false;
      if (filters.status !== "All" && r.status !== filters.status) return false;
      if (
        filters.submitted !== "any" &&
        (nowMs - new Date(r.submittedAt).getTime()) / 60000 > Number(filters.submitted)
      )
        return false;
      if (q) {
        const haystack = [r.id, r.title, r.location, r.category].join(" ").toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [allReports, filters, search]);

  const hotspots = useMemo(() => findHotspots(visible), [visible]);
  const selected = visible.find((r) => r.id === selectedId) || null;

  const nearby = selected
    ? visible
        .filter((r) => r.id !== selected.id)
        .map((r) => ({ report: r, dist: distanceM(selected, r) }))
        .filter((x) => x.dist <= NEARBY_M)
        .sort((a, b) => a.dist - b.dist)
    : [];

  // ---- map setup (once) ----
  useEffect(() => {
    const map = L.map(mapEl.current, { center: MAP_CENTER, zoom: MAP_ZOOM, zoomControl: false });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map);

    // Approximate coverage only: no boundary data in the project yet
    L.circle(MAP_CENTER, {
      radius: 1100,
      color: "#1B2A8E",
      weight: 1.5,
      dashArray: "6 6",
      fillOpacity: 0.03,
      interactive: false,
    }).addTo(map);

    hotspotLayer.current = L.layerGroup().addTo(map);
    markerLayer.current = L.layerGroup().addTo(map);
    mapRef.current = map;

    // Keep tiles filling the container whenever its size changes
    // (layout shifts, fullscreen, window resize).
    const observer = new ResizeObserver(() => map.invalidateSize());
    observer.observe(mapEl.current);
    setTimeout(() => map.invalidateSize(), 0);

    return () => {
      observer.disconnect();
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // ---- pins ----
  useEffect(() => {
    const group = markerLayer.current;
    if (!group) return;

    group.clearLayers();
    visible.forEach((r) => {
      const marker = L.marker([r.lat, r.lng], {
        icon: pinIcon(r, r.id === selectedId),
        title: r.id + " · " + r.title,
        zIndexOffset: r.id === selectedId ? 1000 : 0,
      });
      marker.on("click", () => setSelectedId(r.id));
      marker.addTo(group);
    });
  }, [visible, selectedId]);

  // ---- hazard hotspots ----
  useEffect(() => {
    const group = hotspotLayer.current;
    if (!group) return;

    group.clearLayers();
    if (!showHotspots) return;

    hotspots.forEach((h) => {
      const color = SEVERITY_COLOR[h.topSeverity];

      // Dashed outline only, like the admin zone overlays
      L.circle([h.center.lat, h.center.lng], {
        radius: h.radius,
        color,
        weight: 2,
        dashArray: "6 6",
        fillOpacity: 0.03,
        interactive: false,
      }).addTo(group);

      const marker = L.marker([h.center.lat, h.center.lng], {
        icon: hotspotIcon(h.count, color),
        title: h.count + " reports near " + h.name,
        zIndexOffset: 500,
      });
      marker.on("click", () => {
        const map = mapRef.current;
        if (map) {
          map.flyTo([h.center.lat, h.center.lng], Math.max(map.getZoom(), 17), { duration: 0.5 });
        }
      });
      marker.addTo(group);
    });
  }, [hotspots, showHotspots]);

  // ---- handlers ----
  const setFilter = (key, value) => setFilters((f) => ({ ...f, [key]: value }));

  const clearAll = () => {
    setFilters(INITIAL_FILTERS);
    setSearch("");
  };

  const flyTo = (point, zoom) => {
    if (mapRef.current) {
      mapRef.current.flyTo([point.lat, point.lng], Math.max(mapRef.current.getZoom(), zoom), {
        duration: 0.5,
      });
    }
  };

  const selectFromList = (r) => {
    setSelectedId(r.id);
    flyTo(r, 17);
  };

  const recenter = () => {
    if (mapRef.current) mapRef.current.setView(MAP_CENTER, MAP_ZOOM);
  };

  const toggleFullscreen = () => {
    const el = wrapEl.current;
    if (!document.fullscreenElement) {
      el?.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  };

  // Fake async to mimic latency until the Laravel API is wired
  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setVersion((v) => v + 1);
      setUpdatedAt(new Date().toISOString());
      setRefreshing(false);
    }, 700);
  };

  // ---- derived summaries ----
  const severityCounts = ["High", "Medium", "Low"].map((level) => ({
    level,
    count: visible.filter((r) => r.severity === level).length,
  }));

  const openCount = visible.filter((r) => r.status !== "Resolved").length;

  const categoryTally = {};
  visible.forEach((r) => {
    categoryTally[r.category] = (categoryTally[r.category] || 0) + 1;
  });
  const topCategory = Object.entries(categoryTally).sort((a, b) => b[1] - a[1])[0];

  const areaTally = {};
  visible.forEach((r) => {
    areaTally[r.location] = (areaTally[r.location] || 0) + 1;
  });
  const areaRows = Object.entries(areaTally).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const areaMax = areaRows.length ? areaRows[0][1] : 1;

  const workspace = selected ? workspaceFor(selected) : null;

  return (
    <div className="flex min-h-screen bg-[#F2F4FB]">
      {/* Radar-style pulsing ring for the hotspot marker (same as admin) */}
      <style>{`
        .hotspot-pulse-ring {
          position: absolute;
          width: 36px;
          height: 36px;
          border-radius: 10px;
          animation: hotspotPulse 2s ease-out infinite;
        }
        @keyframes hotspotPulse {
          0% { transform: scale(1); opacity: 0.7; }
          100% { transform: scale(2.4); opacity: 0; }
        }
      `}</style>

      <StaffSidebar onLogout={() => navigate("/signin")} />

      <div className="min-w-0 flex-1">
        <StaffHeader onSearch={(value) => setSearch(value)} />

        <main className="space-y-6 p-8">
          {/* TITLE */}
          <section className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-[#0F1B4D]">Map Monitor</h1>
              <p className="mt-1.5 max-w-2xl text-sm text-slate-500">
                See where hazards are reported in your barangay. Select a pin to preview a
                report and open it in the right workspace.
              </p>
            </div>

            <div className="flex flex-col items-end gap-1">
              <button
                type="button"
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center gap-2 rounded-xl border border-[#E3E8F4] bg-white px-4 py-2.5 text-sm font-semibold text-[#1B2A8E] transition-colors hover:bg-slate-50 disabled:opacity-60"
              >
                <RefreshCw
                  size={15}
                  strokeWidth={2.2}
                  className={refreshing ? "animate-spin" : ""}
                />
                <span>Refresh map data</span>
              </button>
              <p className="text-xs text-slate-400">
                {"Updated " + timeAgo(updatedAt, now).toLowerCase()}
              </p>
            </div>
          </section>

          {/* FILTERS */}
          <section className="rounded-2xl border border-[#E3E8F4] bg-white p-4">
            <div className="grid grid-cols-2 items-end gap-4 md:grid-cols-6">
              <FilterSelect
                label="Barangay"
                value="Barangay 171 (Bagumbong)"
                onChange={() => {}}
                disabled
                options={[{ value: "Barangay 171 (Bagumbong)", label: "Brgy 171 (Bagumbong)" }]}
              />
              <FilterSelect
                label="Category"
                value={filters.category}
                onChange={(v) => setFilter("category", v)}
                options={withAll(categories, "All Categories")}
              />
              <FilterSelect
                label="Severity"
                value={filters.severity}
                onChange={(v) => setFilter("severity", v)}
                options={withAll(["High", "Medium", "Low"], "All Severities")}
              />
              <FilterSelect
                label="Status"
                value={filters.status}
                onChange={(v) => setFilter("status", v)}
                options={withAll(MAP_STATUSES, "All Statuses")}
              />
              <FilterSelect
                label="Submitted"
                value={filters.submitted}
                onChange={(v) => setFilter("submitted", v)}
                options={SUBMITTED_OPTIONS}
              />
              <button
                type="button"
                onClick={clearAll}
                className="rounded-xl border border-[#E3E8F4] bg-white px-3 py-2 text-sm font-semibold text-[#1B2A8E] transition-colors hover:bg-slate-50"
              >
                Clear filters
              </button>
            </div>
          </section>

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
            {/* LEFT: MAP
                self-start + sticky: the card is exactly as tall as the map
                (no empty white area under it) and stays in view while the
                right-hand panels scroll. */}
            <section className="min-w-0 self-start overflow-hidden rounded-2xl border border-[#E3E8F4] bg-white xl:sticky xl:top-24">
              <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
                <p className="text-sm font-semibold text-[#0F1B4D]">
                  {"Showing " + visible.length + " of " + allReports.length + " reports"}
                </p>
                <div className="flex flex-wrap gap-2">
                  <ToolButton active={showHotspots} onClick={() => setShowHotspots((v) => !v)} icon={Flame}>
                    Hotspots
                  </ToolButton>
                  <ToolButton active={showLegend} onClick={() => setShowLegend((v) => !v)} icon={Info}>
                    Legend
                  </ToolButton>
                </div>
              </div>

              {/* "isolate" keeps Leaflet's z-indexes below the sticky header */}
              <div
                ref={wrapEl}
                className="relative isolate h-[620px] border-t border-[#E3E8F4] bg-white [&:fullscreen]:h-screen"
              >
                <div ref={mapEl} className="absolute inset-0" />

                <MapControls
                  onRecenter={recenter}
                  onZoomIn={() => mapRef.current?.zoomIn()}
                  onZoomOut={() => mapRef.current?.zoomOut()}
                  onFullscreen={toggleFullscreen}
                />

                {showLegend && (
                  <div className="absolute bottom-3 left-3 z-[900] w-44 rounded-lg border border-[#E3E8F4] bg-white/95 p-2.5 text-[11px] shadow">
                    <p className="mb-1.5 font-semibold text-slate-600">Legend</p>

                    <ul className="space-y-1 text-slate-600">
                      {["High", "Medium", "Low"].map((level) => (
                        <li key={level} className="flex items-center gap-2">
                          <span className={["h-2.5 w-2.5 rounded-full", SEVERITY_DOT[level]].join(" ")} />
                          {level + " severity"}
                        </li>
                      ))}
                      <li className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-[3px] bg-red-500 ring-1 ring-white" />
                        Hazard hotspot
                      </li>
                    </ul>

                    <details className="mt-1.5 border-t border-[#E3E8F4] pt-1.5 text-slate-500">
                      <summary className="cursor-pointer select-none font-medium text-[#1B2A8E]">
                        Status symbols
                      </summary>
                      <ul className="mt-1.5 grid grid-cols-2 gap-x-1 gap-y-1">
                        {MAP_STATUSES.map((s) => (
                          <li key={s} className="flex items-center gap-1">
                            <span className="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full bg-slate-500 text-[9px] font-bold text-white">
                              {STATUS_GLYPH[s]}
                            </span>
                            <span className="truncate">{s}</span>
                          </li>
                        ))}
                      </ul>
                    </details>

                    <p className="mt-1.5 text-slate-400">Faded pin = resolved</p>
                  </div>
                )}
              </div>
            </section>

            {/* RIGHT: PANELS */}
            <div className="min-w-0 space-y-6">
              <Panel title="Report Count">
                <p className="text-3xl font-bold text-[#0F1B4D]">{visible.length}</p>
                <p className="text-xs text-slate-500">
                  {"reports on the map · " + openCount + " still open"}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {severityCounts.map(({ level, count }) => (
                    <span
                      key={level}
                      className="flex items-center gap-1.5 rounded-full border border-[#E3E8F4] px-2.5 py-1 text-xs font-medium text-slate-600"
                    >
                      <span className={["h-2.5 w-2.5 rounded-full", SEVERITY_DOT[level]].join(" ")} />
                      {level + " " + count}
                    </span>
                  ))}
                </div>
              </Panel>

              <Panel title="Hazard Details Preview">
                {!selected && (
                  <p className="text-sm text-slate-500">
                    Select a pin on the map to preview its report.
                  </p>
                )}

                {selected && (
                  <div>
                    <p className="text-xs font-semibold text-[#1B2A8E]">{selected.id}</p>
                    <p className="text-base font-bold text-[#0F1B4D]">{selected.title}</p>

                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <span
                        className={[
                          "rounded-md px-2.5 py-0.5 text-xs font-semibold",
                          SEVERITY_STYLE[selected.severity],
                        ].join(" ")}
                      >
                        {selected.severity}
                      </span>
                      <span
                        className={[
                          "rounded-full border px-2.5 py-0.5 text-xs font-medium",
                          STATUS_STYLE[selected.status],
                        ].join(" ")}
                      >
                        {selected.status}
                      </span>
                      {selected.reopened && (
                        <span className="rounded-full border border-orange-200 bg-orange-50 px-2.5 py-0.5 text-xs font-medium text-orange-700">
                          Reopened
                        </span>
                      )}
                    </div>

                    <div className="mt-3 border-t border-[#E3E8F4] pt-2">
                      <Row label="Category">{selected.category}</Row>
                      <Row label="Barangay">{selected.barangay}</Row>
                      <Row label="Location">{selected.location}</Row>
                      <Row label="Submitted">{fmtDateTime(selected.submittedAt)}</Row>
                      <Row label="Verification">{verificationOf(selected)}</Row>
                    </div>

                    <Link
                      to={workspace.to}
                      className="mt-3 flex items-center justify-center gap-2 rounded-xl bg-[#1B2A8E] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#16237A]"
                    >
                      {"Open in " + workspace.label}
                      <ArrowRight size={15} strokeWidth={2.2} />
                    </Link>

                    {/* NEARBY / POSSIBLE DUPLICATES */}
                    <div className="mt-4 border-t border-[#E3E8F4] pt-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-400">
                        {"Nearby reports (within " + NEARBY_M + " m)"}
                      </p>

                      {nearby.length === 0 && (
                        <p className="mt-2 text-xs text-slate-500">
                          No other reports nearby in the current view.
                        </p>
                      )}

                      <ul className="mt-2 max-h-52 space-y-1.5 overflow-y-auto">
                        {nearby.map(({ report: n, dist }) => {
                          const duplicate = n.category === selected.category;
                          return (
                            <li key={n.id}>
                              <button
                                type="button"
                                onClick={() => selectFromList(n)}
                                className="flex w-full items-center gap-2 rounded-lg border border-[#E3E8F4] px-3 py-2 text-left hover:bg-slate-50"
                              >
                                <span
                                  className={["h-2.5 w-2.5 shrink-0 rounded-full", SEVERITY_DOT[n.severity]].join(" ")}
                                />
                                <span className="min-w-0 flex-1">
                                  <span className="block truncate text-xs font-semibold text-[#0F1B4D]">
                                    {n.id + " · " + n.title}
                                  </span>
                                  <span className="block text-[11px] text-slate-500">
                                    {Math.round(dist / 5) * 5 + " m away · " + n.status}
                                  </span>
                                </span>
                                <span
                                  className={[
                                    "shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-medium",
                                    duplicate
                                      ? "border-pink-200 bg-pink-50 text-pink-700"
                                      : "border-slate-200 bg-slate-50 text-slate-600",
                                  ].join(" ")}
                                >
                                  {duplicate ? "Possible duplicate" : "Nearby"}
                                </span>
                              </button>
                            </li>
                          );
                        })}
                      </ul>

                      <p className="mt-2 text-[11px] leading-4 text-slate-400">
                        Nearby reports may be duplicates or may corroborate each other. Nothing
                        is merged or rejected automatically.
                      </p>
                    </div>
                  </div>
                )}
              </Panel>

              <Panel title="Hazard Hotspots">
                {hotspots.length === 0 && (
                  <p className="text-sm text-slate-500">
                    No hotspots (3 or more reports close together) in the current view.
                  </p>
                )}

                <ul className="space-y-2">
                  {hotspots.map((h) => (
                    <li key={h.key}>
                      <button
                        type="button"
                        onClick={() => flyTo(h.center, 17)}
                        className="flex w-full items-center gap-3 rounded-lg border border-[#E3E8F4] px-3 py-2 text-left hover:bg-slate-50"
                      >
                        <span
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] text-sm font-bold text-white"
                          style={{ backgroundColor: SEVERITY_COLOR[h.topSeverity] }}
                        >
                          {h.count}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-semibold text-[#0F1B4D]">
                            {"Near " + h.name}
                          </span>
                          <span className="block text-xs text-slate-500">
                            {"Highest severity: " + h.topSeverity}
                          </span>
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>

                <p className="mt-3 text-[11px] leading-4 text-slate-400">
                  A hotspot does not mean the hazards are verified. Each report still needs
                  review.
                </p>
              </Panel>

              <Panel title="Barangay Overview">
                <p className="text-sm font-semibold text-[#0F1B4D]">Barangay 171 (Bagumbong)</p>
                <div className="mt-2">
                  <Row label="Reports in view">{visible.length}</Row>
                  <Row label="High severity">{severityCounts[0].count}</Row>
                  <Row label="Most reported category">
                    {topCategory ? topCategory[0] + " (" + topCategory[1] + ")" : "None"}
                  </Row>
                </div>

                <p className="mb-2 mt-3 text-xs font-semibold uppercase tracking-[0.1em] text-slate-400">
                  Reports by area
                </p>
                <ul className="space-y-2">
                  {areaRows.map(([name, count]) => (
                    <li key={name}>
                      <div className="flex items-center justify-between text-xs text-slate-600">
                        <span className="truncate">{name}</span>
                        <span className="font-semibold text-[#0F1B4D]">{count}</span>
                      </div>
                      <div className="mt-1 h-1.5 rounded-full bg-[#E8EBFA]">
                        <div
                          className="h-1.5 rounded-full bg-[#1B2A8E]"
                          style={{ width: Math.round((count / areaMax) * 100) + "%" }}
                        />
                      </div>
                    </li>
                  ))}
                </ul>

                <p className="mt-3 text-[11px] leading-4 text-slate-400">
                  Official barangay boundary data is not loaded yet. The dashed circle on the
                  map is an approximate area.
                </p>
              </Panel>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}