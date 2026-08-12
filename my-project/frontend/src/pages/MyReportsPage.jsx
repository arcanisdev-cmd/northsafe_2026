import { useState } from "react";
import { ClipboardList, Clock, CheckCircle, Ban, Search, Plus } from "lucide-react";
import AuthNavbar from "../layouts/AuthNavbar";
import Footer from "../layouts/Footer";
import StatCard from "../components/StatCard";
import HazardReportCard from "../components/HazardReportCard";
import ReportStatusTimeline from "../components/ReportStatusTimeline";

const stats = [
  { icon: ClipboardList, label: "Total Reports", value: 25, color: "#0C543B" },
  { icon: Clock, label: "Pending", value: 2, color: "#9DB4C2" },
  { icon: CheckCircle, label: "Resolved", value: 20, color: "#008031" },
  { icon: Ban, label: "Rejected", value: 3, color: "#AB0000" },
];

const reports = [
  { id: 1, status: "Pending", title: "Large Pothole on Main Road Causing Traffic Delays", dateTime: "06/15/2026 11:26PM" },
  { id: 2, status: "Resolved", title: "Large Pothole on Main Road Causing Traffic Delays", dateTime: "06/15/2026 11:26PM" },
  { id: 3, status: "Verified", title: "Large Pothole on Main Road Causing Traffic Delays", dateTime: "06/15/2026 11:26PM" },
];

function MyReportsPage() {
  const [selectedReport, setSelectedReport] = useState(reports[0]);

  return (
    <div className="overflow-x-hidden">
      <div className="max-w-[1532px] mx-auto">
        <AuthNavbar />

        <div style={{ backgroundColor: "#D4D3FF" }} className="px-[108px] py-8">
          {/* Stat cards */}
          <div className="flex gap-5">
            {stats.map((s) => (
              <StatCard key={s.label} {...s} />
            ))}
          </div>

          {/* Header row: title, search, button */}
          <div className="flex items-center gap-5 mt-8">
            <h2 className="font-krub font-bold text-xl" style={{ color: "#6A6A6A" }}>
              Submitted Reports
            </h2>

            <div
              className="flex items-center gap-2 bg-white rounded-lg px-4 flex-1"
              style={{ height: "43px", border: "1px solid #A3A3A3" }}
            >
              <Search size={16} className="text-gray-400" />
              <input
                type="text"
                placeholder="Search ..."
                className="flex-1 text-sm bg-transparent outline-none min-w-0"
              />
            </div>

            <button
              type="button"
              className="flex items-center gap-2 rounded-lg text-white font-inter font-bold text-sm shrink-0"
              style={{ width: "314px", height: "43px", backgroundColor: "#F29D38", justifyContent: "center" }}
            >
              <Plus size={16} />
              Report a Hazard
            </button>
          </div>

          {/* Report list + timeline */}
          <div className="flex gap-5 mt-6 items-start">
            <div className="flex flex-col gap-5" style={{ width: "980.96px" }}>
              {reports.map((report) => (
                <HazardReportCard
                  key={report.id}
                  width="100%"
                  buttonColor="#042545"
                  title={report.title}
                  dateTime={report.dateTime}
                  onClick={() => setSelectedReport(report)}
                />
              ))}
            </div>

            <ReportStatusTimeline report={selectedReport} />
          </div>
        </div>

        <Footer />
      </div>
    </div>
  );
}

export default MyReportsPage;