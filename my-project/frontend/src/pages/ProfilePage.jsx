import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AuthNavbar from "../layouts/AuthNavbar";
import Footer from "../layouts/Footer";
import ProfileSidebar from "../components/profile/ProfileSidebar";
import PersonalInformationForm from "../components/profile/PersonalInformationForm";
import ChangePasswordForm from "../components/profile/ChangePasswordForm";
import RewardsPanel from "../components/profile/RewardsPanel";
import RewardHistoryPanel from "../components/profile/RewardHistoryPanel";
import LogoutConfirmModal from "../components/LogoutConfirmModal";
import { currentUser } from "../components/data/MockDashboardData";

const TABS = {
  personal: PersonalInformationForm,
  password: ChangePasswordForm,
  rewards: RewardsPanel,
  history: RewardHistoryPanel,
};

export default function ProfilePage() {
  const location = useLocation();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState(() => {
    const tab = new URLSearchParams(location.search).get("tab");

    return TABS[tab] ? tab : "personal";
  });

  const [user, setUser] = useState(currentUser);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  useEffect(() => {
    const tab = new URLSearchParams(location.search).get("tab");

    if (TABS[tab]) {
      setActiveTab(tab);
    } else {
      setActiveTab("personal");
    }
  }, [location.search]);

  const ActiveContent = TABS[activeTab];

  function handleSignOutRequest() {
    setIsLogoutModalOpen(true);
  }

  function handleSignOutConfirm() {
    setIsLogoutModalOpen(false);

    // TODO: clear real auth/session state once Laravel auth is wired in
    navigate("/signin");
  }

  return (
    <div className="min-h-screen bg-[#E7E4FB]">
      <AuthNavbar user={user} />

      <main className="mx-auto max-w-[1532px] px-6 py-10">
        <div className="flex flex-col gap-6 lg:flex-row">
          <ProfileSidebar
            user={user}
            activeTab={activeTab}
            onSelectTab={setActiveTab}
            onSignOut={handleSignOutRequest}
          />

          <section className="flex-1 rounded-2xl bg-white p-8 shadow-sm">
            <ActiveContent
              user={user}
              onUpdateUser={setUser}
            />
          </section>
        </div>
      </main>

      <Footer />

      {/* LOGOUT CONFIRMATION */}
      <LogoutConfirmModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleSignOutConfirm}
      />
    </div>
  );
}