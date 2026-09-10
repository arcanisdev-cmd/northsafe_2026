import { getNotificationIcon, formatTimeAgo } from "../utils/notificationSelectors";

function NotificationItem({ notification, onView }) {
  const style = getNotificationIcon(notification.type);
  const Icon = style.icon;
  const unread = !notification.read;

  const handleActivate = () => onView(notification);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleActivate}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleActivate();
        }
      }}
      className={`flex gap-3 px-5 py-3.5 cursor-pointer hover:bg-gray-50 transition-colors ${
        unread ? "bg-[#F5FBFF] border-l-[3px] border-l-[#0BA6DF]" : "border-l-[3px] border-l-transparent"
      }`}
    >
      <div className="relative shrink-0">
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center"
          style={{ backgroundColor: style.softBg }}
        >
          <Icon size={16} style={{ color: style.color }} />
        </div>
        {unread && (
          <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#D30004] border-2 border-white" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className="font-inter font-bold text-sm text-gray-900">{notification.title}</p>
          <span className="font-inter text-xs text-gray-400 shrink-0">
            {formatTimeAgo(notification.timestamp)}
          </span>
        </div>
        <p className="font-inter text-xs text-gray-500 mt-1 line-clamp-2">
          {notification.subtitle}
        </p>
      </div>
    </div>
  );
}

export default NotificationItem;