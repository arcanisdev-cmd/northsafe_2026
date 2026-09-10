import { reportStatusPipeline } from "../utils/reportSelectors";

// Helper text shown only under the CURRENT (most recently reached) step —
// past reached steps show just the report title, future steps show nothing.
const STAGE_HELPER_TEXT = {
  Pending: "Hazard Report is waiting for verification.",
  Verified: "Hazard Report has been verified by moderators.",
  Resolved: "Hazard Report has been marked as resolved.",
  "Points Accumulated": "Reward points have been added to your account.",
  Rejected: "Hazard Report did not meet verification requirements.",
};

const REACHED_COLOR = "#0BA6DF";
const REJECTED_COLOR = "#BA1A1A";
const FUTURE_COLOR = "#9CA3AF";

/**
 * Renders a report's journey as a vertical stepper. Steps are derived from
 * `reportStatusPipeline` and whichever of those stages actually appear in
 * `report.statusHistory` — nothing here is a fixed 5-item list, so this
 * works whether a report has 1 stage or all of them.
 *
 * No figma reference yet for the Rejected visual state — this shows
 * Submitted -> Pending -> Rejected and stops (Verified/Resolved/Points
 * nodes don't render at all past a rejection). Flag if you get a figma
 * frame for this and it should look different.
 */
function ReportStatusTimeline({ report }) {
  if (!report) {
    return (
      <div
        className="bg-white rounded-2xl p-6 text-[13px] text-gray-400"
        style={{ width: "340px" }}
      >
        Select a report below to see its status timeline.
      </div>
    );
  }

  const history = report.statusHistory || [];
  const currentEntry = history[history.length - 1];
  const isRejected = currentEntry?.status === "Rejected";

  const steps = isRejected ? ["Submitted", "Pending", "Rejected"] : reportStatusPipeline;

  return (
    <div className="bg-white rounded-2xl p-6" style={{ width: "340px" }}>
      {steps.map((stepLabel, index) => {
        const entry = history.find((h) => h.status === stepLabel);
        const reached = Boolean(entry);
        const isCurrent = reached && entry === currentEntry;
        const isLastStep = index === steps.length - 1;
        const isRejectedNode = stepLabel === "Rejected";

        const color = !reached ? FUTURE_COLOR : isRejectedNode ? REJECTED_COLOR : REACHED_COLOR;

        return (
          <div key={stepLabel} className="flex gap-3">
            <div className="flex flex-col items-center">
              <span className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: color }} />
              {!isLastStep && (
                <span
                  className="w-[2px] flex-1 bg-gray-200"
                  style={{ minHeight: "28px" }}
                />
              )}
            </div>
            <div className={isLastStep ? "" : "pb-5"}>
              <p className="text-[14px] font-bold" style={{ color }}>
                {stepLabel}
              </p>
              {reached && <p className="text-[13px] text-gray-700 mt-0.5">{report.title}</p>}
              {isCurrent && STAGE_HELPER_TEXT[stepLabel] && (
                <p className="text-[12px] text-gray-400 mt-0.5">
                  {STAGE_HELPER_TEXT[stepLabel]}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default ReportStatusTimeline;