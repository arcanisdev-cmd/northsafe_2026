import { useEffect, useMemo, useRef, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  ZoomControl,
  AttributionControl,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useLocation, useNavigate } from "react-router-dom";

import AuthNavbar from "../layouts/AuthNavbar";
import Footer from "../layouts/Footer";
import MapSidebar from "../components/MapSidebar";
import AlertLevelLegend from "../components/AlertLevelLegend";
import LayersToggle from "../components/LayersToggle";
import HazardPinPopup from "../components/HazardPinPopup";
import { hazardPinIcons } from "../components/HazardMapPin";
import { filterHazardReports, getDefaultMapFilters } from "../utils/hazardFilters";

// Rough center over North Caloocan (Camarin/Deparo/Llano area) so the map
// opens centered on the barangays we actually have mock reports for.
const MAP_CENTER = [14.7569, 120.9967];
const MAP_ZOOM = 14;
const DUPLICATE_PIN_OFFSET_METERS = 24;

function clearStoredAuth() {
  localStorage.removeItem("northsafe_token");
  localStorage.removeItem("northsafe_user");
  sessionStorage.removeItem("northsafe_token");
  sessionStorage.removeItem("northsafe_user");
}

function formatDateTime(date) {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const year = date.getFullYear();
  const hours24 = date.getHours();
  const hours12 = hours24 % 12 || 12;
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const suffix = hours24 >= 12 ? "PM" : "AM";

  return `${month}/${day}/${year} ${String(hours12).padStart(2, "0")}:${minutes}${suffix}`;
}

function formatTimeAgo(dateValue) {
  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "just now";
  }

  const minutes = Math.max(1, Math.round((Date.now() - date.getTime()) / 60000));
  if (minutes < 60) {
    return `${minutes} min${minutes === 1 ? "" : "s"} ago`;
  }

  const hours = Math.round(minutes / 60);
  if (hours < 24) {
    return `${hours} hr${hours === 1 ? "" : "s"} ago`;
  }

  const days = Math.round(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

function deriveAlertLevel(statusValue) {
  const status = String(statusValue ?? "pending").toLowerCase();

  if (status === "rejected") {
    return "white";
  }

  if (status === "resolved") {
    return "red";
  }

  return "blue";
}

function normalizeReport(report) {
  const createdAt = report.createdAt ?? report.created_at ?? new Date().toISOString();
  const createdDate = new Date(createdAt);
  const lat = Number(report.lat ?? report.latitude);
  const lng = Number(report.lng ?? report.longitude);

  return {
    ...report,
    id: report.id,
    reporterName: report.reporterName ?? "NorthSafe User",
    timeAgo: report.timeAgo ?? formatTimeAgo(createdDate),
    alertLevel: report.alertLevel ?? deriveAlertLevel(report.status),
    title: report.title ?? "Untitled Report",
    description: report.description ?? "",
    address: report.address ?? report.locationName ?? report.location_name ?? "",
    dateTime: report.dateTime ?? formatDateTime(createdDate),
    hazardType: report.hazardType ?? report.hazard_type ?? "",
    barangay: report.barangay ?? null,
    lat,
    lng,
    status: report.status ?? "Pending",
    verified: Array.isArray(report.statusHistory)
      ? report.statusHistory.some((entry) => entry.status === "Verified")
      : false,
    upvotes: report.upvotes ?? 0,
    downvotes: report.downvotes ?? 0,
    comments: report.comments ?? 0,
    imageSrc: report.imageSrc ?? report.imageUrl ?? null,
    createdAt: report.createdAt ?? createdDate.toISOString(),
  };
}

function FocusMapOnReport({ target }) {
  const map = useMap();

  useEffect(() => {
    if (!target) {
      return;
    }

    map.setView([target.lat, target.lng], Math.max(map.getZoom(), 16), { animate: true });
  }, [map, target]);

  return null;
}

function offsetCoordinates(lat, lng, index, total, radiusMeters = DUPLICATE_PIN_OFFSET_METERS) {
  if (total <= 1) {
    return { lat, lng };
  }

  const angle = (2 * Math.PI * index) / total;
  const metersPerDegreeLat = 111320;
  const metersPerDegreeLng = Math.max(1, metersPerDegreeLat * Math.cos((lat * Math.PI) / 180));

  const latOffset = (Math.sin(angle) * radiusMeters) / metersPerDegreeLat;
  const lngOffset = (Math.cos(angle) * radiusMeters) / metersPerDegreeLng;

  return {
    lat: lat + latOffset,
    lng: lng + lngOffset,
  };
}

function HazardMapPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const apiBaseUrl = import.meta.env.VITE_API_URL ?? "";
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [filters, setFilters] = useState(getDefaultMapFilters());
  const markerRefs = useRef(new Map());

  const focusReportId = location.state?.focusReportId ?? null;

  useEffect(() => {
    const token = localStorage.getItem("northsafe_token") ?? sessionStorage.getItem("northsafe_token");

    if (!token) {
      navigate("/signin");
      return;
    }

    const controller = new AbortController();

    async function loadMapReports() {
      setIsLoading(true);
      setLoadError("");

      try {
        const response = await fetch(`${apiBaseUrl}/api/reports`, {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
          signal: controller.signal,
        });

        const data = await response.json();

        if (response.status === 401) {
          clearStoredAuth();
          navigate("/signin");
          return;
        }

        if (!response.ok) {
          setLoadError(data?.message ?? "Unable to load hazard reports.");
          return;
        }

        const normalizedReports = (data?.reports ?? [])
          .map(normalizeReport)
          .filter((report) => Number.isFinite(report.lat) && Number.isFinite(report.lng));

        setReports(normalizedReports);
      } catch (error) {
        if (error.name !== "AbortError") {
          setLoadError("Unable to load hazard reports.");
          setReports([]);
        }
      } finally {
        setIsLoading(false);
      }
    }

    loadMapReports();

    return () => controller.abort();
  }, [apiBaseUrl, navigate]);

  const filteredReports = useMemo(() => filterHazardReports(reports, filters), [reports, filters]);

  const mapReports = useMemo(() => {
    const grouped = new Map();

    filteredReports.forEach((report) => {
      const key = `${Number(report.lat).toFixed(6)}|${Number(report.lng).toFixed(6)}`;
      const bucket = grouped.get(key) ?? [];
      bucket.push(report);
      grouped.set(key, bucket);
    });

    const spreadReports = [];

    grouped.forEach((bucket) => {
      const total = bucket.length;

      bucket.forEach((report, index) => {
        const displaced = offsetCoordinates(report.lat, report.lng, index, total);

        spreadReports.push({
          ...report,
          mapLat: displaced.lat,
          mapLng: displaced.lng,
          overlapCount: total,
        });
      });
    });

    return spreadReports;
  }, [filteredReports]);

  const focusedReport = useMemo(() => {
    if (focusReportId === null || focusReportId === undefined) {
      return null;
    }

    return mapReports.find((report) => String(report.id) === String(focusReportId)) ?? null;
  }, [mapReports, focusReportId]);

  useEffect(() => {
    if (!focusedReport) {
      return;
    }

    const marker = markerRefs.current.get(String(focusedReport.id));

    if (marker) {
      marker.openPopup();
    }
  }, [focusedReport]);

  return (
    <div>
      <div className="max-w-[1532px] mx-auto">
        <AuthNavbar />

        {/* No manual spacer needed here anymore — AuthNavbar is now sticky,
            so it reserves its own 82px in the document flow automatically. */}

        {/* Map container — figma: x 1, y 55, w 1531, h 720 */}
        <div className="relative mx-auto" style={{ width: "1531px", height: "720px" }}>
          <MapContainer
            center={MAP_CENTER}
            zoom={MAP_ZOOM}
            zoomControl={false}
            attributionControl={false}
            style={{ width: "100%", height: "100%" }}
          >
            {/* OpenStreetMap tiles for this page. Google Maps is reserved
                for the separate hazard-detail view, per our earlier call. */}
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="&copy; OpenStreetMap contributors"
            />
            {/* Moved off the default bottom-right so it doesn't collide
                with the Alert Level legend / layers toggle stacked there. */}
            <AttributionControl position="bottomleft" />
            <ZoomControl position="topright" />

            <FocusMapOnReport
              target={
                focusedReport
                  ? { lat: focusedReport.mapLat, lng: focusedReport.mapLng }
                  : null
              }
            />

            {mapReports.map((report) => (
              <Marker
                key={report.id}
                position={[report.mapLat, report.mapLng]}
                icon={hazardPinIcons[report.alertLevel]}
                ref={(marker) => {
                  if (marker) {
                    markerRefs.current.set(String(report.id), marker);
                    return;
                  }

                  markerRefs.current.delete(String(report.id));
                }}
              >
                <Popup>
                  <HazardPinPopup report={report} />
                </Popup>
              </Marker>
            ))}
          </MapContainer>

          {/* Sidebar — floats top-left over the map, figma: x 0, y 0, w 250, h 696 */}
          <div className="absolute z-[500]" style={{ left: "0px", top: "0px" }}>
            <MapSidebar
              collapsed={sidebarCollapsed}
              onToggleCollapsed={() => setSidebarCollapsed((prev) => !prev)}
              filters={filters}
              onChangeFilters={setFilters}
              reports={reports}
            />
          </div>

          {/* Leaflet's own panes (tiles/markers/popups) carry explicit
              z-index values up to ~700. z-[1000] here guarantees these
              always render on top, matching Leaflet's own control z-index. */}
          <div className="absolute inset-0 pointer-events-none z-[1000]">
            <div className="pointer-events-auto">
              <AlertLevelLegend />
              <LayersToggle />
            </div>
          </div>

          {(isLoading || loadError) && (
            <div className="absolute inset-0 z-[1200] pointer-events-none flex items-start justify-center pt-6">
              <div className="pointer-events-auto bg-white/95 rounded-lg px-4 py-2 text-sm shadow">
                {isLoading ? "Loading hazard reports..." : loadError}
              </div>
            </div>
          )}
        </div>

        <Footer />
      </div>
    </div>
  );
}

export default HazardMapPage;