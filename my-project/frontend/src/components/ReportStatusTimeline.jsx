import { Check } from "lucide-react";
import { reportStatusPipeline } from "../utils/reportSelectors";

// Helper text shown only under the CURRENT (most recently reached) step.
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
 * Renders a report's journey as a vertical stepper.
 */
function ReportStatusTimeline({ report }) {
  if (!report) {
    return (
      <div className="bg-white rounded-2xl p-6 text-[13px] text-gray-400 w-full">
        Select a report below to see its status timeline.
      </div>
    );
  }

  const history = report.statusHistory || [];
  const currentEntry = history[history.length - 1];
  const isRejected = currentEntry?.status === "Rejected";

  const steps = isRejected
    ? ["Submitted", "Pending", "Rejected"]
    : reportStatusPipeline;

  return (
    <div className="bg-white rounded-2xl p-6 w-full">
      <h3 className="text-[15px] font-bold text-[#081435] mb-5">
        Report Status
      </h3>

      <div>
        {steps.map((stepLabel, index) => {
          const entry = history.find(
            (h) => h.status === stepLabel
          );

          const reached = Boolean(entry);
          const isCurrent =
            reached && entry === currentEntry;

          const isLastStep =
            index === steps.length - 1;

          const isRejectedNode =
            stepLabel === "Rejected";

          const color = !reached
            ? FUTURE_COLOR
            : isRejectedNode
            ? REJECTED_COLOR
            : REACHED_COLOR;

          return (
            <div
              key={stepLabel}
              className="flex gap-3"
            >
              {/* STEP INDICATOR */}
              <div className="flex flex-col items-center shrink-0">
                <div
                  className={`
                    flex
                    items-center
                    justify-center
                    rounded-full
                    shrink-0
                    transition-all
                    duration-200
                    ${
                      isCurrent
                        ? "h-5 w-5 ring-4 ring-[#0BA6DF]/10"
                        : "h-4 w-4"
                    }
                  `}
                  style={{
                    backgroundColor: color,
                  }}
                >
                  {reached && (
                    <Check
                      size={isCurrent ? 12 : 10}
                      strokeWidth={3}
                      className="text-white"
                    />
                  )}
                </div>

                {!isLastStep && (
                  <div
                    className="w-px flex-1 my-1"
                    style={{
                      minHeight: "34px",
                      backgroundColor:
                        reached && steps[index + 1]
                          ? "#B9E5F5"
                          : "#E5E7EB",
                    }}
                  />
                )}
              </div>

              {/* STEP CONTENT */}
              <div
                className={`
                  min-w-0
                  ${
                    isLastStep
                      ? "pb-0"
                      : "pb-6"
                  }
                `}
              >
                <div className="flex items-center gap-2">
                  <p
                    className={`
                      text-[14px]
                      ${
                        isCurrent
                          ? "font-bold"
                          : "font-semibold"
                      }
                    `}
                    style={{
                      color,
                    }}
                  >
                    {stepLabel}
                  </p>

                  {isCurrent && (
                    <span
                      className="
                        text-[10px]
                        font-semibold
                        px-2
                        py-0.5
                        rounded-full
                        bg-[#E8F7FD]
                        text-[#0BA6DF]
                      "
                    >
                      Current
                    </span>
                  )}
                </div>

                {reached && (
                  <p className="text-[12px] text-gray-600 mt-1 leading-relaxed">
                    {report.title}
                  </p>
                )}

                {isCurrent &&
                  STAGE_HELPER_TEXT[stepLabel] && (
                    <p className="text-[11px] text-gray-400 mt-1 leading-relaxed">
                      {STAGE_HELPER_TEXT[stepLabel]}
                    </p>
                  )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ReportStatusTimeline;

