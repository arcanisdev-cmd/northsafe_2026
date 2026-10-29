import { createContext, useContext, useState, useMemo, useCallback, useRef } from "react";
import {
  staffOfficer,
  staffReviewQueue,
  staffInProgressReports,
  staffNotificationSeed,
} from "../components/data/MockDashboardData";

export const QUEUE_STATUSES = ["Under Review", "Needs Info", "Field Check"];
export const IN_PROGRESS_STATUSES = ["Forwarded", "In Progress"];
export const FIELD_STAGES = ["Awaiting Check", "In Progress", "Findings to Record"];

// Reports flagged before any stage was set start at Awaiting Check
export const fieldStageOf = (r) => (r.fieldCheck && r.fieldCheck.stage) || "Awaiting Check";

const StaffReportsContext = createContext(null);

const STATUS_NOTICE = {
  Verified: ["status", "Report verified", "Ready to forward to a receiving office."],
  "Needs Info": ["status", "Additional information requested", "Waiting for the reporter to reply."],
  "Field Check": ["field_check", "Flagged for field check", "On-site check needed before a decision."],
  Rejected: ["status", "Report rejected", "The report was not accepted."],
  Forwarded: ["status", "Forwarding recorded", "Recorded only. This does not confirm the office has acted."],
  "In Progress": ["status", "Report moved to In Progress", "The receiving office is acting on it."],
  Resolved: ["status", "Report resolved", "The community can still dispute a resolved report."],
};

const FIELD_NOTICE = {
  "In Progress": ["Field check started", "Check under way at the location."],
  "Findings to Record": ["Field visit completed", "Findings are ready to be recorded."],
  Completed: ["Findings recorded", "Your findings were saved."],
};

const STATUS_LINK = {
  "Field Check": "/staff/field-checks",
  Forwarded: "/staff/in-progress",
  "In Progress": "/staff/in-progress",
  Resolved: "/staff/resolved",
};

// Turns a saved action into a notification (or null when nothing is worth showing)
function noticeFromPatch(r, patch) {
  const detail = "/staff/review-queue/" + r.id;
  if (patch.flag) {
    return {
      type: "admin",
      title: patch.flag === "suspicious" ? "Report flagged as suspicious" : "Account reported to Admin",
      body: r.id + " was sent to Admin for review.",
      to: detail,
    };
  }
  if (patch.fieldCheck && FIELD_NOTICE[patch.fieldCheck.stage]) {
    const c = FIELD_NOTICE[patch.fieldCheck.stage];
    return { type: "field_check", title: c[0], body: r.title + ". " + c[1], to: "/staff/field-checks" };
  }
  if (patch.update) {
    return {
      type: "follow_up",
      title: "Office follow-up recorded",
      body: r.title + ". " + patch.update.note,
      to: "/staff/in-progress",
    };
  }
  const s = patch.status && STATUS_NOTICE[patch.status];
  if (!s) return null;
  return { type: s[0], title: s[1], body: r.title + ". " + s[2], to: STATUS_LINK[patch.status] || detail };
}

let noticeCount = 0;

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
  const [notifications, setNotifications] = useState(staffNotificationSeed);

  // Lets recordAction read the latest list without re-creating the callback
  const reportsRef = useRef(reports);
  reportsRef.current = reports;

  // Fake latency. Swap the body for a Laravel call later; pages keep the same API.
  const recordAction = useCallback(
    (id, patch) =>
      new Promise((resolve) => {
        setTimeout(() => {
          const at = new Date().toISOString();
          const current = reportsRef.current.find((r) => r.id === id);
          const notice = current ? noticeFromPatch(current, patch) : null;
          if (notice) {
            noticeCount += 1;
            setNotifications((prev) => [
              { ...notice, id: "n-live-" + noticeCount, reportId: id, at, read: false },
              ...prev,
            ]);
          }
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

  // Swap for PATCH /staff/notifications/:id/read later
  const markRead = useCallback((id) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => (n.read ? n : { ...n, read: true })));
  }, []);

  const value = useMemo(
    () => ({ reports, recordAction, notifications, markRead, markAllRead }),
    [reports, recordAction, notifications, markRead, markAllRead]
  );

  return <StaffReportsContext.Provider value={value}>{children}</StaffReportsContext.Provider>;
}

export function useStaffReports() {
  const ctx = useContext(StaffReportsContext);
  if (!ctx) throw new Error("useStaffReports must be used inside StaffReportsProvider");
  return ctx;
}

// Sidebar and bell badges, derived from the live lists
export function useStaffBadges() {
  const { reports, notifications } = useStaffReports();
  return useMemo(
    () => ({
      reviewQueue: reports.filter((r) => QUEUE_STATUSES.includes(r.status)).length,
      inProgress: reports.filter((r) => IN_PROGRESS_STATUSES.includes(r.status)).length,
      fieldChecks: reports.filter((r) => r.status === "Field Check").length,
      notifications: notifications.filter((n) => !n.read).length,
    }),
    [reports, notifications]
  );
}