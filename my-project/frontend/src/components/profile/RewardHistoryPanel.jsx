import { useMemo, useState } from "react";

const PAGE_SIZE = 5;

const FILTERS = [
  { key: "all", label: "All" },
  { key: "earned", label: "Earned" },
  { key: "redeemed", label: "Redeemed" },
  { key: "expired", label: "Expired" },
];

// Fallback so the panel still renders (and the "no default export" error
// stays fixed) even before it's wired up to real data. Once ProfilePage.jsx
// pulls history/balance from mockDashboardData.js, pass them in as props:
//   <RewardHistoryPanel history={rewardHistory} currentBalance={currentBalance} />
// Expected shape per entry:
//   { id, type: "earned" | "redeemed" | "expired", title, category,
//     severity: "LOW" | "MEDIUM" | "CRITICAL" | null, date: "YYYY-MM-DD", points }
const FALLBACK_HISTORY = [
  { id: 1024, type: "earned", title: "Report #1024 – Pothole", category: "Civic contribution", severity: "LOW", date: "2024-08-11", points: 10 },
  { id: 1018, type: "earned", title: "Report #1018 – Fallen tree", category: "Civic contribution", severity: "MEDIUM", date: "2024-08-09", points: 20 },
  { id: "redeem-1", type: "redeemed", title: "Redeemed ₱10 Mobile Load", category: "Reward Claim", severity: null, date: "2024-08-05", points: -100 },
  { id: 998, type: "earned", title: "Report #0998 – Flooding", category: "Civic contribution", severity: "CRITICAL", date: "2024-07-28", points: 35 },
  { id: "exp-1", type: "expired", title: "Points Expired (12-month limit)", category: "System adjustment", severity: null, date: "2024-07-02", points: -15 },
];

// ---- Pure helpers (unit-tested separately before wiring into the component) ----

function filterHistory(history, filterKey) {
  if (filterKey === "all") return history;
  return history.filter((entry) => entry.type === filterKey);
}

function sortHistoryByDate(history, direction) {
  return [...history].sort((a, b) => {
    const diff = new Date(a.date) - new Date(b.date);
    return direction === "desc" ? -diff : diff;
  });
}

function formatPoints(points) {
  return `${points > 0 ? "+" : ""}${points} pts`;
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
}

const SEVERITY_STYLES = {
  LOW: "bg-emerald-50 text-emerald-600 border border-emerald-200",
  MEDIUM: "bg-amber-50 text-amber-600 border border-amber-200",
  CRITICAL: "bg-rose-50 text-rose-600 border border-rose-200",
};

function EntryIcon({ entry }) {
  if (entry.type === "expired") {
    return (
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-400">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4.5 w-4.5">
          <circle cx="12" cy="12" r="9" />
          <path d="M5.5 5.5l13 13" />
        </svg>
      </span>
    );
  }
  if (entry.type === "redeemed") {
    return (
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sky-50 text-sky-600">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4.5 w-4.5">
          <rect x="3" y="8" width="18" height="13" rx="1.5" />
          <path d="M3 12h18M12 8v13M8.5 8a2.5 2.5 0 1 1 3.5-3.5c1 1 .5 3.5.5 3.5M15.5 8a2.5 2.5 0 1 0-3.5-3.5c-1 1-.5 3.5-.5 3.5" />
        </svg>
      </span>
    );
  }
  // earned (report) entries
  const isCritical = entry.severity === "CRITICAL";
  return (
    <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${isCritical ? "bg-rose-50 text-rose-500" : "bg-sky-50 text-sky-600"}`}>
      {isCritical ? (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4.5 w-4.5">
          <path d="M12 3 2 20h20L12 3Z" />
          <path d="M12 10v4M12 17h.01" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4.5 w-4.5">
          <path d="M9 12.5l2 2 4-4.5" />
          <circle cx="12" cy="12" r="9" />
        </svg>
      )}
    </span>
  );
}

export default function RewardHistoryPanel({ history = FALLBACK_HISTORY, currentBalance }) {
  const [filter, setFilter] = useState("all");
  const [sortDirection, setSortDirection] = useState("desc");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => filterHistory(history, filter), [history, filter]);
  const sorted = useMemo(() => sortHistoryByDate(filtered, sortDirection), [filtered, sortDirection]);

  const totalEntries = sorted.length;
  const totalPages = Math.max(1, Math.ceil(totalEntries / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * PAGE_SIZE;
  const pageItems = sorted.slice(start, start + PAGE_SIZE);

  const balance = currentBalance ?? history.reduce((sum, entry) => sum + entry.points, 0);

  function changeFilter(nextFilter) {
    setFilter(nextFilter);
    setPage(1); // reset pagination so a narrower filter never lands on a blank page
  }

  function toggleSort() {
    setSortDirection((prev) => (prev === "desc" ? "asc" : "desc"));
    setPage(1);
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-bold text-[#1B2A56]">Points History</h2>
        <span className="flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-4 py-1.5 text-sm">
          <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 text-amber-500">
            <path d="M12 2l2.9 6.3 6.9.7-5.2 4.6 1.6 6.8L12 16.9 5.8 20.4l1.6-6.8L2.2 9l6.9-.7L12 2Z" />
          </svg>
          <span className="text-gray-600">Current Balance:</span>
          <span className="font-bold text-[#1B2A56]">{balance}</span>
        </span>
      </div>
      <div className="mt-4 border-b border-gray-200" />

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {FILTERS.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => changeFilter(key)}
              className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
                filter === key
                  ? "border-sky-200 bg-sky-100 text-sky-700"
                  : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={toggleSort}
          className="flex items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-50"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
            <path d="M4 7h10M4 12h7M4 17h4" />
            <path d="M17 5v14M17 19l3-3M17 19l-3-3" />
          </svg>
          Sort by Date {sortDirection === "desc" ? "(Newest)" : "(Oldest)"}
        </button>
      </div>

      <div className="mt-4 divide-y divide-gray-100 overflow-hidden rounded-xl border border-gray-100">
        {pageItems.length === 0 ? (
          <div className="px-6 py-10 text-center text-sm text-gray-400">
            No {filter === "all" ? "" : filter} transactions to show yet.
          </div>
        ) : (
          pageItems.map((entry) => (
            <div key={entry.id} className="flex items-center gap-4 px-5 py-4">
              <EntryIcon entry={entry} />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold text-gray-800">{entry.title}</span>
                  {entry.severity && (
                    <span className={`rounded px-2 py-0.5 text-[11px] font-bold tracking-wide ${SEVERITY_STYLES[entry.severity]}`}>
                      {entry.severity}
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-xs text-gray-400">
                  {formatDate(entry.date)} • {entry.category}
                </p>
              </div>
              <span className={`shrink-0 text-lg font-bold ${entry.points > 0 ? "text-emerald-600" : "text-rose-500"}`}>
                {formatPoints(entry.points)}
              </span>
            </div>
          ))
        )}
      </div>

      <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
        <span>
          {totalEntries === 0
            ? "Showing 0 entries"
            : `Showing ${start + 1} to ${Math.min(start + PAGE_SIZE, totalEntries)} of ${totalEntries} entries`}
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={safePage <= 1}
            className="rounded-md border border-gray-200 px-2 py-1 text-gray-500 disabled:opacity-40"
            aria-label="Previous page"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4"><path d="M15 6l-6 6 6 6" /></svg>
          </button>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={safePage >= totalPages}
            className="rounded-md border border-gray-200 px-2 py-1 text-gray-500 disabled:opacity-40"
            aria-label="Next page"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4"><path d="M9 6l6 6-6 6" /></svg>
          </button>
        </div>
      </div>
    </div>
  );
}