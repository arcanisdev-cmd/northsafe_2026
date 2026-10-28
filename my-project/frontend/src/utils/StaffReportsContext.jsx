import { createContext, useContext, useState, useMemo, useCallback } from "react";
import {
  staffOfficer,
  staffReviewQueue,
  staffInProgressReports,
  staffNavBadges,
} from "../components/data/MockDashboardData";

export const QUEUE_STATUSES = ["Under Review", "Needs Info", "Field Check"];
export const IN_PROGRESS_STATUSES = ["Forwarded", "In Progress"];
export const FIELD_STAGES = ["Awaiting Check", "In Progress", "Findings to Record"];

// Reports flagged before any stage was set start at Awaiting Check
export const fieldStageOf = (r) => (r.fieldCheck && r.fieldCheck.stage) || "Awaiting Check";

const StaffReportsContext = createContext(null);

function buildInitialTimeline(r) {
  const t = new Date(r.submittedAt).getTime();
  const at = (m) => new Date(t + m * 60000).toISOString();
  const items = [
    { label: "Report submitted", detail: "By " + r.reporter, at: at(0), by: "Reporter" },
    {
      label: "AI assessment completed",
      detail: r.aiCategory + ", " + r.aiSeverity + " severity (suggestion only)",
      at: at(1),
      by: "System",
    },
    { label: "Added to Review Queue", detail: "Status: Under Review", at: at(2), by: "System" },
  ];
  if (r.status === "Needs Info") {
    items.push({ label: "Additional info requested", detail: "Waiting on the reporter.", at: at(8), by: staffOfficer.name });
  }
  if (r.status === "Field Check") {
    items.push({ label: "Flagged for field check", detail: "On-site check needed before a decision.", at: at(8), by: staffOfficer.name });
  }
  return items;
}

// One normalized list for every staff page. Shape of a future GET /staff/reports
let fieldSeedCount = 0;
const SEED = [...staffReviewQueue, ...staffInProgressReports].map((r) => {
  const timeline = r.timeline || buildInitialTimeline(r);
  const base = {
    flags: { suspicious: false, deactivation: false },
    updates: [],
    forwarding: null,
    resolution: null,
    fieldCheck: null,
    ...r,
    timeline,
  };
  if (r.status !== "Field Check") return base;

  // Spread seeded field checks across the three stages so the board has data
  const stage = FIELD_STAGES[fieldSeedCount % FIELD_STAGES.length];
  fieldSeedCount += 1;
  const flaggedAt = new Date(timeline[timeline.length - 1].at).getTime();
  const after = (m) => new Date(flaggedAt + m * 60000).toISOString();
  const extra = [];
  if (stage !== "Awaiting Check") {
    extra.push({ label: "Field check started", detail: "Check under way at the location.", at: after(2), by: staffOfficer.name });
  }
  if (stage === "Findings to Record") {
    extra.push({ label: "Field visit completed", detail: "Findings are ready to be recorded.", at: after(4), by: staffOfficer.name });
  }
  return {
    ...base,
    fieldCheck: { stage, startedAt: stage === "Awaiting Check" ? null : after(2), findings: null },
    timeline: [...timeline, ...extra],
  };
});

export function StaffReportsProvider({ children }) {
  const [reports, setReports] = useState(SEED);

  // Fake latency. Swap the body for a Laravel call later; pages keep the same API.
  const recordAction = useCallback(
    (id, patch) =>
      new Promise((resolve) => {
        setTimeout(() => {
          const at = new Date().toISOString();
          setReports((prev) =>
            prev.map((r) => {
              if (r.id !== id) return r;
              const next = { ...r };
              if (patch.status) next.status = patch.status;
              if (patch.severity) next.severity = patch.severity;
              if (patch.flag) next.flags = { ...r.flags, [patch.flag]: true };
              if (patch.forwarding) next.forwarding = patch.forwarding;
              if (patch.resolution) next.resolution = { ...patch.resolution, at };
              if (patch.fieldCheck) {
                next.fieldCheck = { ...(r.fieldCheck || {}), ...patch.fieldCheck };
              } else if (patch.status === "Field Check") {
                next.fieldCheck = {
                  stage: "Awaiting Check",
                  startedAt: null,
                  findings: r.fieldCheck ? r.fieldCheck.findings : null,
                };
              }
              if (patch.update) {
                next.updates = [...r.updates, { ...patch.update, at, by: staffOfficer.name }];
              }
              if (patch.entry) {
                next.timeline = [...r.timeline, { ...patch.entry, at, by: staffOfficer.name }];
              }
              return next;
            })
          );
          resolve();
        }, 800);
      }),
    []
  );

  const value = useMemo(() => ({ reports, recordAction }), [reports, recordAction]);

  return <StaffReportsContext.Provider value={value}>{children}</StaffReportsContext.Provider>;
}

export function useStaffReports() {
  const ctx = useContext(StaffReportsContext);
  if (!ctx) throw new Error("useStaffReports must be used inside StaffReportsProvider");
  return ctx;
}

// Sidebar badges, derived from the live list
export function useStaffBadges() {
  const { reports } = useStaffReports();
  return useMemo(
    () => ({
      reviewQueue: reports.filter((r) => QUEUE_STATUSES.includes(r.status)).length,
      inProgress: reports.filter((r) => IN_PROGRESS_STATUSES.includes(r.status)).length,
      fieldChecks: reports.filter((r) => r.status === "Field Check").length,
      notifications: staffNavBadges.notifications,
    }),
    [reports]
  );
}