const steps = ["Report Submitted", "Pending", "Verified", "Resolved", "Points Accumulated"];

const stepMeta = {
  "Report Submitted": { title: "Report Submitted", subtitle: null },
};

function ReportStatusTimeline({ report }) {
  const currentIndex = steps.indexOf(report.status);

  return (
    <div
      className="bg-white rounded-2xl p-6"
      style={{ width: "314px", height: "606px", border: "2px solid #E5E5E5" }}
    >
      <div className="flex flex-col">
        {steps.map((step, i) => {
          const isDone = i < currentIndex;
          const isActive = i === currentIndex;
          const isUpcoming = i > currentIndex;
          const dotColor = isDone || isActive ? "#0BA6DF" : "#8C8C8C";

          return (
            <div key={step} className="flex gap-4">
              {/* Dot + connecting line */}
              <div className="flex flex-col items-center">
                <span
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: dotColor }}
                />
                {i < steps.length - 1 && (
                  <span
                    className="w-[2px] flex-1"
                    style={{ backgroundColor: isDone ? "#46B5FF" : "#828282", minHeight: "60px" }}
                  />
                )}
              </div>

              {/* Text */}
              <div className="pb-6">
                <p
                  className="font-inter font-bold text-sm"
                  style={{ color: isActive ? "#0BA6DF" : isUpcoming ? "#828282" : "#262626" }}
                >
                  {step}
                </p>

                {(isActive || isDone) && (
                  <>
                    <p className="font-inter text-xs mt-1" style={{ color: "#4A4A4A" }}>
                      {report.title}
                    </p>
                    {isActive && step === "Report Submitted" && (
                      <p className="font-inter text-xs mt-1" style={{ color: "#8C8C8C" }}>
                        {report.dateTime}
                      </p>
                    )}
                    {isActive && step === "Pending" && (
                      <p className="font-inter text-xs mt-1" style={{ color: "#8C8C8C" }}>
                        Hazard Report is waiting for verification.
                      </p>
                    )}
                  </>
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