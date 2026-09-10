import { User, Lock, Trophy, History, LogOut } from "lucide-react";

const NAV_ITEMS = [
  { key: "personal", label: "Personal Information", icon: User },
  { key: "password", label: "Change Password", icon: Lock },
  { key: "rewards", label: "Rewards", icon: Trophy },
  { key: "history", label: "Reward History", icon: History },
];

function AvatarFallback() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-full w-full p-4 text-white/70">
      <path d="M12 12c2.7 0 4.9-2.2 4.9-4.9S14.7 2.2 12 2.2 7.1 4.4 7.1 7.1 9.3 12 12 12Zm0 2.2c-3.3 0-9.8 1.6-9.8 4.9v2.7h19.6v-2.7c0-3.3-6.5-4.9-9.8-4.9Z" />
    </svg>
  );
}

export default function ProfileSidebar({ user, activeTab, onSelectTab, onSignOut }) {
  const stats = [
    { label: "Verified", value: user?.verifiedCount ?? 0 },
    { label: "Resolved", value: user?.resolvedCount ?? 0 },
    { label: "Rejected", value: user?.rejectedCount ?? 0 },
  ];

  return (
    <aside className="w-full shrink-0 overflow-hidden rounded-2xl bg-white shadow-sm lg:w-[352px]">
      <div className="bg-[#1B2A56] px-6 pb-6 pt-8 text-center text-white">
        <div className="mx-auto mb-4 h-24 w-24 overflow-hidden rounded-full border-4 border-white/30 bg-white/10">
          {user?.profilePicture ? (
            <img src={user.profilePicture} alt={user.fullName} className="h-full w-full object-cover" />
          ) : (
            <AvatarFallback />
          )}
        </div>
        <p className="text-lg font-semibold">{user?.fullName ?? "—"}</p>
        <p className="mt-1 text-sm text-white/70">{user?.email ?? "—"}</p>
        <p className="mt-2 text-xs text-white/60">Member since {user?.memberSince ?? "—"}</p>
      </div>

      <div className="grid grid-cols-3 divide-x divide-gray-200 border-b border-gray-200 py-4 text-center">
        {stats.map((s) => (
          <div key={s.label}>
            <p className="text-xl font-bold text-[#1B2A56]">{s.value}</p>
            <p className="text-[11px] uppercase tracking-wide text-gray-400">{s.label}</p>
          </div>
        ))}
      </div>

      <nav className="py-2">
        {NAV_ITEMS.map(({ key, label, icon: Icon }) => {
          const active = activeTab === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => onSelectTab(key)}
              aria-current={active ? "page" : undefined}
              className={`flex w-full items-center gap-3 px-6 py-3 text-left text-sm font-medium transition-colors ${
                active ? "bg-gray-100 text-[#1B2A56]" : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <Icon size={18} />
              {label}
            </button>
          );
        })}
        <button
          type="button"
          onClick={onSignOut}
          className="flex w-full items-center gap-3 px-6 py-3 text-left text-sm font-medium text-gray-600 hover:bg-gray-50"
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </nav>
    </aside>
  );
}