import { CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

function ReportSuccessModal({ isOpen, onReportAnother }) {
  const navigate = useNavigate();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 animate-backdrop-in">
      <div
        className="bg-white rounded-2xl px-10 py-12 flex flex-col items-center text-center animate-modal-in"
        style={{ width: "480px" }}
      >
        <CheckCircle2
          size={72}
          className="text-[#22C55E] animate-check-pop"
          strokeWidth={1.5}
        />

        <h2 className="font-inter font-bold text-2xl mt-5" style={{ color: "#042545" }}>
          Report Submitted Successfully
        </h2>

        <p className="font-inter text-base text-gray-700 mt-3">
          Your report has been submitted and ready for verification
        </p>

        <div className="flex flex-col gap-3 w-full mt-8">
          <button
            type="button"
            onClick={() => navigate("/my-reports")}
            className="w-full h-12 rounded-lg font-inter font-bold text-sm text-white transition-transform active:scale-[0.97]"
            style={{ backgroundColor: "#042545" }}
          >
            View My Reports
          </button>

          <button
            type="button"
            onClick={onReportAnother}
            className="w-full h-12 rounded-lg font-inter font-bold text-sm transition-transform active:scale-[0.97]"
            style={{ border: "1px solid #042545", color: "#042545" }}
          >
            Report Another Hazard
          </button>
        </div>
      </div>
    </div>
  );
}

export default ReportSuccessModal;  