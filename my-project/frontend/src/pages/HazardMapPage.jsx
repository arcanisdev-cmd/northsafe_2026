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

// Rough center over North Caloocan (Camarin/Deparo/Llano area)
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
    <div className="min-h-screen">
      {/* Navbar handles its own height and spacer */}
      <AuthNavbar />

      <div className="max-w-[1532px] mx-auto">
        {/* MAP CONTAINER */}
        <div
          className="relative z-0 mx-auto"
          style={{
            width: "1531px",
            height: "720px",
          }}
        >
          <MapContainer
            center={MAP_CENTER}
            zoom={MAP_ZOOM}
            zoomControl={false}
            attributionControl={false}
            className="relative z-0"
            style={{
              width: "100%",
              height: "100%",
            }}
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

          {/* SIDEBAR OVER THE MAP */}
          <div
            className="absolute z-[800]"
            style={{
              left: "0px",
              top: "0px",
            }}
          >
            <MapSidebar
              collapsed={sidebarCollapsed}
              onToggleCollapsed={() =>
                setSidebarCollapsed((prev) => !prev)
              }
              filters={filters}
              onChangeFilters={setFilters}
            />
          </div>

          {/* MAP CONTROLS / LEGEND */}
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