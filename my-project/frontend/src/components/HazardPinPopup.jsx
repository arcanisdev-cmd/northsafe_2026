import { ThumbsUp, ThumbsDown, MessageCircle, BadgeCheck } from "lucide-react";
import { alertLevelOptions } from "./data/MockDashboardData";

const ALERT_DOT_BY_LEVEL = alertLevelOptions.reduce((acc, opt) => {
  acc[opt.value] = opt.dot;
  return acc;
}, {});

function HazardPinPopup({ report }) {
  return (
    <div style={{ width: "260px" }} className="font-sans">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[12px] font-medium text-gray-700">{report.reporterName}</span>
        <span className="text-[11px] text-gray-400">{report.timeAgo}</span>
        <span
          className="h-2 w-2 rounded-full shrink-0 ml-2"
          style={{ backgroundColor: ALERT_DOT_BY_LEVEL[report.alertLevel] }}
        />
      </div>

      {report.imageSrc ? (
        <img
          src={report.imageSrc}
          alt={report.title}
          className="w-full h-[110px] object-cover rounded-md mb-2"
        />
      ) : (
        <div className="w-full h-[110px] bg-gray-100 rounded-md mb-2 flex items-center justify-center">
          <span className="text-[11px] text-gray-400">No photo</span>
        </div>
      )}

      <p className="text-[13px] font-semibold text-gray-900 leading-snug mb-1">{report.title}</p>
      <p className="text-[12px] text-gray-500 mb-2">{report.description}</p>

      <p className="text-[11px] text-gray-500 mb-1">{report.address}</p>
      <p className="text-[11px] text-gray-400 mb-2">{report.dateTime}</p>

      <div className="flex items-center gap-2 mb-2">
        <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-orange-50 text-orange-600">
          {report.hazardType}
        </span>
        {report.verified && (
          <span className="flex items-center gap-1 text-[11px] text-green-600">
            <BadgeCheck size={12} /> Verified
          </span>
        )}
      </div>

      <div className="flex items-center gap-3 text-[11px] text-gray-500">
        <span className="flex items-center gap-1">
          <ThumbsUp size={12} /> {report.upvotes}
        </span>
        <span className="flex items-center gap-1">
          <ThumbsDown size={12} /> {report.downvotes}
        </span>
        <span className="flex items-center gap-1">
          <MessageCircle size={12} /> {report.comments}
        </span>
      </div>
    </div>
  );
}

export default HazardPinPopup;
