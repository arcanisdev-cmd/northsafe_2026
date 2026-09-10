import { reportStatusPipeline } from "../components/data/MockDashboardData";

/** Parses "06/15/2026 11:26PM" (no space before AM/PM) into a real Date. */
export function parseReportDateTime(dateTimeStr) {
  const [datePart, timePart] = dateTimeStr.split(" ");
  const [mm, dd, yyyy] = datePart.split("/").map(Number);
  const match = timePart?.match(/(\d+):(\d+)(AM|PM)/i);

  let hours = 0;
  let minutes = 0;
  if (match) {
    hours = parseInt(match[1], 10) % 12;
    minutes = parseInt(match[2], 10);
    if (/PM/i.test(match[3])) hours += 12;
  }
  return new Date(yyyy, mm - 1, dd, hours, minutes);
}

/** Ownership filter — "my reports" means reporterId === currentUser.id. */
export function getMyReports(reports, userId) {
  return reports.filter((r) => r.reporterId === userId);
}

/** The report's current status is simply the last entry in its history. */
export function getCurrentStatus(report) {
  const history = report.statusHistory || [];
  return history.length ? history[history.length - 1].status : null;
}

/** "Verified" badge is derived from history, never a separate stored flag. */
export function isVerified(report) {
  return (report.statusHistory || []).some((s) => s.status === "Verified");
}

const TERMINAL_STATUSES = ["Resolved", "Points Accumulated", "Rejected"];

/** Live stat-card counts — always computed from the reports, never stored. */
export function getReportStats(myReports) {
  return myReports.reduce(
    (acc, report) => {
      acc.total += 1;
      const status = getCurrentStatus(report);
      if (status === "Rejected") acc.rejected += 1;
      else if (status === "Resolved" || status === "Points Accumulated") acc.resolved += 1;
      else acc.pending += 1; // Submitted / Pending / Verified all read as "in progress"
      return acc;
    },
    { total: 0, pending: 0, resolved: 0, rejected: 0 }
  );
}

/**
 * Which report the Timeline sidebar shows by default: the most recent
 * report that's still in progress, falling back to the most recent report
 * overall if everything is already Resolved/Rejected.
 */
export function getDefaultSelectedReport(myReports) {
  if (!myReports.length) return null;
  const inProgress = myReports.filter((r) => !TERMINAL_STATUSES.includes(getCurrentStatus(r)));
  const pool = inProgress.length ? inProgress : myReports;
  return [...pool].sort(
    (a, b) => parseReportDateTime(b.dateTime) - parseReportDateTime(a.dateTime)
  )[0];
}

/**
 * Search / Barangay / Category (hazardType) / Hazard Status filters for the
 * My Reports list. Empty/undefined filter values mean "no filter applied."
 */
export function filterMyReports(myReports, filters) {
  const { search, barangay, hazardType, status } = filters;
  return myReports.filter((r) => {
    if (search && !r.title.toLowerCase().includes(search.toLowerCase())) return false;
    if (barangay && r.barangay !== barangay) return false;
    if (hazardType && r.hazardType !== hazardType) return false;
    if (status && getCurrentStatus(r) !== status) return false;
    return true;
  });
}

export function paginate(items, page, pageSize) {
  const start = (page - 1) * pageSize;
  return items.slice(start, start + pageSize);
}

export function getTotalPages(itemCount, pageSize) {
  return Math.max(1, Math.ceil(itemCount / pageSize));
}

// Re-exported for convenience so pages don't need two import sources for
// the timeline's step order.
export { reportStatusPipeline };