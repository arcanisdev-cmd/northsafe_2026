export function normalizePoint(loc) {
  if (!loc) return null;
  const lat = Number(loc.lat ?? loc.latitude);
  const lng = Number(loc.lng ?? loc.lon ?? loc.longitude);
  return Number.isFinite(lat) && Number.isFinite(lng) ? { lat, lng } : null;
}

export function distanceMeters(a, b) {
  const R = 6371000;
  const rad = (d) => (d * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

function inRing(point, ring) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    const crosses = yi > point.lat !== yj > point.lat;
    if (crosses && point.lng < ((xj - xi) * (point.lat - yi)) / (yj - yi) + xi) {
      inside = !inside;
    }
  }
  return inside;
}

function inPolygon(point, rings) {
  if (!inRing(point, rings[0])) return false;
  for (let i = 1; i < rings.length; i++) {
    if (inRing(point, rings[i])) return false;
  }
  return true;
}

// Returns the barangay name, null (outside every barangay), or undefined (no boundary data loaded).
export function findBarangayAtPoint(point, featureCollection) {
  const features = featureCollection?.features;
  if (!point || !features || features.length === 0) return undefined;
  for (const f of features) {
    const g = f.geometry;
    if (!g) continue;
    const polygons =
      g.type === "Polygon" ? [g.coordinates] : g.type === "MultiPolygon" ? g.coordinates : [];
    if (polygons.some((p) => inPolygon(point, p))) return f.properties?.name ?? "Unknown";
  }
  return null;
}

// One-time GPS read (never tracks). Resolves { reading, error }.
export function readGpsOnce({ timeout = 8000 } = {}) {
  return new Promise((resolve) => {
    if (typeof navigator === "undefined" || !("geolocation" in navigator)) {
      resolve({ reading: null, error: "unsupported" });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        resolve({
          reading: {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy: Math.round(pos.coords.accuracy),
          },
          error: null,
        }),
      (err) => resolve({ reading: null, error: err.code === 1 ? "denied" : "unavailable" }),
      { enableHighAccuracy: true, timeout, maximumAge: 0 }
    );
  });
}