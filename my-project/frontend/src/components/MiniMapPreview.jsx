
import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const DEFAULT_CENTER = [14.76, 121.04];
const DEFAULT_ZOOM = 13;

const pinIcon = L.divIcon({
  className: "northsafe-map-pin",
  html: `
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="#FF3B30"
      stroke="#FF3B30"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
      <circle cx="12" cy="10" r="3" fill="#FFFFFF" stroke="none"/>
    </svg>
  `,
  iconSize: [28, 28],
  iconAnchor: [14, 28],
});

function MiniMapPreview({ value, onLocationSelect }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const selectRef = useRef(onLocationSelect);

  useEffect(() => {
    selectRef.current = onLocationSelect;
  }, [onLocationSelect]);

  // Initialize the map once and keep it responsive to container resizing.
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;

    const map = L.map(container, {
      center: DEFAULT_CENTER,
      zoom: DEFAULT_ZOOM,
      scrollWheelZoom: false,
    });

    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map);

    const handleMapClick = (event) => {
      selectRef.current?.({
        lat: event.latlng.lat,
        lng: event.latlng.lng,
        source: "map",
      });
    };

    map.on("click", handleMapClick);
    mapRef.current = map;

    // Recalculate tile layout when the responsive container changes size.
    const resizeObserver =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(() => {
            map.invalidateSize({ pan: false });
          })
        : null;

    resizeObserver?.observe(container);

    const frame = requestAnimationFrame(() => {
      map.invalidateSize({ pan: false });
    });

    return () => {
      cancelAnimationFrame(frame);
      resizeObserver?.disconnect();
      map.off("click", handleMapClick);
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, []);

  // Synchronize the marker with the selected location.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const lat = value?.lat;
    const lng = value?.lng;

    if (typeof lat !== "number" || typeof lng !== "number") {
      if (markerRef.current) {
        markerRef.current.remove();
        markerRef.current = null;
      }
      return;
    }

    if (!markerRef.current) {
      markerRef.current = L.marker([lat, lng], {
        icon: pinIcon,
        interactive: false,
      }).addTo(map);
    } else {
      markerRef.current.setLatLng([lat, lng]);
    }

    if (value.source === "gps") {
      map.setView([lat, lng], Math.max(map.getZoom(), 16));
    }
  }, [value]);

  return (
    <div
      ref={containerRef}
      className="
        isolate h-[200px] w-full min-w-0
        overflow-hidden rounded-[10px]
        border border-slate-200
        bg-slate-100
      "
      aria-label="Hazard location map. Click the map to place the hazard pin."
    />
  );
}

export default MiniMapPreview;
