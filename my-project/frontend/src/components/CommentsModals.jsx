import { useEffect, useRef, useState } from "react";
import { User, X } from "lucide-react";

function CommentsModal({ open, onClose, comments = [], onAddComment }) {
  const [draft, setDraft] = useState("");
  const [justAddedId, setJustAddedId] = useState(null);
  const inputRef = useRef(null);
  const listEndRef = useRef(null);

  // Escape-to-close + body scroll lock while the modal is open.
  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", handleKey);
    // Small delay so the pop-in animation isn't interrupted by an
    // immediate focus-triggered layout shift.
    const focusTimer = setTimeout(() => inputRef.current?.focus(), 150);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", handleKey);
      clearTimeout(focusTimer);
    };
  }, [open, onClose]);

  if (!open) return null;

  const handleSubmit = () => {
    const trimmed = draft.trim();
    if (!trimmed) return; // QA #3: no empty/whitespace-only comments
    const newComment = {
      id: `local-${Date.now()}`,
      name: "You",
      avatarUrl: null,
      message: trimmed,
      timeAgo: "Just now",
    };
    onAddComment?.(newComment);
    setJustAddedId(newComment.id);
    setDraft("");
    // Let the new item mount, then scroll it into view.
    requestAnimationFrame(() => listEndRef.current?.scrollIntoView({ behavior: "smooth" }));
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ backgroundColor: "rgba(0,0,0,0.45)", animation: "commentsBackdropFade 0.2s ease" }}
      onClick={(e) => {
        e.stopPropagation();
        onClose?.();
      }}
    >
      <style>{`
        @keyframes commentsBackdropFade {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
        @keyframes commentsPanelPop {
          0%   { opacity: 0; transform: scale(0.85) translateY(10px); }
          60%  { opacity: 1; transform: scale(1.02) translateY(0); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes commentItemPop {
          0%   { opacity: 0; transform: scale(0.92) translateY(8px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes commentBadgeBounce {
          0%   { transform: scale(1); }
          40%  { transform: scale(1.3); }
          100% { transform: scale(1); }
        }
        .comments-panel { animation: commentsPanelPop 0.35s cubic-bezier(0.34, 1.56, 0.64, 1); }
        .comment-item-enter { animation: commentItemPop 0.3s ease; }
        .comments-badge-bounce { animation: commentBadgeBounce 0.35s ease; display: inline-flex; }
      `}</style>

      <div
        className="comments-panel rounded-2xl flex flex-col"
        style={{
          backgroundColor: "#E4E4E4",
          width: "586px",
          maxWidth: "100%",
          maxHeight: "85vh",
          padding: "24px",
        }}
        onClick={(e) => e.stopPropagation()} // QA #1: keep clicks inside the panel from closing/bubbling
      >
        {/* Header */}
        <div className="flex items-center justify-between shrink-0 pb-4">
          <div className="flex items-center gap-2.5">
            <h2 className="font-krub font-bold text-2xl" style={{ color: "#1B4B72" }}>
              Comments
            </h2>
            <span
              key={comments.length}
              className="comments-badge-bounce items-center justify-center rounded-full font-inter font-semibold text-sm text-white"
              style={{ backgroundColor: "#2FA98C", minWidth: "28px", height: "28px", padding: "0 8px" }}
            >
              {comments.length}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 shrink-0"
            aria-label="Close comments"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable comment list — QA #5: fixed max-height, footer stays put */}
        <div className="flex flex-col gap-3 overflow-y-auto pr-1" style={{ maxHeight: "50vh" }}>
          {comments.length === 0 ? (
            <div className="bg-white rounded-xl p-6 text-center text-sm text-gray-400">
              No comments yet. Be the first to comment.
            </div>
          ) : (
            comments.map((c) => (
              <div
                key={c.id}
                className={c.id === justAddedId ? "comment-item-enter" : ""}
                style={{ backgroundColor: "#FFFFFF", borderRadius: "12px", padding: "16px" }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-[30px] h-[30px] rounded-full bg-gray-200 flex items-center justify-center shrink-0 overflow-hidden">
                      {c.avatarUrl ? (
                        <img src={c.avatarUrl} alt={c.name} className="w-full h-full object-cover" />
                      ) : (
                        <User size={15} className="text-gray-500" />
                      )}
                    </div>
                    <span className="font-inter font-semibold text-sm text-black">{c.name}</span>
                  </div>
                  <span className="font-inter text-xs shrink-0" style={{ color: "#A6A6A6" }}>
                    {c.timeAgo}
                  </span>
                </div>
                <p className="font-inter text-sm text-black mt-2">{c.message}</p>
              </div>
            ))
          )}
          <div ref={listEndRef} />
        </div>

        {/* Footer input row */}
        <div className="flex items-center gap-3 pt-4 shrink-0">
          <input
            ref={inputRef}
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Write a comment"
            className="flex-1 h-11 rounded-full bg-white px-4 text-sm outline-none border border-gray-300"
          />
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!draft.trim()}
            className="h-11 px-6 rounded-full text-white text-sm font-bold shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ backgroundColor: "#081435" }}
          >
            Comment
          </button>
        </div>
      </div>
    </div>
  );
}

export default CommentsModal;