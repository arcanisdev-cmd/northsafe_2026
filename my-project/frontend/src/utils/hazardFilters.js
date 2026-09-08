export function countByField(reports, field) {
  return reports.reduce((acc, report) => {
    const key = report[field];
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
}

/** mm/dd/yyyy, matching the format already used in hazardReports.dateTime */
export function formatDateMDY(date) {
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const yyyy = date.getFullYear();
  return `${mm}/${dd}/${yyyy}`;
}

/**
 * Applies the sidebar's combined filter state to hazardReports.
 * An empty array for any multi-select filter means "no filter applied"
 * (show all), matching standard filter-panel UX.
 *
 * filters shape:
 * {
 *   hazardTypes: string[],
 *   hazardStatuses: string[],
 *   barangays: number[],
 *   alertLevels: string[],      // "red" | "blue" | "white"
 *   date: Date | null,
 * }
 */
export function filterHazardReports(reports, filters) {
  const { hazardTypes, hazardStatuses, barangays, alertLevels, date } = filters;

  return reports.filter((report) => {
    if (hazardTypes.length && !hazardTypes.includes(report.hazardType)) return false;
    if (hazardStatuses.length && !hazardStatuses.includes(report.status)) return false;
    if (barangays.length && !barangays.includes(report.barangay)) return false;
    if (alertLevels.length && !alertLevels.includes(report.alertLevel)) return false;

    if (date) {
      const reportDatePart = report.dateTime.split(" ")[0]; // "06/15/2026 11:26PM" -> "06/15/2026"
      if (reportDatePart !== formatDateMDY(date)) return false;
    }

    return true;
  });
}

/** Default empty filter state — no filters applied, all reports shown. */
export function getDefaultMapFilters() {
  return {
    hazardTypes: [],
    hazardStatuses: [],
    barangays: [],
    alertLevels: [],
    date: null,
    evacuationCentersOn: false,
    floodedRoadsOn: false,
  };
}
