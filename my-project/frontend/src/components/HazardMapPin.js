import L from "leaflet";
function buildPinIcon(hexColor) {
  const svg = `
    <svg width="28" height="38" viewBox="0 0 28 38" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M14 0C6.268 0 0 6.268 0 14c0 10.5 14 24 14 24s14-13.5 14-24C28 6.268 21.732 0 14 0z"
        fill="${hexColor}"
        stroke="#FFFFFF"
        stroke-width="2"
      />
      <circle cx="14" cy="14" r="5" fill="#FFFFFF" />
    </svg>
  `.trim();

  return L.divIcon({
    className: "",
    html: svg,
    iconSize: [28, 38],
    iconAnchor: [14, 38],
    popupAnchor: [0, -36],
  });
}

export const hazardPinIcons = {
  red: buildPinIcon("#BA1A1A"),
  blue: buildPinIcon("#1E1391"),
  white: buildPinIcon("#A9A9A9"),
};