const steps = [
  { number: 1, title: "Photo Evidence", subtitle: "Upload a clear photo of the hazard" },
  { number: 2, title: "Hazard Details", subtitle: "Provide information about the hazard" },
  { number: 3, title: "Location", subtitle: "Where is the hazard located?" },
];

function StepProgressBar({ completedSteps = [] }) {
  return (
    <div className="flex items-center">
      {steps.map((step, i) => {
        const isComplete = completedSteps.includes(step.number);
        const isLast = i === steps.length - 1;

        return (
          <div key={step.number} className={`flex items-center ${isLast ? "" : "flex-1"}`}>
            <div className="flex items-start gap-3">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0 transition-colors duration-300"
                style={{
                  backgroundColor: isComplete ? "#081435" : "#848484",
                  color: "#FFFFFF",
                }}
              >
                {step.number}
              </div>
              <div>
                <p
                  className="font-inter font-bold text-sm transition-colors duration-300"
                  style={{ color: isComplete ? "#0D0B61" : "#848484" }}
                >
                  {step.title}
                </p>
                <p className="font-inter text-xs" style={{ color: "#848484" }}>
                  {step.subtitle}
                </p>
              </div>
            </div>

            {!isLast && (
              <div
                className="flex-1 h-[2px] mx-4 mt-4 transition-colors duration-300"
                style={{ backgroundColor: isComplete ? "#081435" : "#E5E5E5" }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default StepProgressBar;