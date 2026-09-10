import { Star } from "lucide-react";

function RewardsCard({ points = 0, prepaidLoad = 0 }) {

  return (
    // Switched from a fixed 569.6px width to w-full (matching the sidebar
    // column) — the fixed width plus a line-height of only 20px on 50px
    // font-size text was cramping/misaligning the big numbers. line-height
    // is now "normal" so the digits render at their natural height instead
    // of being squeezed into a box far shorter than the font itself.
    <div
      className="w-full bg-white"
      style={{
        borderRadius: "15px",
        border: "1px solid #E5E5E5",
        paddingTop: "45px",
        paddingRight: "25px",
        paddingBottom: "50px",
        paddingLeft: "25px",
      }}
    >
      <p
        style={{
          fontFamily: "Inter, sans-serif",
          fontWeight: 600,
          fontSize: "14px",
          lineHeight: "20px",
          color: "#042545",
        }}
      >
        Earn rewards in every resolved hazard reports!
      </p>

      <div className="flex items-center justify-between mt-6">
        <div>
          <p
            style={{ fontFamily: "Inter, sans-serif", fontWeight: 500, fontSize: "14px", lineHeight: "20px", color: "#727272" }}
          >
            Total Points:
          </p>
          {/* Star icon retained from the original component; points value
              kept in the established #FFB256 gold color since the new
              spec only gave size/weight/line-height, not a color override. */}
          <div className="flex items-center gap-1.5 mt-2">
            <Star size={22} className="text-[#FFB256] fill-[#FFB256]" />
            <span
              style={{ fontFamily: "Inter, sans-serif", fontWeight: 900, fontSize: "50px", lineHeight: "normal", color: "#FFB256" }}
            >
              {points}
            </span>
            <span
              style={{ fontFamily: "Inter, sans-serif", fontWeight: 900, fontSize: "25px", lineHeight: "normal", color: "#FFB256" }}
            >
              pts
            </span>
          </div>
        </div>

        <div>
          <p
            style={{ fontFamily: "Inter, sans-serif", fontWeight: 500, fontSize: "14px", lineHeight: "20px", color: "#727272" }}
          >
            Prepaid load:
          </p>
          {/* ₱ symbol restored to match the original figma reference
              (visible in the very first dashboard screenshot as "₱10"). */}
          <span
            className="mt-2 block"
            style={{ fontFamily: "Inter, sans-serif", fontWeight: 900, fontSize: "50px", lineHeight: "normal", color: "#042545" }}
          >
            ₱{prepaidLoad}
          </span>
        </div>
      </div>
    </div>
  );
}

export default RewardsCard;