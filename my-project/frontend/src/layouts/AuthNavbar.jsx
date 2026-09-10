import {
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Link, useNavigate } from "react-router-dom";
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

function AuthNavbar() {
  const navigate = useNavigate();

  const [isNotificationsOpen, setIsNotificationsOpen] =
    useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] =
    useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [navHeight, setNavHeight] = useState(82);

  const notificationsButtonRef = useRef(null);
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