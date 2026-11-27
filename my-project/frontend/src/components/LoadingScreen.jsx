import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import bg from "../assets/hero.png";
import logo from "../assets/logo.png";

/* ------------------------------------------------------------------ */
/* Standalone loading screen: visual + provider + hook in ONE file.    */
/*                                                                     */
/* Setup:  wrap <App /> in <LoadingProvider> (main.jsx).               */
/* Use:    const { withLoading } = useLoading();                       */
/*         await withLoading(fetchSomething(), "Loading reports…");    */
/* Routes: <Suspense fallback={<RouteFallback />}> for lazy pages.     */
/* ------------------------------------------------------------------ */

const DEFAULT_MESSAGE = "Loading…";
const SHOW_DELAY = 300; // don't show unless the wait lasts longer than this (ms)
const MIN_VISIBLE = 600; // once shown, stay at least this long (ms)

// Animations live here so index.css doesn't need to change.
const loadingCss = `
@keyframes loading-bar {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(260%); }
}
@keyframes loading-logo-pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.04); }
}
.animate-loading-bar { animation: loading-bar 1.2s ease-in-out infinite; }
.animate-loading-logo { animation: loading-logo-pulse 2s ease-in-out infinite; }
@media (prefers-reduced-motion: reduce) {
  .animate-loading-bar, .animate-loading-logo { animation: none; }
}
`;

const LoadingContext = createContext(null);

/* ---------- Visual ---------- */

function LoadingScreen({ visible, message = DEFAULT_MESSAGE }) {
  return (
    <>
      <style>{loadingCss}</style>

      {/* Screen-reader announcement; the overlay itself is decorative */}
      <div role="status" aria-live="polite" className="sr-only">
        {visible ? message : ""}
      </div>

      <div
        aria-hidden="true"
        className={
          "fixed inset-0 z-[100] flex items-center justify-center transition-[opacity,visibility] duration-300 motion-reduce:transition-none " +
          (visible
            ? "visible opacity-100"
            : "pointer-events-none invisible opacity-0")
        }
      >
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${bg})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-mint/90 to-white/90" />

        <div className="relative flex flex-col items-center gap-6 px-6">
          <img
            src={logo}
            alt=""
            className="animate-loading-logo h-[88px] w-auto object-contain sm:h-[104px]"
          />

          <div className="h-1.5 w-40 overflow-hidden rounded-full bg-navy/10">
            <div className="animate-loading-bar h-full w-2/5 rounded-full bg-teal" />
          </div>

          <p className="text-[15px] font-semibold text-navy">{message}</p>
        </div>
      </div>
    </>
  );
}

/* ---------- Provider ---------- */

export function LoadingProvider({ children }) {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState(DEFAULT_MESSAGE);

  const countRef = useRef(0); // tasks currently loading
  const showTimer = useRef(null);
  const hideTimer = useRef(null);
  const shownAt = useRef(0); // 0 = screen not currently shown

  const showLoading = useCallback((msg) => {
    countRef.current += 1;
    if (countRef.current > 1) {
      if (msg) setMessage(msg);
      return;
    }

    setMessage(msg || DEFAULT_MESSAGE);

    // Screen still up from a previous task: keep it, cancel the pending hide.
    if (hideTimer.current) {
      clearTimeout(hideTimer.current);
      hideTimer.current = null;
      return;
    }

    showTimer.current = setTimeout(() => {
      showTimer.current = null;
      shownAt.current = Date.now();
      setVisible(true);
    }, SHOW_DELAY);
  }, []);

  const hideLoading = useCallback(() => {
    if (countRef.current === 0) return;
    countRef.current -= 1;
    if (countRef.current > 0) return; // other tasks still running

    // Finished before the delay: the screen never appears.
    if (showTimer.current) {
      clearTimeout(showTimer.current);
      showTimer.current = null;
      return;
    }

    if (!shownAt.current) return;
    const remaining = Math.max(0, MIN_VISIBLE - (Date.now() - shownAt.current));
    hideTimer.current = setTimeout(() => {
      hideTimer.current = null;
      shownAt.current = 0;
      setVisible(false);
    }, remaining);
  }, []);

  // Wrap a promise (or a function returning one). Always releases the screen.
  const withLoading = useCallback(
    async (task, msg) => {
      showLoading(msg);
      try {
        return await (typeof task === "function" ? task() : task);
      } finally {
        hideLoading();
      }
    },
    [showLoading, hideLoading]
  );

  // Lock page scroll while the screen is up
  useEffect(() => {
    if (!visible) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [visible]);

  useEffect(() => {
    return () => {
      clearTimeout(showTimer.current);
      clearTimeout(hideTimer.current);
    };
  }, []);

  const value = useMemo(
    () => ({ showLoading, hideLoading, withLoading }),
    [showLoading, hideLoading, withLoading]
  );

  return (
    <LoadingContext.Provider value={value}>
      {children}
      <LoadingScreen visible={visible} message={message} />
    </LoadingContext.Provider>
  );
}

/* ---------- Hook ---------- */

export function useLoading() {
  const ctx = useContext(LoadingContext);
  if (!ctx) {
    throw new Error("useLoading must be used inside <LoadingProvider>");
  }
  return ctx;
}

/* ---------- Suspense fallback for lazy-loaded routes ---------- */

export function RouteFallback({ message }) {
  const { showLoading, hideLoading } = useLoading();

  useEffect(() => {
    showLoading(message);
    return () => hideLoading();
  }, [showLoading, hideLoading, message]);

  return null;
}