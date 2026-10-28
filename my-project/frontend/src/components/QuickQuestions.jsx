import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

const NAVY = "#042545";
const INDIGO = "#0D0B61";

const css = `
@keyframes nsFade { from { opacity: 0 } to { opacity: 1 } }
@keyframes nsRise { from { opacity: 0; transform: translateY(14px) scale(.98) } to { opacity: 1; transform: none } }
.ns-fade { animation: nsFade .18s ease-out }
.ns-rise { animation: nsRise .22s ease-out }
@media (prefers-reduced-motion: reduce) { .ns-fade, .ns-rise { animation: none } }
`;

function QuickQuestionsModal({ isOpen, onClose, questions, answers, onChange }) {
  const dialogRef = useRef(null);
  const closeRef = useRef(onClose);

  useEffect(() => {
    closeRef.current = onClose;
  }, [onClose]);

  // Runs only when the modal opens or closes, so it never steals focus while answering
  useEffect(() => {
    if (!isOpen) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") closeRef.current();
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);
    if (dialogRef.current) dialogRef.current.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [isOpen]);

  if (!isOpen || typeof document === "undefined") return null;

  const list = questions || [];
  const total = list.length;
  const answered = list.filter((q) => answers[q.id]).length;
  const allAnswered = total > 0 && answered === total;
  const percent = total ? Math.round((answered / total) * 100) : 0;

  return createPortal(
    <div
      className="ns-fade"
      onClick={onClose}
      style={{
        position: "fixed",
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        backgroundColor: "rgba(4, 37, 69, 0.55)",
      }}
    >
      <style>{css}</style>

      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="quick-questions-title"
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        className="ns-rise font-inter"
        style={{
          width: "100%",
          maxWidth: 460,
          backgroundColor: "#FFFFFF",
          borderRadius: 16,
          overflow: "hidden",
          outline: "none",
          boxShadow: "0 24px 60px rgba(4, 37, 69, 0.35)",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 12,
            padding: "20px 24px 16px",
          }}
        >
          <div>
            <h2
              id="quick-questions-title"
              style={{ margin: 0, fontSize: 18, fontWeight: 700, color: INDIGO }}
            >
              Quick questions
            </h2>
            <p style={{ margin: "4px 0 0", fontSize: 12, color: "#4B5563" }}>
              {answered} of {total} answered
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            style={{
              flexShrink: 0,
              width: 32,
              height: 32,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 999,
              border: "none",
              background: "#F3F4F6",
              color: "#4B5563",
              cursor: "pointer",
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Progress */}
        <div style={{ height: 4, backgroundColor: "#E5E7EB" }}>
          <div
            style={{
              height: "100%",
              width: percent + "%",
              backgroundColor: "#00BAFF",
              transition: "width .25s ease",
            }}
          />
        </div>

        {/* Questions: plain block, scrolls if the screen is short */}
        <div
          style={{
            display: "block",
            padding: "20px 24px",
            maxHeight: "calc(90vh - 200px)",
            overflowY: "auto",
          }}
        >
          {list.map((q, index) => {
            const done = Boolean(answers[q.id]);
            return (
              <div key={q.id} style={{ marginTop: index === 0 ? 0 : 22 }}>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "#000000" }}>
                  <span style={{ color: done ? "#00BAFF" : "#9CA3AF", marginRight: 8 }}>
                    {index + 1}.
                  </span>
                  {q.label}
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 10 }}>
                  {(q.options || []).map((option) => {
                    const active = answers[q.id] === option;
                    return (
                      <button
                        key={option}
                        type="button"
                        aria-pressed={active}
                        onClick={() => onChange(q.id, option)}
                        style={{
                          padding: "8px 16px",
                          fontSize: 14,
                          borderRadius: 999,
                          cursor: "pointer",
                          border: "1px solid " + (active ? NAVY : "#BCBCBC"),
                          backgroundColor: active ? NAVY : "#FFFFFF",
                          color: active ? "#FFFFFF" : "#000000",
                        }}
                      >
                        {option}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div style={{ padding: "16px 24px 20px", borderTop: "1px solid #E5E7EB" }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              width: "100%",
              height: 44,
              border: "none",
              borderRadius: 10,
              color: "#FFFFFF",
              fontWeight: 700,
              fontSize: 14,
              cursor: "pointer",
              backgroundColor: allAnswered ? NAVY : "#6B7280",
            }}
          >
            {allAnswered ? "DONE" : "ANSWER LATER"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default QuickQuestionsModal;