import { Image as ImageIcon } from "lucide-react";

const legend = [
  { label: "High", color: "#D30004" },
  { label: "Medium", color: "#EC8305" },
  { label: "Low", color: "#FEEC41" },
  { label: "Resolved", color: "#39DA10" },
];

const reports = [
  { title: "Flooding near Camarin Road", location: "Camarin, Caloocan City", time: "Reported 12 mins ago", status: "HIGH", statusColor: "#D30004" },
  { title: "Fallen Tree blocking the road", location: "Bagong Silang, Caloocan City", time: "Reported 35 mins ago", status: "LOW", statusColor: "#FEEC41" },
  { title: "Damaged Street Light", location: "Congress, Caloocan City", time: "Reported 1 hour ago", status: "MEDIUM", statusColor: "#FF4C1A" },
  { title: "Blocked Drainage", location: "Bagong Silang, Caloocan City", time: "Reported 2 hours ago", status: "RESOLVED", statusColor: "#39DA10" },
];

function HazardMapReports() {
  return (
    <section className="pl-[107px] pr-[106px] pt-12 pb-24">
      <div className="flex gap-[26px]">
        {/* LEFT: Live Hazard Map */}
        <div className="relative w-[659px] h-[430px] rounded-[20px] bg-[#042545]">
          <h3 className="absolute left-9 top-5 font-inter font-semibold text-2xl text-white">
            Live Hazard Map
          </h3>

          {/* Map placeholder — backend integration handled separately */}
          <div className="absolute left-[41px] top-[65px] w-[577px] h-[304px] rounded-[10px] bg-gray-300 flex items-center justify-center text-gray-500 text-sm">
            Just a placeholder. To be replaced with the actual map component once backend integration is complete.
          </div>

          {/* Legend */}
          <div className="absolute left-[68px] top-[385px] w-[566px] flex justify-between">
            {legend.map((item) => (
              <div key={item.label} className="flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="font-krub font-medium text-base text-white">
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT: Recent Community Reports */}
        <div
          className="relative w-[634px] h-[430px] rounded-[10px] p-[30px]"
          style={{ background: "linear-gradient(180deg, #FFFFFF 0%, #F5F5F5 100%)" }}
        >
          <div className="flex items-center justify-between">
            <h3 className="font-inter font-semibold text-2xl text-[#444444]">
              Recent Community Reports
            </h3>
            <a href="#" className="font-inter font-bold text-sm text-[#018A92]">
              VIEW ALL REPORTS
            </a>
          </div>

          <div className="mt-[27px] flex flex-col gap-[10px]">
            {reports.map((report) => (
              <div
                key={report.title}
                className="relative w-[528px] h-[76px] bg-white rounded-[10px] shadow-md flex items-center px-4 gap-4"
              >
                <div className="w-[43px] h-[43px] bg-gray-200 rounded flex items-center justify-center shrink-0">
                  <ImageIcon size={20} className="text-gray-400" />
                </div>

                <div className="flex-1" style={{ letterSpacing: "8%" }}>
                  <p className="font-krub font-bold text-xs text-black">{report.title}</p>
                  <p className="font-krub font-normal text-xs text-black">{report.location}</p>
                  <p className="font-krub font-normal text-xs text-black">{report.time}</p>
                </div>

                <span
                  className="font-krub font-medium text-xs text-white px-3 py-1.5 rounded-[13px] shrink-0"
                  style={{ backgroundColor: report.statusColor }}
                >
                  {report.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default HazardMapReports;