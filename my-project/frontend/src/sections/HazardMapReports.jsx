import { useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  ZoomControl,
  AttributionControl,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";

import { hazardReports } from "../components/data/MockDashboardData";
import { hazardPinIcons } from "../components/HazardMapPin";

const SEVERITY_ITEMS = [
  { label: "Red Alert", color: "#BA1A1A" },
  { label: "Blue Alert", color: "#1E1391" },
  { label: "White Alert", color: "#A9A9A9" },
];

const MAP_CENTER = [14.7569, 120.9967];
const MAP_ZOOM = 14;

function getCurrentStatus(statusHistory) {
  if (!statusHistory?.length) {
    return "Pending";
  }

  return statusHistory[statusHistory.length - 1].status;
}

function getStatusColor(alertLevel) {
  const colors = {
    red: "#BA1A1A",
    blue: "#1E1391",
    white: "#A9A9A9",
  };

  return colors[alertLevel] || "#A9A9A9";
}

export default function HazardMapReports() {
  const [selectedReport, setSelectedReport] = useState(null);

  return (
    <section className="relative w-full overflow-hidden bg-[#E0F8F2] px-5 py-12 sm:px-8 md:px-12 lg:px-16">
      {/* Background accent */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-[180px] -top-[120px] h-[620px] w-[620px] rounded-full blur-[10px]"
        style={{
          background:
            "radial-gradient(circle, rgba(120,170,255,0.35) 0%, rgba(120,170,255,0.12) 45%, rgba(120,170,255,0) 75%)",
        }}
      />

      <div className="relative mx-auto flex w-full max-w-[1319px] flex-col gap-10 lg:flex-row lg:items-start lg:gap-20">
        {/* MAP */}
        <div className="h-[516px] w-full shrink-0 overflow-hidden rounded-[13px] bg-white shadow-lg lg:w-[613px]">
          <MapContainer
            center={MAP_CENTER}
            zoom={MAP_ZOOM}
            zoomControl={false}
            attributionControl={false}
            className="h-full w-full"
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="&copy; OpenStreetMap contributors"
            />

            <AttributionControl position="bottomleft" />

            <ZoomControl position="topright" />

            {hazardReports.map((report) => (
              <Marker
                key={report.id}
                position={[report.lat, report.lng]}
                icon={hazardPinIcons[report.alertLevel]}
                eventHandlers={{
                  click: () => setSelectedReport(report),
                }}
              >
                <Popup>
                  <div className="min-w-[180px]">
                    <p className="font-bold text-[#0C142E]">
                      {report.title}
                    </p>

                    <p className="mt-1 text-xs text-gray-600">
                      {report.barangay
                        ? `Barangay ${report.barangay}`
                        : report.address}
                    </p>

                    <p className="mt-2 text-xs font-semibold uppercase text-[#0C142E]">
                      {report.alertLevel} Alert
                    </p>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        {/* INFORMATION COLUMN */}
        <div className="flex min-w-0 flex-1 flex-col gap-5 lg:h-[516px]">
          <h2 className="m-0 font-black text-[35px] leading-[44px] text-[#0C142E]">
            Live Hazard Map
          </h2>

          <p className="m-0 max-w-[514px] text-justify font-normal text-[24px] leading-[30px] text-[#0C142E]">
            Navigate the entire North Caloocan map and View the severity
            levels of each reported hazard near your area through the
            NORTHSAFE Live Hazard Map.
          </p>

          {/* LEGEND */}
          <div className="flex w-full max-w-[592px] flex-wrap items-center justify-between gap-3">
            {SEVERITY_ITEMS.map(({ label, color }) => (
              <div
                key={label}
                className="flex items-center gap-3"
              >
                <span
                  className="inline-block h-5 w-5 shrink-0 rounded-full"
                  style={{
                    backgroundColor: color,
                  }}
                />

                <span className="text-lg text-[#0C142E]">
                  {label}
                </span>
              </div>
            ))}
          </div>

          {/* SELECTED REPORT CARD */}
          <div className="min-h-[250px] flex-1 rounded-[13px] bg-white pb-[29px] pl-[37px] pr-[33px] pt-[29px] shadow-lg">
            <div className="h-full w-full overflow-y-auto rounded-[13px] bg-[#F2F2F2] p-6 shadow-md">
              {selectedReport ? (
                <div>
                  {/* Header */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-xs font-bold uppercase tracking-wide text-gray-500">
                        Hazard Report
                      </p>

                      <h3 className="mt-1 text-xl font-bold leading-7 text-[#0C142E]">
                        {selectedReport.title}
                      </h3>
                    </div>

                    <span
                      className="shrink-0 rounded-full px-3 py-1 text-xs font-bold uppercase text-white"
                      style={{
                        backgroundColor: getStatusColor(
                          selectedReport.alertLevel
                        ),
                      }}
                    >
                      {selectedReport.alertLevel} Alert
                    </span>
                  </div>

                  {/* Details */}
                  <div className="mt-5 space-y-3">
                    <div>
                      <p className="text-xs font-semibold uppercase text-gray-500">
                        Hazard Type
                      </p>

                      <p className="mt-1 text-sm font-medium text-[#0C142E]">
                        {selectedReport.hazardType}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-semibold uppercase text-gray-500">
                        Location
                      </p>

                      <p className="mt-1 text-sm font-medium text-[#0C142E]">
                        {selectedReport.address}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-semibold uppercase text-gray-500">
                        Status
                      </p>

                      <p className="mt-1 text-sm font-medium text-[#0C142E]">
                        {getCurrentStatus(
                          selectedReport.statusHistory
                        )}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-semibold uppercase text-gray-500">
                        Reported By
                      </p>

                      <p className="mt-1 text-sm font-medium text-[#0C142E]">
                        {selectedReport.reporterName}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-semibold uppercase text-gray-500">
                        Description
                      </p>

                      <p className="mt-1 text-sm leading-6 text-gray-600">
                        {selectedReport.description}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex h-full items-center justify-center text-center">
                  <p className="m-0 text-sm leading-6 text-gray-500">
                    Select any hazard from the map
                    <br />
                    to view hazard report details.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}