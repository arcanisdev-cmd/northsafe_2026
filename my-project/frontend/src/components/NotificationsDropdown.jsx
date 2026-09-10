import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import NotificationItem from "./NotificationItem";
import { groupNotificationsByDate } from "../utils/notificationSelectors";

/**
 * `notifications`, `onMarkRead`, `onMarkAllRead` are owned by the parent
 * (AuthNavbar) so the unread badge in the nav and this panel always agree —
 * same "single source of truth" pattern as currentUser.points.
 *
 * `anchorRef` is measured directly (getBoundingClientRect) to position the
 * panel relative to the actual button that opened it, instead of guessing
 * fixed pixel offsets that assumed a specific navbar layout.
 */
function NotificationsDropdown({ isOpen, onClose, anchorRef, notifications, onMarkRead, onMarkAllRead }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("unread");
  const [position, setPosition] = useState({ top: 94, right: 108 });

  useEffect(() => {
    function updatePosition() {
      if (!anchorRef?.current) return;
      const rect = anchorRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + 12,
        right: Math.max(16, window.innerWidth - rect.right - 40),
      });
    }

    if (isOpen) {
      updatePosition();
      window.addEventListener("resize", updatePosition);
      return () => window.removeEventListener("resize", updatePosition);
    }
  }, [isOpen, anchorRef]);

  if (!isOpen) return null;

  const filterFn = (n) => (activeTab === "unread" ? !n.read : true);
  const visible = notifications.filter(filterFn);
  const { today: visibleToday, older: visibleOlder } = groupNotificationsByDate(visible);
  const totalUnread = notifications.filter((n) => !n.read).length;

  const handleView = (notification) => {
    onMarkRead(notification.id);
    onClose();
    // No dedicated report-detail route yet — sending people to My Reports,
    // where the related report actually lives. Swap this for a direct
    // "/my-reports/:id" link once that route exists.
    navigate("/my-reports");
  };

  const content = (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed left-0 right-0 bottom-0 z-40 bg-black/50"
        style={{ top: "82px" }}
      />

      {/* Panel — position is measured from anchorRef, not hardcoded */}
      <div
        className="fixed z-50 bg-white rounded-xl shadow-xl overflow-hidden flex flex-col"
        style={{ top: `${position.top}px`, right: `${position.right}px`, width: "340px", maxHeight: "70vh" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
          <h3 className="font-inter font-bold text-lg text-black">
            Notifications ({totalUnread})
          </h3>
          <div className="flex items-center gap-3">
            {totalUnread > 0 && (
              <button
                type="button"
                onClick={onMarkAllRead}
                className="font-inter text-xs font-semibold text-[#0BA6DF] hover:underline"
              >
                Mark all as read
              </button>
            )}
            <button type="button" onClick={onClose} aria-label="Close notifications">
              <X size={20} className="text-gray-500" />
            </button>
          </div>
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
                    <NotificationItem key={n.id} notification={n} onView={handleView} />
                  ))}
                </div>
              )}

              {visibleOlder.length > 0 && (
                <div>
                  <p className="font-inter font-semibold text-xs text-gray-400 uppercase px-5 pt-3 pb-1">
                    Older
                  </p>
                  {visibleOlder.map((n) => (
                    <NotificationItem key={n.id} notification={n} onView={handleView} />
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