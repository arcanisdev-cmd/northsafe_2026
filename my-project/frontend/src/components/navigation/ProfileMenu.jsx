import { useEffect, useRef, useState } from "react";
import {
  ChevronDown,
  History,
  Lock,
  LogOut,
  Star,
  Trophy,
  User,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { navigateWithTransition } from "../../utils/navigateWithTransition";

const PROFILE_EXIT_MS = 150;

export default function ProfileMenu({
  user,
  onLogoutRequest,
}) {
  const navigate = useNavigate();
  const profileMenuRef = useRef(null);

  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsMounted(true);
      return;
    }

    const timeout = setTimeout(() => {
      setIsMounted(false);
    }, PROFILE_EXIT_MS);

    return () => clearTimeout(timeout);
  }, [isOpen]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  function handleNavigation(path) {
    setIsOpen(false);
    navigateWithTransition(navigate, path);
  }

  function handleLogout() {
    setIsOpen(false);
    onLogoutRequest();
  }

  return (
    <div
      ref={profileMenuRef}
      className="relative pl-4 border-l border-gray-200"
    >
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-2 rounded-xl px-2 py-1.5 transition-colors duration-200 hover:bg-gray-50 active:scale-[0.97]"
        aria-expanded={isOpen}
        aria-haspopup="menu"
      >
        <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-gray-100">
          {user.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={user.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <User
              size={19}
              className="text-[#081435]"
            />
          )}
        </div>

        <ChevronDown
          size={16}
          className={`text-[#081435] transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isMounted && (
        <div
          role="menu"
          aria-hidden={!isOpen}
          className={`absolute right-0 top-[calc(100%+12px)] z-[10000] w-[300px] origin-top-right overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xl transition-all duration-150 ease-out motion-reduce:transition-none ${
            isOpen
              ? "translate-y-0 scale-100 opacity-100"
              : "pointer-events-none -translate-y-1 scale-95 opacity-0"
          }`}
        >
          <div className="bg-[#1B2A56] px-5 py-5 text-white">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border-2 border-white/30 bg-white/10">
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <User
                    size={22}
                    className="text-white/80"
                  />
                )}
              </div>

              <div>
                <p className="font-roboto font-bold text-base">
                  {user.name}
                </p>

                <p className="mt-0.5 flex items-center gap-1 text-xs font-semibold text-[#FFB256]">
                  <Star
                    size={12}
                    className="fill-[#FFB256]"
                  />
                  {user.points} POINTS
                </p>
              </div>
            </div>
          </div>

          <div className="py-2">
            <button
              type="button"
              onClick={() =>
                handleNavigation("/profile?tab=personal")
              }
              className="flex w-full items-center gap-3 px-5 py-3 text-left text-sm font-medium text-gray-700 transition-colors duration-150 hover:bg-gray-50"
            >
              <User
                size={18}
                className="text-[#1B2A56]"
              />
              Personal Information
            </button>

            <button
              type="button"
              onClick={() =>
                handleNavigation("/profile?tab=password")
              }
              className="flex w-full items-center gap-3 px-5 py-3 text-left text-sm font-medium text-gray-700 transition-colors duration-150 hover:bg-gray-50"
            >
              <Lock
                size={18}
                className="text-[#1B2A56]"
              />
              Change Password
            </button>

            <button
              type="button"
              onClick={() =>
                handleNavigation("/profile?tab=rewards")
              }
              className="flex w-full items-center gap-3 px-5 py-3 text-left text-sm font-medium text-gray-700 transition-colors duration-150 hover:bg-gray-50"
            >
              <Trophy
                size={18}
                className="text-[#FFB256]"
              />
              Rewards
            </button>

            <button
              type="button"
              onClick={() =>
                handleNavigation("/profile?tab=history")
              }
              className="flex w-full items-center gap-3 px-5 py-3 text-left text-sm font-medium text-gray-700 transition-colors duration-150 hover:bg-gray-50"
            >
              <History
                size={18}
                className="text-[#1B2A56]"
              />
              Reward History
            </button>
          </div>

          <div className="border-t border-gray-100 py-2">
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-3 px-5 py-3 text-left text-sm font-medium text-gray-700 transition-colors duration-150 hover:bg-gray-50"
            >
              <LogOut
                size={18}
                className="text-[#D30004]"
              />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}