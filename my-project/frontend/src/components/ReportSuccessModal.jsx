import { CheckCircle2, PhoneCall } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { HOTLINES } from "./data/reportConfig";

function ReportSuccessModal({ isOpen, onReportAnother, reportId, status }) {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const hotline = HOTLINES.find((h) => h.number);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 animate-backdrop-in">
      <div
        className="bg-white rounded-2xl px-10 py-10 flex flex-col items-center text-center animate-modal-in"
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

        {reportId && (
          <div className="mt-5 rounded-lg px-4 py-3 w-full" style={{ backgroundColor: "#F1F5F9" }}>
            <p className="font-inter text-xs text-gray-600">Report ID</p>
            <p className="font-inter font-bold text-base" style={{ color: "#042545" }}>
              {reportId}
            </p>
            {status && <p className="font-inter text-xs text-gray-600 mt-1">Status: {status}</p>}
          </div>
        )}

        <ul className="font-inter text-xs text-gray-600 text-left mt-5 space-y-1.5 w-full list-disc pl-5">
          <li>Your photo and details are checked, then reviewed by barangay staff.</li>
          <li>You will be notified of every update on your report.</li>
          <li>Reward points stay pending until your report is verified.</li>
        </ul>

        {hotline && (
          <p className="font-inter text-xs text-gray-700 mt-4">
            In an emergency, call now:{" "}
            <a href={"tel:" + hotline.number} className="font-bold underline">{hotline.number}</a>
          </p>
        )}

        <div className="flex flex-col gap-3 w-full mt-6">
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