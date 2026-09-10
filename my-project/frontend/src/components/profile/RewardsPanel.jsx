import { useState, useMemo } from "react";

/**
 * "My Rewards" panel — sits in the account sidebar next to
 * PersonalInformationForm / ChangePasswordForm and follows the same
 * conventions: no external UI kit, Tailwind utility classes, a local mock
 * "API call" with a TODO to swap in the real one once the backend is wired
 * in, and state pushed back up through `onUpdateUser`.
 *
 * Wiring notes for whoever connects the backend / mockDashboardData:
 * - REWARDS below is a placeholder catalog (₱10/₱20/₱50/₱100 mobile load
 *   tiers, matching the mock in the screenshot). Once mockDashboardData.js
 *   lands, swap this for whatever it exports (e.g. `rewardsCatalog`).
 * - `user.points` drives the current balance — rename if the real field
 *   differs (e.g. `user.rewardPoints`).
 * - `mockRedeemReward` simulates the redemption call. Replace with a real
 *   POST (e.g. POST /api/rewards/redeem) that deducts points server-side
 *   and returns a load code / confirmation.
 */

const REWARDS = [
  { id: "r10", pesos: 10, points: 100 },
  { id: "r20", pesos: 20, points: 180 },
  { id: "r50", pesos: 50, points: 400 },
  { id: "r100", pesos: 100, points: 750 },
];

const POINTS_EARNING_INFO = [
  "Submit a verified hazard report — +20 pts",
  "Report gets resolved by barangay/LGU — +50 pts",
  "Daily app check-in — +5 pts",
];

function pointsToPeso(points) {
  return Math.round((points / 10) * 100) / 100;
}

function canRedeem(reward, balance) {
  return balance >= reward.points;
}

function computeNextReward(balance, rewards = REWARDS) {
  const sorted = [...rewards].sort((a, b) => a.points - b.points);
  return sorted.find((r) => r.points > balance) ?? null;
}

function computeProgress(balance, nextReward) {
  if (!nextReward || nextReward.points <= 0) return 100;
  return Math.max(0, Math.min(100, (balance / nextReward.points) * 100));
}

// Mock async redeem — replace with a real API call once the backend is wired in.
function mockRedeemReward({ reward, balance }) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (!canRedeem(reward, balance)) {
        reject(new Error("Not enough points to redeem this reward."));
        return;
      }
      resolve({
        redeemedAt: new Date().toISOString(),
        newBalance: balance - reward.points,
        code: `LOAD-${reward.pesos}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
      });
    }, 900);
  });
}

function StarIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 text-amber-400">
      <path d="M10 1.5l2.59 5.25 5.79.84-4.19 4.08.99 5.77L10 14.9l-5.18 2.54.99-5.77L1.62 7.59l5.79-.84L10 1.5z" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 text-gray-400">
      <path
        fillRule="evenodd"
        d="M10 2a4 4 0 00-4 4v2H5a1 1 0 00-1 1v7a2 2 0 002 2h8a2 2 0 002-2V9a1 1 0 00-1-1h-1V6a4 4 0 00-4-4zm2 6V6a2 2 0 10-4 0v2h4z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function CheckBadge() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 text-emerald-500">
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.7-10.3a1 1 0 00-1.4-1.4L9 9.59 7.7 8.3a1 1 0 00-1.4 1.4l2 2a1 1 0 001.4 0l4-4z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function RewardTile({ reward, balance, busy, onRedeem }) {
  const unlocked = canRedeem(reward, balance);
  return (
    <div
      className={`flex flex-col justify-between rounded-lg border p-4 ${
        unlocked ? "border-emerald-100 bg-white" : "border-gray-100 bg-white"
      }`}
    >
      <div className="flex items-start justify-between">
        <span className={`text-xl font-bold ${unlocked ? "text-emerald-600" : "text-gray-300"}`}>
          ₱{reward.pesos}
        </span>
        {unlocked ? <CheckBadge /> : <LockIcon />}
      </div>
      <div className={`mt-1 flex items-center justify-between text-xs ${unlocked ? "text-gray-500" : "text-gray-300"}`}>
        <span>Mobile load</span>
        <span>{reward.points}pts needed</span>
      </div>
      <button
        type="button"
        disabled={!unlocked || busy}
        onClick={() => onRedeem(reward)}
        className={`mt-3 w-full rounded-md py-2 text-sm font-semibold transition-opacity disabled:opacity-60 ${
          unlocked
            ? "bg-teal-600 text-white hover:opacity-90"
            : "cursor-not-allowed bg-gray-200 text-gray-400"
        }`}
      >
        {unlocked ? (busy ? "Redeeming…" : "Redeem") : "Locked"}
      </button>
    </div>
  );
}

export default function MyRewardsPanel({ user, onUpdateUser }) {
  const balance = user?.points ?? 0;
  const [redeemingId, setRedeemingId] = useState(null);
  const [message, setMessage] = useState(null); // { type: "success" | "error", text }
  const [showEarningInfo, setShowEarningInfo] = useState(false);

  const nextReward = useMemo(() => computeNextReward(balance), [balance]);
  const progress = useMemo(() => computeProgress(balance, nextReward), [balance, nextReward]);
  const loadValue = useMemo(() => pointsToPeso(balance), [balance]);

  function handleRedeem(reward) {
    if (redeemingId) return;
    setMessage(null);
    setRedeemingId(reward.id);

    // TODO: replace with a real POST /api/rewards/redeem call once the backend is wired in
    mockRedeemReward({ reward, balance })
      .then(({ newBalance, code }) => {
        onUpdateUser?.((prev) => ({ ...prev, points: newBalance }));
        setMessage({ type: "success", text: `Redeemed ₱${reward.pesos} mobile load. Code: ${code}` });
        setRedeemingId(null);
      })
      .catch((err) => {
        setMessage({ type: "error", text: err.message || "Something went wrong. Please try again." });
        setRedeemingId(null);
      });
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-[#1B2A56]">My Rewards</h2>
      <div className="mt-4 border-b border-gray-200" />

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[260px_1fr]">
        <div className="flex flex-col gap-6">
          <div className="rounded-lg bg-indigo-50 p-5">
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <StarIcon />
              Current Balance
            </div>
            <p className="mt-3 text-3xl font-bold text-[#1B2A56]">{balance.toLocaleString()} pts</p>
            <p className="mt-1 text-xs text-gray-500">~₱{loadValue} in load value</p>
            <button
              type="button"
              onClick={() => setShowEarningInfo((v) => !v)}
              className="mt-4 text-xs font-semibold text-sky-600 hover:underline"
            >
              How points are earned?
            </button>
            {showEarningInfo && (
              <ul className="mt-3 flex flex-col gap-1.5 border-t border-indigo-100 pt-3">
                {POINTS_EARNING_INFO.map((line) => (
                  <li key={line} className="text-xs text-gray-600">
                    {line}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {nextReward ? (
            <div className="rounded-lg border border-gray-100 bg-white p-5">
              <p className="text-sm font-semibold text-[#1B2A56]">Next Reward = ₱{nextReward.pesos} Load</p>
              <p className="mt-1 text-xs text-gray-500">{nextReward.points - balance} points to go</p>
              <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-gray-100">
                <div className="h-full rounded-full bg-[#1B2A56]" style={{ width: `${progress}%` }} />
              </div>
              <div className="mt-1.5 flex justify-between text-[10px] text-gray-400">
                <span>0</span>
                <span>
                  {balance}/{nextReward.points} pts
                </span>
              </div>
            </div>
          ) : (
            <div className="rounded-lg border border-emerald-100 bg-emerald-50 p-5">
              <p className="text-sm font-semibold text-emerald-700">You've unlocked every reward tier!</p>
              <p className="mt-1 text-xs text-emerald-600">Keep redeeming as often as you like.</p>
            </div>
          )}
        </div>

        <div>
          <p className="text-sm font-semibold text-[#1B2A56]">Available Rewards</p>
          <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {REWARDS.map((reward) => (
              <RewardTile
                key={reward.id}
                reward={reward}
                balance={balance}
                busy={redeemingId === reward.id}
                onRedeem={handleRedeem}
              />
            ))}
          </div>
        </div>
      </div>

      {message && (
        <p
          className={`mt-6 text-sm font-medium ${
            message.type === "success" ? "text-emerald-600" : "text-red-500"
          }`}
        >
          {message.text}
        </p>
      )}
    </div>
  );
}