import {
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useEffect,
} from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
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

function normalizeNavbarUser(user) {
  if (!user) {
    return null;
  }

  return {
    ...user,
    name: user.name ?? user.fullName ?? "NorthSafe User",
    points: user.points ?? user.rewardPoints ?? 0,
    avatarUrl: user.avatarUrl ?? user.profilePicture ?? null,
  };
}

function AuthNavbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const [isNotificationsOpen, setIsNotificationsOpen] =
    useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] =
    useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [navHeight, setNavHeight] = useState(82);
  const [authUser, setAuthUser] = useState(() => {
    const storedUser =
      localStorage.getItem("northsafe_user") ??
      sessionStorage.getItem("northsafe_user");

    if (!storedUser) {
      return currentUser;
    }

    try {
      return normalizeNavbarUser(JSON.parse(storedUser)) ?? currentUser;
    } catch {
      return currentUser;
    }
  });

  const notificationsButtonRef = useRef(null);

  const isProtectedPath = ["/dashboard", "/hazard-map", "/my-reports"].includes(location.pathname);

  // Owned here (not inside the dropdown) so the unread badge below and the
  // dropdown's own counts/list always agree — same pattern as
  // currentUser.points being read from one place everywhere it's shown.
  const [notifications, setNotifications] = useState(() =>
    getMyNotifications(allNotifications, currentUser.id)
  );
  const unreadCount = useMemo(() => getUnreadCount(notifications), [notifications]);



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

        const navbarUser = normalizeNavbarUser(data.user);
        setAuthUser(navbarUser);

        if (localStorage.getItem("northsafe_token")) {
          localStorage.setItem("northsafe_user", JSON.stringify(navbarUser));
        } else {
          sessionStorage.setItem("northsafe_user", JSON.stringify(navbarUser));
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
    const token = localStorage.getItem("northsafe_token") ?? sessionStorage.getItem("northsafe_token");
    const apiBaseUrl = import.meta.env.VITE_API_URL ?? "";

    const finishLogout = () => {
      clearStoredAuth();
      navigate("/signin", { replace: true });
    };

    if (!token) {
      finishLogout();
      return;
    }

    fetch(`${apiBaseUrl}/api/logout`, {
      method: "POST",
      headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
    }).finally(finishLogout);
  }

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
                user={authUser}
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