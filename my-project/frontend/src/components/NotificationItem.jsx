import { NOTIFICATION_TYPE_STYLES, formatTimeAgo } from "../utils/notificationSelectors";

function NotificationItem({ notification, onView }) {
  const style = NOTIFICATION_TYPE_STYLES[notification.type] || NOTIFICATION_TYPE_STYLES.comment;
  const Icon = style.icon;

  return (
    <div
      onClick={() => onView(notification)}
      className="flex gap-3 px-5 py-4 hover:bg-gray-50 cursor-pointer"
    >
      <div className="relative shrink-0">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{ backgroundColor: style.color }}
        >
          <Icon size={18} className="text-white" />
        </div>
        {!notification.read && (
          <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#D30004] border-2 border-white" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className="font-inter font-bold text-sm" style={{ color: style.color }}>
            {notification.title}
          </p>
          <span className="font-inter text-xs text-gray-400 shrink-0">
            {formatTimeAgo(notification.timestamp)}
          </span>
        </div>
        <p className="font-inter text-xs text-gray-500 mt-1">{notification.subtitle}</p>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation(); // avoid double-firing with the row's own onClick
            onView(notification);
          }}
          className="font-inter text-xs font-semibold underline mt-1.5"
          style={{ color: style.color }}
        >
          View
        </button>
      </div>
    </div>
  );
}

export default NotificationItem;