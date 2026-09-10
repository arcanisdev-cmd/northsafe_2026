import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import NotificationItem from "./NotificationItem";
import { groupNotificationsByDate } from "../utils/notificationSelectors";

const PANEL_WIDTH = 320;
const LIST_CAP = 20;
const NAVBAR_GAP = 6;

function NotificationsDropdown({
  isOpen,
  onClose,
  anchorRef,
  notifications,
  onMarkRead,
  onMarkAllRead,
}) {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("unread");

  const [position, setPosition] = useState({
    top: 88,
    left: 0,
    caretLeft: 0,
    navBottom: 82,
  });

  useEffect(() => {
    function updatePosition() {
      if (!anchorRef?.current) return;

      const button = anchorRef.current;
      const buttonRect = button.getBoundingClientRect();

      /*
       * IMPORTANT:
       *
       * Do NOT use buttonRect.bottom for the dropdown's vertical position.
       *
       * The notification button sits vertically inside the navbar, so using
       * its bottom causes the dropdown to overlap the navbar.
       *
       * Instead, find the actual navbar and use its bottom edge.
       */
      const nav = button.closest("nav");

      const navRect = nav
        ? nav.getBoundingClientRect()
        : null;

      const navBottom = navRect
        ? navRect.bottom
        : 82;

      /*
       * Center the dropdown underneath the Notifications button.
       */
      const buttonCenterX =
        buttonRect.left + buttonRect.width / 2;

      const panelLeft = Math.max(
        12,
        Math.min(
          buttonCenterX - PANEL_WIDTH / 2,
          window.innerWidth - PANEL_WIDTH - 12
        )
      );

      /*
       * The dropdown starts just BELOW the navbar.
       */
      const panelTop = navBottom + NAVBAR_GAP;

      /*
       * Caret is centered on the Notifications button and sits
       * directly in the small gap between navbar and dropdown.
       */
      const caretLeft = buttonCenterX - 5;

      setPosition({
        top: panelTop,
        left: panelLeft,
        caretLeft,
        navBottom,
      });
    }

    if (isOpen) {
      updatePosition();

      window.addEventListener("resize", updatePosition);
      window.addEventListener("scroll", updatePosition);

      return () => {
        window.removeEventListener("resize", updatePosition);
        window.removeEventListener("scroll", updatePosition);
      };
    }
  }, [isOpen, anchorRef]);

  if (!isOpen) return null;

  const totalCount = notifications.length;

  const totalUnread = notifications.filter(
    (n) => !n.read
  ).length;

  /*
   * Sort notifications first, then cap to the newest 20.
   */
  const {
    today: sortedToday,
    older: sortedOlder,
  } = groupNotificationsByDate(notifications);

  const capped = [
    ...sortedToday,
    ...sortedOlder,
  ].slice(0, LIST_CAP);

  /*
   * Filter according to selected tab.
   */
  const filterFn = (n) =>
    activeTab === "unread" ? !n.read : true;

  const visible = capped.filter(filterFn);

  const {
    today: visibleToday,
    older: visibleOlder,
  } = groupNotificationsByDate(visible);

  const handleView = (notification) => {
    onMarkRead(notification.id);
    onClose();

    navigate("/my-reports");
  };

  const goToFullNotifications = () => {
    onClose();
    navigate("/notifications");
  };

  const content = (
    <>
      {/* 
        BACKDROP

        Begins below the navbar so the navbar remains fully visible.
      */}
      <div
        onClick={onClose}
        className="fixed left-0 right-0 bottom-0 z-[9998] bg-black/50"
        style={{
          top: `${position.navBottom}px`,
        }}
      />

      {/* 
        CARET / INDICATOR

        Small white diamond positioned in the gap between the navbar
        and notification panel.

        Because the diamond is rotated 45 degrees, it visually appears
        as a small downward-pointing triangle.
      */}
      <div
        className="fixed z-[10001] w-2.5 h-2.5 bg-white rotate-45"
        style={{
          top: `${position.navBottom + 1}px`,
          left: `${position.caretLeft}px`,
        }}
      />

      {/* 
        NOTIFICATION PANEL
      */}
      <div
        className="fixed z-[10000] bg-white rounded-xl overflow-hidden flex flex-col border border-gray-100"
        style={{
          top: `${position.top}px`,
          left: `${position.left}px`,
          width: `${PANEL_WIDTH}px`,
          maxHeight: "70vh",
          boxShadow:
            "0px 16px 40px rgba(0,0,0,0.18), 0px 4px 12px rgba(0,0,0,0.08)",
        }}
      >
        {/* HEADER */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
          <h3 className="font-inter font-bold text-lg text-black">
            {totalUnread > 0
              ? `${totalUnread} new`
              : "Notifications"}
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

            <button
              type="button"
              onClick={onClose}
              aria-label="Close notifications"
            >
              <X
                size={20}
                className="text-gray-500"
              />
            </button>
          </div>
        </div>

        {/* TABS */}
        <div className="flex gap-2 px-5 py-3 border-b border-gray-100 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab("all")}
            className={`text-sm font-inter font-semibold px-3 py-1 rounded-full ${
              activeTab === "all"
                ? "bg-[#EAF6FF] text-[#0BA6DF]"
                : "text-gray-400"
            }`}
          >
            All
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("unread")}
            className={`flex items-center gap-1.5 text-sm font-inter font-semibold px-3 py-1 rounded-full ${
              activeTab === "unread"
                ? "bg-[#EAF6FF] text-[#0BA6DF]"
                : "text-gray-400"
            }`}
          >
            Unread

            {totalUnread > 0 && (
              <span className="text-[10px] font-bold bg-[#0BA6DF] text-white rounded-full px-1.5 py-0.5">
                {totalUnread}
              </span>
            )}
          </button>
        </div>

        {/* NOTIFICATION LIST */}
        <div className="relative overflow-y-auto">
          {visibleToday.length === 0 &&
          visibleOlder.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">
              No notifications
            </p>
          ) : (
            <>
              {/* TODAY */}
              {visibleToday.length > 0 && (
                <div>
                  <p className="font-inter font-semibold text-xs text-gray-400 uppercase px-5 pt-3 pb-1">
                    Today
                  </p>

                  {visibleToday.map((n) => (
                    <NotificationItem
                      key={n.id}
                      notification={n}
                      onView={handleView}
                    />
                  ))}
                </div>
              )}

              {/* OLDER */}
              {visibleOlder.length > 0 && (
                <div>
                  <p className="font-inter font-semibold text-xs text-gray-400 uppercase px-5 pt-3 pb-1">
                    Older
                  </p>

                  {visibleOlder.map((n) => (
                    <NotificationItem
                      key={n.id}
                      notification={n}
                      onView={handleView}
                    />
                  ))}
                </div>
              )}

              {/* BOTTOM FADE */}
              <div
                className="sticky bottom-0 h-7 pointer-events-none"
                style={{
                  background:
                    "linear-gradient(to bottom, transparent, #FFFFFF)",
                }}
              />
            </>
          )}
        </div>

        {/* FOOTER */}
        <div className="px-5 py-3 border-t border-gray-100 text-center shrink-0">
          <button
            type="button"
            onClick={goToFullNotifications}
            className="font-inter text-sm font-semibold text-[#0BA6DF] hover:underline"
          >
            View all notifications

            {totalCount > LIST_CAP && (
              <span className="bg-[#EAF6FF] text-[#0BA6DF] text-[10.5px] font-bold px-2 py-0.5 rounded-full ml-1.5">
                {totalCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </>
  );

  return createPortal(content, document.body);
}

export default NotificationsDropdown;