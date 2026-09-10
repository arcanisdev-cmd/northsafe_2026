import {
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Link, useNavigate } from "react-router-dom";
import { useRef, useState, useMemo, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Star, User } from "lucide-react";
import logo from "../assets/logo.png";
import NotificationsDropdown from "../components/NotificationsDropdown";
import LogoutConfirmModal from "../components/LogoutConfirmModal";
import AuthNavLinks from "../components/navigation/AuthNavLinks";
import ProfileMenu from "../components/navigation/ProfileMenu";
import {
  currentUser,
  notifications as allNotifications,
} from "../components/data/MockDashboardData";
import {
  getMyNotifications,
  getUnreadCount,
} from "../utils/notificationSelectors";

function clearStoredAuth() {
  localStorage.removeItem("northsafe_token");
  localStorage.removeItem("northsafe_user");
  sessionStorage.removeItem("northsafe_token");
  sessionStorage.removeItem("northsafe_user");
}

function AuthNavbar() {
  const navigate = useNavigate();

  const [isNotificationsOpen, setIsNotificationsOpen] =
    useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] =
    useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [navHeight, setNavHeight] = useState(82);

  const notificationsButtonRef = useRef(null);

  const isProtectedPath = ["/dashboard", "/hazard-map", "/my-reports"].includes(location.pathname);

  // Owned here (not inside the dropdown) so the unread badge below and the
  // dropdown's own counts/list always agree — same pattern as
  // currentUser.points being read from one place everywhere it's shown.
  const [notifications, setNotifications] = useState(() =>
    getMyNotifications(allNotifications, currentUser.id)
  );
  const unreadCount = useMemo(() => getUnreadCount(notifications), [notifications]);

  const handleMarkRead = (id) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  useEffect(() => {
    const token = localStorage.getItem("northsafe_token") ?? sessionStorage.getItem("northsafe_token");

    if (!token) {
      if (isProtectedPath) {
        navigate("/signin", { replace: true });
      }

      return;
    }

    const apiBaseUrl = import.meta.env.VITE_API_URL ?? "";
    const controller = new AbortController();

    fetch(`${apiBaseUrl}/api/me`, {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      signal: controller.signal,
    })
      .then((response) => response.json().then((data) => ({ response, data })))
      .then(({ response, data }) => {
        if (response.status === 401) {
          clearStoredAuth();
          setAuthUser(null);
          if (isProtectedPath) {
            navigate("/signin", { replace: true });
          }
          return;
        }

        if (!response.ok || !data?.user) {
          return;
        }

        setAuthUser(data.user);

        if (localStorage.getItem("northsafe_token")) {
          localStorage.setItem("northsafe_user", JSON.stringify(data.user));
        } else {
          sessionStorage.setItem("northsafe_user", JSON.stringify(data.user));
        }
      })
      .catch(() => {
        // Keep the stored profile if the backend is temporarily unavailable.
      });

    return () => controller.abort();
  }, [isProtectedPath, location.pathname, navigate]);
  const navRef = useRef(null);

  useLayoutEffect(() => {
    function measure() {
      if (navRef.current) {
        setNavHeight(
          navRef.current.getBoundingClientRect().height
        );
      }
    }

    measure();

    window.addEventListener("resize", measure);

    return () => {
      window.removeEventListener("resize", measure);
    };
  }, []);

  useLayoutEffect(() => {
    function handleScroll() {
      setIsScrolled(window.scrollY > 4);
    }

    handleScroll();

    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    return () =>
      window.removeEventListener("scroll", handleScroll);
  }, []);

  const [notifications, setNotifications] = useState(() =>
    getMyNotifications(
      allNotifications,
      currentUser.id
    )
  );

  const unreadCount = useMemo(
    () => getUnreadCount(notifications),
    [notifications]
  );

  function handleMarkRead(id) {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id
          ? { ...notification, read: true }
          : notification
      )
    );
  }

  function handleMarkAllRead() {
    setNotifications((prev) =>
      prev.map((notification) => ({
        ...notification,
        read: true,
      }))
    );
  }

  function handleLogoutRequest() {
    setIsNotificationsOpen(false);
    setIsLogoutModalOpen(true);
  }

  function handleLogoutConfirm() {
    setIsLogoutModalOpen(false);
    navigate("/signin");
  }
  const points = authUser?.rewardPoints ?? authUser?.points ?? 0;

  return (
    <>
      <nav
        ref={navRef}
        className={`fixed left-0 top-0 z-[9999] w-full border-b bg-white transition-shadow duration-300 [view-transition-name:navigation] ${
          isScrolled
            ? "border-transparent shadow-[0_4px_16px_rgba(8,20,53,0.08)]"
            : "border-gray-100 shadow-none"
        }`}
      >
        <div className="mx-auto max-w-[1532px]">
          <div className="flex h-[82px] items-center justify-between px-4 sm:px-6 md:px-12 lg:px-[100px]">
            <Link
              to="/dashboard"
              className="transition-transform duration-200 active:scale-[0.98]"
            >
              <img
                src={logo}
                alt="NorthSafe logo"
                className="h-[64px] w-auto"
              />
            </Link>

            <div className="hidden items-center gap-8 md:flex">
              <AuthNavLinks
                unreadCount={unreadCount}
                isNotificationsOpen={isNotificationsOpen}
                onNotificationsClick={() =>
                  setIsNotificationsOpen((prev) => !prev)
                }
                notificationsButtonRef={
                  notificationsButtonRef
                }
              />

              <ProfileMenu
                user={currentUser}
                onLogoutRequest={handleLogoutRequest}
              />
            </div>
          </div>
        </div>

        <NotificationsDropdown
          isOpen={isNotificationsOpen}
          onClose={() =>
            setIsNotificationsOpen(false)
          }
          anchorRef={notificationsButtonRef}
          notifications={notifications}
          onMarkRead={handleMarkRead}
          onMarkAllRead={handleMarkAllRead}
        />
      </nav>

      <div style={{ height: `${navHeight}px` }} />

      <LogoutConfirmModal
        isOpen={isLogoutModalOpen}
        onClose={() =>
          setIsLogoutModalOpen(false)
        }
        onConfirm={handleLogoutConfirm}
      />
    </>
  );
}

export default AuthNavbar;