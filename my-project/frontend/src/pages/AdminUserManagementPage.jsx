import { useMemo, useState } from "react";
import {
  Search,
  ChevronDown,
  IdCard,
  Clock3,
  Wrench,
  MapPin,
  Phone,
  Star,
} from "lucide-react";
import AdminSidebar from "../layouts/AdminSidebar";
import AdminHeader from "../layouts/AdminHeader";

// ---------------------------------------------------------------------------
// Mock data — page-local.
// ---------------------------------------------------------------------------

const ROLE_STYLES = {
  USER: { text: "#2F6FD9", bg: "#E1EEFC", ring: "#2F6FD9" },
  EMPLOYEE: { text: "#B45309", bg: "#FDF3D9", ring: "#B45309" },
  ADMIN: { text: "#7C3AED", bg: "#EDE4FB", ring: "#7C3AED" },
};

const FIRST_NAMES = ["Jamaeca", "Jam", "Rey", "Josefine", "Bong", "Maria", "Jak", "Josephine", "Carlo", "Liza"];
const LAST_NAMES = ["Dagonio", "Valera", "Santos", "Cruz", "Roberto", "Bracken", "Reyes", "Fernandez"];
const BARANGAYS = [165, 167, 168, 171, 172, 176, 177, 178];

function makeUser(i) {
  const first = FIRST_NAMES[i % FIRST_NAMES.length];
  const last = LAST_NAMES[i % LAST_NAMES.length];
  const name = `${first} ${last}`;
  const role = i < 30 ? "USER" : i < 33 ? "EMPLOYEE" : "ADMIN";
  return {
    id: i + 1,
    name,
    email: `${first}${last}`.toLowerCase() + "@gmail.com",
    phone: `99${String(60000000 + i * 137).slice(0, 8)}`,
    barangay: BARANGAYS[i % BARANGAYS.length],
    points: 100 + ((i * 7) % 15) * 10,
    convertedPoints: 100,
    role,
    joinedSince: "August 12, 2026",
  };
}

const allUsers = Array.from({ length: 34 }, (_, i) => makeUser(i));

// ---------------------------------------------------------------------------
// Small local sub-components
// ---------------------------------------------------------------------------

function StatCard({ icon: Icon, iconColor, iconBg, label, value, valueColor }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-[#E5EEF9] bg-white px-5 py-5 shadow-sm">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl" style={{ backgroundColor: iconBg, color: iconColor }}>
        <Icon size={22} />
      </div>
      <div className="flex flex-1 items-center justify-between">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <p className="text-3xl font-bold" style={{ color: valueColor }}>{value}</p>
      </div>
    </div>
  );
}

function RolePill({ role }) {
  const cfg = ROLE_STYLES[role] ?? ROLE_STYLES.USER;
  return (
    <span className="inline-flex w-fit items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold" style={{ backgroundColor: cfg.bg, color: cfg.text }}>
      {role}
    </span>
  );
}

function FilterSelect({ placeholder, options }) {
  return (
    <div className="relative">
      <select className="appearance-none rounded-lg border border-[#E5EEF9] bg-white py-2.5 pl-3 pr-9 text-xs font-bold uppercase tracking-wide text-slate-600 outline-none focus:border-[#2F6FD9]">
        <option>{placeholder}</option>
        {options.map((opt) => (
          <option key={opt}>{opt}</option>
        ))}
      </select>
      <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
    </div>
  );
}

function UserRow({ user, isSelected, onSelect }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(user.id)}
      className={[
        "flex w-full items-center gap-4 border-b border-[#F1F5F9] px-4 py-4 text-left transition-colors last:border-b-0",
        isSelected ? "bg-[#EFF6FF]" : "bg-white hover:bg-slate-50",
      ].join(" ")}
    >
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-500 text-lg font-semibold text-white">
        {user.name.charAt(0)}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-bold text-[#0B1830]">{user.name}</p>
          <RolePill role={user.role} />
        </div>
        <p className="truncate text-xs text-slate-500">{user.email}</p>
        <p className="mt-0.5 flex items-center gap-3 text-xs text-slate-400">
          <span className="flex items-center gap-1"><MapPin size={11} />Barangay {user.barangay}</span>
          <span className="flex items-center gap-1"><Phone size={11} />{user.phone}</span>
        </p>
      </div>
      <p className="flex shrink-0 items-center gap-1 text-sm font-bold text-[#B45309]">
        <Star size={13} fill="#B45309" />
        {user.points} POINTS
      </p>
    </button>
  );
}

function UserDetailPanel({ user, pendingRole, onChangeRole, onSave }) {
  if (!user) {
    return (
      <div className="flex h-full min-h-[400px] items-center justify-center rounded-2xl border border-[#E5EEF9] bg-white p-8 text-center text-sm text-slate-500">
        Select a user from the list to view their details.
      </div>
    );
  }

  const roleCfg = ROLE_STYLES[pendingRole] ?? ROLE_STYLES.USER;

  return (
    <div className="overflow-hidden rounded-2xl border border-[#E5EEF9] shadow-sm">
      <div className="bg-[#0B1830] p-5 text-white">
        <RolePill role={user.role} />
        <div className="mt-3 flex flex-col items-center text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-500 text-2xl font-bold">
            {user.name.charAt(0)}
          </div>
          <p className="mt-2 text-base font-bold">{user.name}</p>
          <p className="text-xs text-slate-300">{user.email}</p>
        </div>
      </div>

      <div className="space-y-3 bg-white p-5">
        {[
          ["Phone", user.phone],
          ["Barangay", user.barangay],
          ["Joined Since", user.joinedSince],
        ].map(([label, value]) => (
          <div key={label} className="flex items-center justify-between border-b border-[#F1F5F9] pb-2 text-xs">
            <span className="font-semibold uppercase tracking-wide text-slate-400">{label}</span>
            <span className="font-bold text-[#0B1830]">{value}</span>
          </div>
        ))}
        <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-2 text-xs">
          <span className="font-semibold uppercase tracking-wide text-slate-400">Converted Points</span>
          <span className="flex items-center gap-1 font-bold text-[#B45309]"><Star size={11} fill="#B45309" />{user.convertedPoints} POINTS</span>
        </div>
        <div className="flex items-center justify-between pb-1 text-xs">
          <span className="font-semibold uppercase tracking-wide text-slate-400">Accumulated Points</span>
          <span className="flex items-center gap-1 font-bold text-[#B45309]"><Star size={11} fill="#B45309" />{user.points} POINTS</span>
        </div>

        <div className="pt-2">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Change Role</p>
          <div className="grid grid-cols-3 gap-2">
            {Object.keys(ROLE_STYLES).map((role) => {
              const cfg = ROLE_STYLES[role];
              const isActive = pendingRole === role;
              return (
                <button
                  key={role}
                  type="button"
                  onClick={() => onChangeRole(role)}
                  className="rounded-lg py-2 text-xs font-bold transition-all"
                  style={{
                    backgroundColor: isActive ? cfg.bg : "#F8FAFC",
                    color: isActive ? cfg.text : "#94A3B8",
                    border: `1.5px solid ${isActive ? cfg.ring : "#E5EEF9"}`,
                  }}
                >
                  {role}
                </button>
              );
            })}
          </div>
        </div>

        <button
          type="button"
          onClick={onSave}
          disabled={pendingRole === user.role}
          className="mt-3 w-full rounded-lg bg-[#0B1830] py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#16264A] disabled:cursor-not-allowed disabled:opacity-40"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function AdminUserManagementPage() {
  const [users, setUsers] = useState(allUsers);
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [pendingRole, setPendingRole] = useState(null);

  const counts = useMemo(
    () => ({
      user: users.filter((u) => u.role === "USER").length,
      employee: users.filter((u) => u.role === "EMPLOYEE").length,
      admin: users.filter((u) => u.role === "ADMIN").length,
    }),
    [users]
  );

  const filteredUsers = useMemo(() => {
    if (!search) return users;
    const q = search.toLowerCase();
    return users.filter((u) => `${u.name} ${u.email}`.toLowerCase().includes(q));
  }, [users, search]);

  const selectedUser = users.find((u) => u.id === selectedId) ?? null;

  const handleSelect = (id) => {
    setSelectedId(id);
    const u = users.find((x) => x.id === id);
    setPendingRole(u?.role ?? null);
  };

  const handleSave = () => {
    if (!selectedUser || pendingRole === selectedUser.role) return;
    setUsers((prev) => prev.map((u) => (u.id === selectedUser.id ? { ...u, role: pendingRole } : u)));
  };

  const handleLogout = () => {
    // TODO: wire up to LogoutConfirmModal.jsx.
    console.log("logout clicked");
  };

  return (
    <div className="flex min-h-screen bg-[#EAF2FB]">
      <AdminSidebar onLogout={handleLogout} />

      <div className="flex min-w-0 flex-1 flex-col">
        <AdminHeader title="User Management" subtitle="Manage user accounts and roles" />

        <main className="flex-1 p-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
                <StatCard icon={IdCard} iconColor="#2F6FD9" iconBg="#E1EEFC" label="Community Users" value={counts.user} valueColor="#2F6FD9" />
                <StatCard icon={Clock3} iconColor="#F5872E" iconBg="#FEF1E4" label="Employees" value={counts.employee} valueColor="#F5872E" />
                <StatCard icon={Wrench} iconColor="#7C3AED" iconBg="#EDE4FB" label="Admin" value={counts.admin} valueColor="#7C3AED" />
              </div>

              <div className="mb-4 flex flex-wrap gap-3">
                <div className="relative min-w-[220px] flex-1">
                  <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search name or email ..."
                    className="w-full rounded-lg border border-[#E5EEF9] bg-white py-2.5 pl-9 pr-3 text-sm text-slate-700 outline-none focus:border-[#2F6FD9]"
                  />
                </div>
                {/* TODO: wire these to actually filter the list */}
                <FilterSelect placeholder="User Role" options={["User", "Employee", "Admin"]} />
                <FilterSelect placeholder="Barangay" options={BARANGAYS.map((b) => `Barangay ${b}`)} />
                <FilterSelect placeholder="Date Joined" options={["Newest first", "Oldest first"]} />
              </div>

              {/* Scrollable user list — internal scroll so the panel + page
                  height stay fixed regardless of how many users exist. */}
              <div className="max-h-[600px] overflow-y-auto rounded-2xl border border-[#E5EEF9] bg-white shadow-sm">
                {filteredUsers.length === 0 ? (
                  <p className="p-8 text-center text-sm text-slate-500">No users match your search.</p>
                ) : (
                  filteredUsers.map((user) => (
                    <UserRow key={user.id} user={user} isSelected={user.id === selectedId} onSelect={handleSelect} />
                  ))
                )}
              </div>
            </div>

            <div className="lg:col-span-1">
              <UserDetailPanel user={selectedUser} pendingRole={pendingRole} onChangeRole={setPendingRole} onSave={handleSave} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
