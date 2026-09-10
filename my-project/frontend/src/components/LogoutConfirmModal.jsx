import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { LogOut } from "lucide-react";

// Animation timings — enter a touch slower than exit, matching the
// Radix Dialog / Headless UI Transition convention.
const ENTER_MS = 200;
const EXIT_MS = 150;

const styles = {
  overlay: {
    position: "fixed",
    inset: 0,
    zIndex: 20000,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "0 16px",
    transition: `background-color ${ENTER_MS}ms ease-out`,
  },
  overlayClosed: {
    transitionDuration: `${EXIT_MS}ms`,
    transitionTimingFunction: "ease-in",
  },
  card: {
    width: "100%",
    maxWidth: 460,
    overflow: "hidden",
    borderRadius: 32,
    background: "#ffffff",
    boxShadow: "0 25px 50px -12px rgba(0,0,0,0.35)",
    transition: `transform ${ENTER_MS}ms ease-out, opacity ${ENTER_MS}ms ease-out`,
  },
  cardClosed: {
    transitionDuration: `${EXIT_MS}ms`,
    transitionTimingFunction: "ease-in",
  },
  cardInner: {
    padding: "56px 48px 48px",
    textAlign: "center",
  },
  iconWrap: {
    display: "flex",
    justifyContent: "center",
  },
  iconBox: {
    display: "flex",
    height: 76,
    width: 76,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    margin: 0,
    marginTop: 32,
    fontSize: 20,
    fontWeight: 700,
    lineHeight: "28px",
    color: "#003B73",
    fontFamily: "inherit",
  },
  buttonRow: {
    marginTop: 40,
    display: "flex",
    gap: 12,
  },
  buttonBase: {
    height: 52,
    flex: 1,
    borderRadius: 8,
    border: "none",
    padding: "0 20px",
    fontSize: 14,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.02em",
    color: "#ffffff",
    cursor: "pointer",
    transition: "background-color 150ms, transform 150ms",
  },
  backButton: {
    background: "#A8BFCE",
  },
  logoutButton: {
    background: "#0BA6DF",
  },
};

export default function LogoutConfirmModal({ isOpen, onClose, onConfirm }) {
  const cancelButtonRef = useRef(null);
  const [shouldRender, setShouldRender] = useState(isOpen);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      return;
    }
    const timeout = setTimeout(() => setShouldRender(false), EXIT_MS);
    return () => clearTimeout(timeout);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(event) {
      if (event.key === "Escape") onClose();
    }

    document.addEventListener("keydown", handleKeyDown);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    requestAnimationFrame(() => {
      cancelButtonRef.current?.focus();
    });

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen, onClose]);

  if (!shouldRender) return null;

  return createPortal(
    <div
      style={{
        ...styles.overlay,
        ...(!isOpen ? styles.overlayClosed : null),
        backgroundColor: isOpen ? "rgba(0,0,0,0.6)" : "rgba(0,0,0,0)",
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="logout-confirm-title"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        style={{
          ...styles.card,
          ...(!isOpen ? styles.cardClosed : null),
          opacity: isOpen ? 1 : 0,
          transform: isOpen
            ? "translateY(0) scale(1)"
            : "translateY(8px) scale(0.96)",
        }}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div style={styles.cardInner}>
          <div style={styles.iconWrap}>
            <div style={styles.iconBox}>
              <LogOut size={56} strokeWidth={2} color="#344B82" />
            </div>
          </div>

          <h2 id="logout-confirm-title" style={styles.title}>
            Are you sure you want to log out?
          </h2>

          <div style={styles.buttonRow}>
            <button
              ref={cancelButtonRef}
              type="button"
              onClick={onClose}
              style={{ ...styles.buttonBase, ...styles.backButton }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#93AFBF")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#A8BFCE")}
            >
              Back
            </button>

            <button
              type="button"
              onClick={onConfirm}
              style={{ ...styles.buttonBase, ...styles.logoutButton }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#0998CE")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#0BA6DF")}
            >
              Log Out
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}