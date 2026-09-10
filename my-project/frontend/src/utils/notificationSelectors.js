import { AlertTriangle, ThumbsDown, ThumbsUp, CheckCircle2, MessageCircle } from "lucide-react";
import { parseReportDateTime } from "./reportSelectors";

// A fixed "current moment" for this mock/demo, since the mock timestamps
// are set in mid-2026 rather than tracking the real device clock. All
// "time ago" and Today/Older grouping is computed relative to this, so it
// stays consistent no matter when you actually run the app. Swap this for
// `new Date()` once real timestamps come from a backend.
export const MOCK_NOW = new Date(2026, 5, 15, 23, 30); // June 15, 2026, 11:30 PM

// UI-only concern (icon component + color) keyed by the data-layer's
// `type` string — kept out of MockDashboardData.js since a backend would
// send a type string, not a lucide-react component reference.
export const NOTIFICATION_TYPE_STYLES = {
  rejected: { icon: AlertTriangle, color: "#D30004" },
  downvoted: { icon: ThumbsDown, color: "#0BA6DF" },
  upvoted: { icon: ThumbsUp, color: "#0BA6DF" },
  verified: { icon: CheckCircle2, color: "#22A559" },
  resolved: { icon: CheckCircle2, color: "#22A559" },
  comment: { icon: MessageCircle, color: "#1E1391" },
};

export function getMyNotifications(notifications, userId) {
  return notifications.filter((n) => n.recipientId === userId);
}

export function getUnreadCount(notifications) {
  return notifications.filter((n) => !n.read).length;
}

/** "7hrs", "23m", "3d", relative to MOCK_NOW — not a static stored string. */
export function formatTimeAgo(timestamp, now = MOCK_NOW) {
  const date = parseReportDateTime(timestamp);
  const diffMinutes = Math.floor((now - date) / 60000);

  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes}m`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}hrs`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d`;
}

/** Splits into Today / Older based on calendar day vs. MOCK_NOW, newest first. */
export function groupNotificationsByDate(notifications, now = MOCK_NOW) {
  const sorted = [...notifications].sort(
    (a, b) => parseReportDateTime(b.timestamp) - parseReportDateTime(a.timestamp)
  );

  const today = [];
  const older = [];

  sorted.forEach((n) => {
    const date = parseReportDateTime(n.timestamp);
    const isToday =
      date.getFullYear() === now.getFullYear() &&
      date.getMonth() === now.getMonth() &&
      date.getDate() === now.getDate();
    (isToday ? today : older).push(n);
  });

  return { today, older };
}