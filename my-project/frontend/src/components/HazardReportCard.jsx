import { useState } from "react";
import { User, ImageIcon, MapPin, ArrowUp, ArrowDown, MessageCircle, CheckCircle2 } from "lucide-react";
import CommentsModal from "./CommentsModals";

// Fixed width per variant, matching the figma spec exactly — all three
// share the same right edge, and the text is simply centered inside
// (not a fixed padding value): e.g. RED (88-66)/2 = 11, matching the
// spec's x=11 exactly. Same logic confirmed for BLUE and WHITE below.
const ALERT_PILL_STYLES = {
  red: { width: "88px", backgroundColor: "#FFC4C4", color: "#BA1A1A", label: "RED ALERT" },
  blue: { width: "88px", backgroundColor: "#D4D3FF", color: "#1E1391", label: "BLUE ALERT" },
  // "white" is the alert-level name, not a literal white fill — a truly
  // white pill would be invisible on the white card, so this uses a
  // neutral gray fill with white text per spec.
  white: { width: "100px", backgroundColor: "#A9A9A9", color: "#FFFFFF", label: "WHITE ALERT" },
};

function AlertPill({ level }) {
  const style = ALERT_PILL_STYLES[level];
  if (!style) return null;

  return (
    <span
      className="flex items-center justify-center rounded-full shrink-0"
      style={{
        width: style.width,
        height: "25px",
        backgroundColor: style.backgroundColor,
      }}
    >
      <span
        style={{
          fontFamily: "Inter, sans-serif",
          fontWeight: 600,
          fontSize: "12px",
          lineHeight: "20px",
          color: style.color,
        }}
      >
        {style.label}
      </span>
    </span>
  );
}

// 8 particles arranged in a ring around the button icon. Each carries its
// own --tx/--ty (the point it flies to) so one shared CSS animation can
// drive all of them — only the end coordinates differ per particle.
const BURST_PARTICLES = Array.from({ length: 8 }, (_, i) => {
  const angle = (i / 8) * Math.PI * 2;
  const distance = 20;
  return {
    id: i,
    tx: Math.cos(angle) * distance,
    ty: Math.sin(angle) * distance,
  };
});

// key changes on every click, forcing React to remount the burst (and
// therefore replay the CSS animation) even if the user clicks repeatedly.
function VoteBurst({ burstKey, color }) {
  if (!burstKey) return null;
  return (
    <span key={burstKey} className="vote-burst" aria-hidden="true">
      {BURST_PARTICLES.map((p) => (
        <span
          key={p.id}
          className="vote-particle"
          style={{
            "--tx": `${p.tx}px`,
            "--ty": `${p.ty}px`,
            backgroundColor: color,
          }}
        />
      ))}
    </span>
  );
}

function HazardReportCard({
  reporterName = "Jam Dagonio",
  timeAgo = "3 hrs ago",
  alertLevel = "red",
  hazardType = "Flood",
  title = "Large Pothole on Main Road Causing Traffic Delays",
  description = "Dangerous pothole discovered near the road intersection.",
  address = "Beside Barangay 167 Llano road in kamagong street",
  dateTime = "06/15/2026 11:26PM",
  verified = true,
  upvotes = 12,
  downvotes = 12,
  // `comments` (a plain number) is kept as a fallback for call sites that
  // haven't been updated to pass real comment data yet. Once commentsList
  // is provided, the displayed count is ALWAYS commentsList.length instead
  // — see displayedCommentCount below — so the badge can never go stale.
  comments = 12,
  commentsList = [],
  imageSrc,
  compact = false,
  width = "718px",
  buttonColor = "#46B5FF",
  onClick,
  // New — optional, defaults to no-op, so every existing call site
  // (Home feed, etc.) is completely unaffected. Only MyReportsPage passes
  // this for now, to make "VIEW HAZARD MAP" actually navigate somewhere.
  onViewHazardMap,
}) {
  // Local vote state — optimistic UI only, doesn't call an API. If you're
  // wiring this to a backend, swap these setters for your mutation and
  // still keep the burst-trigger counters for the animation.
  const [upvoted, setUpvoted] = useState(false);
  const [downvoted, setDownvoted] = useState(false);
  const [localUpvotes, setLocalUpvotes] = useState(upvotes);
  const [localDownvotes, setLocalDownvotes] = useState(downvotes);
  const [upvoteBurst, setUpvoteBurst] = useState(0);
  const [downvoteBurst, setDownvoteBurst] = useState(0);

  // Local comments state — seeded from the commentsList prop, then owned
  // here so new comments append instantly (optimistic UI, same pattern as
  // the vote counts above).
  const [localComments, setLocalComments] = useState(commentsList);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [commentPopBurst, setCommentPopBurst] = useState(0);

  // QA #4: this is the ONLY place the comment count is computed — both the
  // card's pill and the modal's badge read from the same array length, so
  // they can't drift apart. Falls back to the `comments` prop only for
  // legacy call sites that never passed commentsList at all.
  const displayedCommentCount =
    commentsList.length > 0 || localComments.length > 0 ? localComments.length : comments;

  const handleUpvote = (e) => {
    e.stopPropagation();
    if (upvoted) {
      setUpvoted(false);
      setLocalUpvotes((c) => c - 1);
      return; // no burst on un-voting, matches the reference animation
    }
    setUpvoted(true);
    setLocalUpvotes((c) => c + 1);
    if (downvoted) {
      setDownvoted(false);
      setLocalDownvotes((c) => c - 1);
    }
    setUpvoteBurst((k) => k + 1);
  };

  const handleDownvote = (e) => {
    e.stopPropagation();
    if (downvoted) {
      setDownvoted(false);
      setLocalDownvotes((c) => c - 1);
      return;
    }
    setDownvoted(true);
    setLocalDownvotes((c) => c + 1);
    if (upvoted) {
      setUpvoted(false);
      setLocalUpvotes((c) => c - 1);
    }
    setDownvoteBurst((k) => k + 1);
  };

  // QA #1: stopPropagation so opening comments never also fires the card's
  // own onClick (report selection) — same guard used for the vote buttons
  // and the "VIEW HAZARD MAP" button below.
  const handleOpenComments = (e) => {
    e.stopPropagation();
    setCommentPopBurst((k) => k + 1);
    setCommentsOpen(true);
  };

  const handleAddComment = (newComment) => {
    setLocalComments((prev) => [...prev, newComment]);
  };

  if (compact) {
    return (
      <div
        onClick={onClick}
        className="flex gap-2 rounded-lg overflow-hidden cursor-pointer"
        style={{ width: "251px", height: "102px" }}
      >
        <div className="w-[70px] h-full bg-gray-100 rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
          {imageSrc ? (
            <img src={imageSrc} alt={title} className="w-full h-full object-cover" />
          ) : (
            <ImageIcon size={20} className="text-gray-300" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <span className="font-inter text-[10px] text-gray-400">{timeAgo}</span>
            <AlertPill level={alertLevel} />
          </div>
          <p className="font-inter font-semibold text-xs text-black leading-tight mt-0.5 line-clamp-2">
            {title}
          </p>
          <p className="font-inter text-[10px] text-gray-500 mt-1 line-clamp-1">
            {description}
          </p>
          <div className="flex items-center gap-1 mt-1">
            <span
              className="px-2 py-0.5 rounded-full font-inter text-[9px] font-medium"
              style={{ backgroundColor: "#FFE4D1", color: "#FF6F47" }}
            >
              {hazardType}
            </span>
            {verified && (
              <span className="font-inter text-[9px] font-medium" style={{ color: "#22C55E" }}>
                ✓ Verified
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className="rounded-2xl bg-white p-6 cursor-pointer"
      style={{ width, border: "0.25px solid #979797" }}
    >
      {/* Scoped keyframes for the vote-button and comment-button
          animations. Kept local to this component (rather than a global
          stylesheet) so the file is fully self-contained. */}
      <style>{`
        @keyframes voteIconPop {
          0%   { transform: scale(1); }
          35%  { transform: scale(1.35) rotate(-6deg); }
          60%  { transform: scale(0.92); }
          100% { transform: scale(1); }
        }
        @keyframes voteCountBounce {
          0%   { transform: translateY(0); opacity: 1; }
          30%  { transform: translateY(-6px); opacity: 1; }
          60%  { transform: translateY(1px); }
          100% { transform: translateY(0); }
        }
        @keyframes voteParticle {
          0%   { transform: translate(0, 0) scale(1); opacity: 1; }
          70%  { opacity: 1; }
          100% { transform: translate(var(--tx), var(--ty)) scale(0); opacity: 0; }
        }
        .vote-icon-pop { animation: voteIconPop 0.4s ease; }
        .vote-count-bounce { animation: voteCountBounce 0.35s ease; display: inline-block; }
        .vote-burst {
          position: absolute;
          top: 50%;
          left: 18px;
          width: 0;
          height: 0;
          pointer-events: none;
        }
        .vote-particle {
          position: absolute;
          top: 0;
          left: 0;
          width: 5px;
          height: 5px;
          border-radius: 9999px;
          animation: voteParticle 0.6s ease-out forwards;
        }
        .comment-icon-pop { animation: voteIconPop 0.4s ease; }
      `}</style>

      {/* Top row: avatar, name, time, and the new red/blue/white alert
          pill — replaces the old dot+text "CRITICAL" status entirely. */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-[30px] h-[30px] rounded-full bg-gray-100 flex items-center justify-center">
            <User size={16} className="text-gray-500" />
          </div>
          <span className="font-inter font-semibold text-sm text-black">{reporterName}</span>
          <span className="font-inter text-xs" style={{ color: "#A6A6A6", lineHeight: "20px" }}>
            {timeAgo}
          </span>
        </div>

        <AlertPill level={alertLevel} />
      </div>

      {/* Image + content */}
      <div className="flex gap-5 mt-4">
        {/* Image */}
        <div className="w-[247px] h-[220px] rounded-xl bg-gray-100 flex items-center justify-center shrink-0 overflow-hidden">
          {imageSrc ? (
            <img src={imageSrc} alt={title} className="w-full h-full object-cover" />
          ) : (
            <ImageIcon size={32} className="text-gray-300" />
          )}
        </div>

        {/* Text content */}
        <div className="flex-1 flex flex-col">
          <h3 className="font-inter font-semibold text-base text-black leading-tight">
            {title}
          </h3>

          <p className="font-inter text-sm text-black mt-2">{description}</p>

          <div className="flex items-center gap-1.5 mt-3" style={{ color: "#4A4A4A" }}>
            <MapPin size={14} className="shrink-0" />
            <span className="font-inter text-xs">{address}</span>
          </div>

          <div className="flex items-center gap-1.5 mt-1.5" style={{ color: "#A6A6A6" }}>
            <span className="font-inter text-xs">{dateTime}</span>
          </div>

          {/* Tags */}
          <div className="flex flex-col gap-1.5 mt-3">
            <span
              className="inline-flex items-center gap-1.5 w-fit px-3 py-1 rounded-full font-inter text-xs font-medium"
              style={{ backgroundColor: "#FFE4D1", color: "#FF6F47" }}
            >
              {hazardType}
            </span>

            {verified && (
              <span
                className="inline-flex items-center gap-1.5 w-fit font-inter text-xs font-medium"
                style={{ color: "#22C55E" }}
              >
                <CheckCircle2 size={14} />
                Verified
              </span>
            )}
          </div>

          {/* Action row */}
          <div className="flex items-center gap-2 mt-3">
            <button
              type="button"
              onClick={handleUpvote}
              className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors duration-200"
              style={{
                backgroundColor: upvoted ? "#DCFCE7" : "#D1D5DB",
                color: upvoted ? "#16A34A" : "#FFFFFF",
              }}
            >
              <ArrowUp key={`up-icon-${upvoteBurst}`} size={14} className={upvoteBurst ? "vote-icon-pop" : ""} />
              <span key={`up-count-${upvoteBurst}`} className="vote-count-bounce">
                {localUpvotes}
              </span>
              <VoteBurst burstKey={upvoteBurst} color="#22C55E" />
            </button>

            <button
              type="button"
              onClick={handleDownvote}
              className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors duration-200"
              style={{
                backgroundColor: downvoted ? "#FEE2E2" : "#D1D5DB",
                color: downvoted ? "#DC2626" : "#FFFFFF",
              }}
            >
              <ArrowDown key={`down-icon-${downvoteBurst}`} size={14} className={downvoteBurst ? "vote-icon-pop" : ""} />
              <span key={`down-count-${downvoteBurst}`} className="vote-count-bounce">
                {localDownvotes}
              </span>
              <VoteBurst burstKey={downvoteBurst} color="#EF4444" />
            </button>

            <button
              type="button"
              onClick={handleOpenComments}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-300 text-white text-sm font-medium"
            >
              <MessageCircle
                key={`comment-icon-${commentPopBurst}`}
                size={14}
                className={commentPopBurst ? "comment-icon-pop" : ""}
              />
              <span key={`comment-count-${commentPopBurst}`} className="vote-count-bounce">
                {displayedCommentCount}
              </span>
            </button>
            <button
              type="button"
              onClick={(e) => {
                // Stop the click from also bubbling up to the card's own
                // onClick (e.g. selecting the report in MyReportsPage).
                e.stopPropagation();
                onViewHazardMap?.();
              }}
              className="ml-auto px-5 py-1.5 rounded-full text-white text-sm font-bold"
              style={{ backgroundColor: buttonColor }}
            >
              VIEW HAZARD MAP
            </button>
          </div>
        </div>
      </div>

      {/* Comments popup — pops open on top of everything, matches the
          upvote/downvote pop-in style. Rendered at the card level (not
          inline in the action row) so its fixed overlay positions relative
          to the viewport, not the card. */}
      <CommentsModal
        open={commentsOpen}
        onClose={() => setCommentsOpen(false)}
        comments={localComments}
        onAddComment={handleAddComment}
      />
    </div>
  );
}

export default HazardReportCard;