import { User, ImageIcon, MapPin, ArrowUp, ArrowDown, MessageCircle, CheckCircle2 } from "lucide-react";

function HazardReportCard({
  reporterName = "Jam Dagonio",
  timeAgo = "3 hrs ago",
  status = "CRITICAL",
  hazardType = "Flood",
  title = "Large Pothole on Main Road Causing Traffic Delays",
  description = "Dangerous pothole discovered near the road intersection.",
  address = "Beside Barangay 167 Llano road in kamagong street",
  dateTime = "06/15/2026 11:26PM",
  verified = true,
  upvotes = 12,
  downvotes = 12,
  comments = 12,
  imageSrc,
}) {
  return (
    <div
      className="rounded-2xl bg-white p-6"
      style={{ width: "718px", border: "0.25px solid #979797" }}
    >
      {/* Top row: avatar, name, time, status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-[30px] h-[30px] rounded-full bg-gray-100 flex items-center justify-center">
            <User size={16} className="text-gray-500" />
          </div>
          <span className="font-inter font-semibold text-sm text-black">{reporterName}</span>
          <span className="font-inter text-xs" style={{ color: "#A6A6A6", lineHeight: "20px" }}>
            {timeAgo}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: "#FF6F47" }} />
          <span className="font-inter font-bold text-xs" style={{ color: "#767676" }}>
            {status}
          </span>
        </div>
      </div>

      {/* Image + content */}
      <div className="flex gap-5 mt-4">
        {/* Image */}
        <div className="w-[247px] h-[220px] rounded-xl bg-gray-100 flex items-center justify-center shrink-0 overflow-hidden">
          {imageSrc ? (
            <img src={imageSrc} alt={title} className="w-full h-full object-cover" />
          ) : (
            <ImageIcon size={32} className="text-gray-300" />
          )}
        </div>

        {/* Text content */}
        <div className="flex-1 flex flex-col">
          <h3 className="font-inter font-semibold text-base text-black leading-tight">
            {title}
          </h3>

          <p className="font-inter text-sm text-black mt-2">{description}</p>

          <div className="flex items-center gap-1.5 mt-3" style={{ color: "#4A4A4A" }}>
            <MapPin size={14} className="shrink-0" />
            <span className="font-inter text-xs">{address}</span>
          </div>

          <div className="flex items-center gap-1.5 mt-1.5" style={{ color: "#A6A6A6" }}>
            <span className="font-inter text-xs">{dateTime}</span>
          </div>

          {/* Tags */}
          <div className="flex flex-col gap-1.5 mt-3">
            <span
              className="inline-flex items-center gap-1.5 w-fit px-3 py-1 rounded-full font-inter text-xs font-medium"
              style={{ backgroundColor: "#FFE4D1", color: "#FF6F47" }}
            >
              {hazardType}
            </span>

            {verified && (
              <span
                className="inline-flex items-center gap-1.5 w-fit font-inter text-xs font-medium"
                style={{ color: "#22C55E" }}
              >
                <CheckCircle2 size={14} />
                Verified
              </span>
            )}
          </div>

          {/* Action row */}
          <div className="flex items-center gap-2 mt-3">
            <button type="button" className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-300 text-white text-sm font-medium">
              <ArrowUp size={14} />
              {upvotes}
            </button>
            <button type="button" className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-300 text-white text-sm font-medium">
              <ArrowDown size={14} />
              {downvotes}
            </button>
            <button type="button" className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-300 text-white text-sm font-medium">
              <MessageCircle size={14} />
              {comments}
            </button>
            <button
              type="button"
              className="ml-auto px-5 py-1.5 rounded-full text-white text-sm font-bold"
              style={{ backgroundColor: "#46B5FF" }}
            >
              VIEW HAZARD MAP
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HazardReportCard;