const cache = new Map();

function formatAddress(data) {
  const a = (data && data.address) || {};
  const street = [a.house_number, a.road].filter(Boolean).join(" ");
  const area = a.neighbourhood || a.quarter || a.suburb || a.village || "";
  const parts = [street, area].filter(Boolean);
  if (parts.length === 0 && data && data.display_name) {
    return data.display_name
      .split(",")
      .slice(0, 3)
      .map((s) => s.trim())
      .join(", ");
  }
  return parts.join(", ");
}

export async function reverseGeocode({ lat, lng, signal }) {
  const key = lat.toFixed(5) + "," + lng.toFixed(5);
  if (cache.has(key)) return cache.get(key);
  try {
    const url =
      "https://nominatim.openstreetmap.org/reverse?format=jsonv2&addressdetails=1&zoom=18&accept-language=en&lat=" +
      lat +
      "&lon=" +
      lng;
    const res = await fetch(url, { signal });
    if (!res.ok) return "";
    const text = formatAddress(await res.json());
    if (text) cache.set(key, text);
    return text;
  } catch {
    return "";
  }
}