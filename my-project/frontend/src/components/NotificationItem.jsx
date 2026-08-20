import { AlertTriangle, ThumbsDown } from "lucide-react";

function NotificationItem({ icon: Icon, iconColor, title, titleColor, subtitle, timeAgo, unread }) {
  return (
    <div className="flex gap-3 px-5 py-4 hover:bg-gray-50 cursor-pointer">
      <div className="relative shrink-0">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{ backgroundColor: iconColor }}
        >
          <Icon size={18} className="text-white" />
        </div>
        {unread && (
          <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#D30004] border-2 border-white" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className="font-inter font-bold text-sm" style={{ color: titleColor }}>
            {title}
          </p>
          <span className="font-inter text-xs text-gray-400 shrink-0">{timeAgo}</span>
        </div>
        <p className="font-inter text-xs text-gray-500 mt-1">{subtitle}</p>
        <button type="button" className="font-inter text-xs font-semibold underline mt-1.5" style={{ color: titleColor }}>
          View
        </button>
      </div>
    </div>
  );
}

export default NotificationItem;