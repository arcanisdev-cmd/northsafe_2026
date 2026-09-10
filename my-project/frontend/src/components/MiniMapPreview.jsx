import { useEffect, useMemo } from "react";
import L from "leaflet";
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const DEFAULT_CENTER = [14.7569, 120.9967];
const DEFAULT_ZOOM = 14;

function buildPinIcon() {
  return L.divIcon({
    className: "",
    html: `
      <div style="width:28px;height:28px;border-radius:9999px;background:#0BA6DF;border:3px solid #ffffff;box-shadow:0 8px 18px rgba(8,20,53,0.28);"></div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
}

function MapClickHandler({ onLocationSelect }) {
  useMapEvents({
    click(event) {
      onLocationSelect?.({
        latitude: event.latlng.lat,
        longitude: event.latlng.lng,
        label: "Selected on map",
        source: "map",
      });
    },
  });

  return null;
}

function RecenterMap({ location }) {
  const map = useMap();

  useEffect(() => {
    if (!location) {
      return;
    }

    map.setView([location.latitude, location.longitude], 16, { animate: true });
  }, [location, map]);

  return null;
}

function MiniMapPreview({ location, onLocationSelect }) {
  const pinIcon = useMemo(() => buildPinIcon(), []);

  return (
    <div
      className="relative overflow-hidden rounded-[10px] border border-[#BFD6E8] bg-slate-100"
      style={{ width: "404px", height: "133px" }}
    >
      <MapContainer
        center={DEFAULT_CENTER}
        zoom={DEFAULT_ZOOM}
        zoomControl={false}
        attributionControl={false}
        scrollWheelZoom={false}
        doubleClickZoom={false}
        className="h-full w-full"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />
        <RecenterMap location={location} />
        <MapClickHandler onLocationSelect={onLocationSelect} />

        {location && (
          <Marker
            position={[location.latitude, location.longitude]}
            icon={pinIcon}
          />
        )}
      </MapContainer>

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/0 via-white/0 to-slate-950/10" />

      {!location && (
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-1 text-center">
          <span className="rounded-full bg-white/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#081435] shadow-sm">
            Map Preview
          </span>
          <p className="text-sm font-medium text-slate-600">Click anywhere to place the hazard pin</p>
        </div>
      )}

      {location && (
        <div className="pointer-events-none absolute left-3 top-3 rounded-full bg-white/92 px-3 py-1.5 text-[11px] font-semibold text-[#081435] shadow-sm backdrop-blur">
          {location.source === "current-location" ? "Using current location" : "Location selected"}
        </div>
      )}

      {location && (
        <div className="pointer-events-none absolute right-3 bottom-3 max-w-[280px] truncate rounded-full bg-[#081435]/90 px-3 py-1.5 text-[11px] font-semibold text-white shadow-sm backdrop-blur">
          {location.label || "Selected location"}
        </div>
      )}
    </div>
  );
}

export default MiniMapPreview;