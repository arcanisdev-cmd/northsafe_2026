import { useState } from "react";
import { createPortal } from "react-dom";
import { X, AlertTriangle, ThumbsDown } from "lucide-react";
import NotificationItem from "./NotificationItem";

const todayNotifications = [
  {
    id: 1,
    icon: AlertTriangle,
    iconColor: "#D30004",
    title: "Report Has Been Rejected.",
    titleColor: "#D30004",
    subtitle: "Large Pothole on Main Road Causing Traffic Delays",
    timeAgo: "7hrs",
    unread: true,
  },
  {
    id: 2,
    icon: ThumbsDown,
    iconColor: "#0BA6DF",
    title: "James and 4 other people downvoted your report.",
    titleColor: "#0BA6DF",
    subtitle: "Large Pothole on Main Road Causing Traffic Delays",
    timeAgo: "7hrs",
    unread: true,
  },
];

const olderNotifications = [];

function NotificationsDropdown({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState("unread");

  if (!isOpen) return null;

  const filterFn = (n) => (activeTab === "unread" ? n.unread : true);
  const visibleToday = todayNotifications.filter(filterFn);
  const visibleOlder = olderNotifications.filter(filterFn);
  const totalUnread = todayNotifications.filter((n) => n.unread).length;

  const content = (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed left-0 right-0 bottom-0 z-40 bg-black/50"
        style={{ top: "82px" }}
      />

      {/* Panel */}
      <div
        className="fixed z-50 bg-white rounded-xl shadow-xl overflow-hidden flex flex-col"
        style={{ top: "94px", right: "108px", width: "340px", maxHeight: "70vh" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
          <h3 className="font-inter font-bold text-lg text-black">
            Notifications ({totalUnread})
          </h3>
          <button type="button" onClick={onClose} aria-label="Close notifications">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 px-5 py-3 border-b border-gray-100 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab("all")}
            className={`text-sm font-inter font-semibold px-3 py-1 rounded-full ${
              activeTab === "all" ? "bg-[#EAF6FF] text-[#0BA6DF]" : "text-gray-400"
            }`}
          >
            ALL
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("unread")}
            className={`text-sm font-inter font-semibold px-3 py-1 rounded-full ${
              activeTab === "unread" ? "bg-[#EAF6FF] text-[#0BA6DF]" : "text-gray-400"
            }`}
          >
            UNREAD
          </button>
        </div>

        {/* Scrollable list, grouped by section */}
        <div className="overflow-y-auto">
          {visibleToday.length === 0 && visibleOlder.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">No notifications</p>
          ) : (
            <>
              {visibleToday.length > 0 && (
                <div>
                  <p className="font-inter font-semibold text-xs text-gray-400 uppercase px-5 pt-3 pb-1">
                    Today
                  </p>
                  {visibleToday.map((n) => (
                    <NotificationItem key={n.id} {...n} />
                  ))}
                </div>
              )}

              {visibleOlder.length > 0 && (
                <div>
                  <p className="font-inter font-semibold text-xs text-gray-400 uppercase px-5 pt-3 pb-1">
                    Older
                  </p>
                  {visibleOlder.map((n) => (
                    <NotificationItem key={n.id} {...n} />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );

  return createPortal(content, document.body);
}

export default NotificationsDropdown;