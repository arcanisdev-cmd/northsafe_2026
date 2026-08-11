import { Star } from "lucide-react";

function RewardsCard({ totalPoints = 120, prepaidLoad = 10 }) {
  return (
    <div className="rounded-2xl bg-white p-6" style={{ border: "1px solid #E5E5E5" }}>
      <p className="font-inter font-semibold text-sm text-black">
        Earn rewards in every resolved hazard reports!
      </p>

      <div className="flex items-center justify-between mt-5">
        <div>
          <p className="font-inter text-xs text-gray-500">Total Points:</p>
          <div className="flex items-center gap-1.5 mt-1">
            <Star size={20} className="text-[#FFB256] fill-[#FFB256]" />
            <span className="font-inter font-bold text-2xl text-[#FFB256]">{totalPoints}</span>
            <span className="font-inter text-sm text-gray-500">pts</span>
          </div>
        </div>

        <div>
          <p className="font-inter text-xs text-gray-500">Prepaid load:</p>
          <span className="font-inter font-bold text-2xl text-[#042545] mt-1 block">
            {prepaidLoad}
          </span>
        </div>
      </div>
    </div>
  );
}

export default RewardsCard;