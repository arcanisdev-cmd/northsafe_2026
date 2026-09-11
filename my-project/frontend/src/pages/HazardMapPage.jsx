import { useMemo, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  ZoomControl,
  AttributionControl,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";

import AuthNavbar from "../layouts/AuthNavbar";
import Footer from "../layouts/Footer";
import MapSidebar from "../components/MapSidebar";
import AlertLevelLegend from "../components/AlertLevelLegend";
import LayersToggle from "../components/LayersToggle";
import HazardPinPopup from "../components/HazardPinPopup";
import { hazardPinIcons } from "../components/HazardMapPin";
import { hazardReports } from "../components/data/MockDashboardData";
import {
  filterHazardReports,
  getDefaultMapFilters,
} from "../utils/hazardFilters";

// Rough center over North Caloocan
const MAP_CENTER = [14.7569, 120.9967];
const MAP_ZOOM = 14;

function HazardMapPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [filters, setFilters] = useState(getDefaultMapFilters());

  const filteredReports = useMemo(
    () => filterHazardReports(hazardReports, filters),
    [filters]
  );

  return (
    <div className="min-h-screen overflow-x-hidden">
      <AuthNavbar />

      <div className="w-full max-w-[1532px] mx-auto">
        {/* MAP CONTAINER */}
        <div
          className="
            relative
            z-0
            w-full
            mx-auto
            h-[calc(100vh-80px)]
            min-h-[550px]
            max-h-[720px]
          "
        >
          <MapContainer
            center={MAP_CENTER}
            zoom={MAP_ZOOM}
            zoomControl={false}
            attributionControl={false}
            className="relative z-0 w-full h-full"
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="&copy; OpenStreetMap contributors"
            />

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

          {/* SIDEBAR */}
          <div className="absolute inset-y-0 left-0 z-[800] max-w-full">
            <MapSidebar
              collapsed={sidebarCollapsed}
              onToggleCollapsed={() =>
                setSidebarCollapsed((prev) => !prev)
              }
              filters={filters}
              onChangeFilters={setFilters}
            />
          </div>

          {/* MAP LEGEND + LAYERS */}
          <div className="absolute inset-0 pointer-events-none z-[800]">
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