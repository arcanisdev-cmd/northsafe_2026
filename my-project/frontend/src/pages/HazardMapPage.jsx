import { useMemo, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, ZoomControl, AttributionControl } from "react-leaflet";
import "leaflet/dist/leaflet.css";

import AuthNavbar from "../layouts/AuthNavbar";
import Footer from "../layouts/Footer";
import MapSidebar from "../components/MapSidebar";
import AlertLevelLegend from "../components/AlertLevelLegend";
import LayersToggle from "../components/LayersToggle";
import HazardPinPopup from "../components/HazardPinPopup";
import { hazardPinIcons } from "../components/HazardMapPin";
import { hazardReports } from "../components/data/MockDashboardData";
import { filterHazardReports, getDefaultMapFilters } from "../utils/hazardFilters";

// Rough center over North Caloocan (Camarin/Deparo/Llano area) so the map
// opens centered on the barangays we actually have mock reports for.
const MAP_CENTER = [14.7569, 120.9967];
const MAP_ZOOM = 14;

function HazardMapPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [filters, setFilters] = useState(getDefaultMapFilters());

  const filteredReports = useMemo(() => filterHazardReports(hazardReports, filters), [filters]);

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

            {filteredReports.map((report) => (
              <Marker
                key={report.id}
                position={[report.lat, report.lng]}
                icon={hazardPinIcons[report.alertLevel]}
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
        </div>

        <Footer />
      </div>
    </div>
  );
}

export default HazardMapPage;