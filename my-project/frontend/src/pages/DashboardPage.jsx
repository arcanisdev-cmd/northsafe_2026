import AuthNavbar from "../layouts/AuthNavbar";
import DashboardHero from "../sections/DashboardHero";
import SearchFilterBar from "../sections/SearchFilterBar";
import HazardFeed from "../sections/HazardFeed";
import Footer from "../layouts/Footer";

function DashboardPage() {
  return (
    <div className="overflow-x-hidden">
      <div className="max-w-[1532px] mx-auto">
        <AuthNavbar />
        <DashboardHero />
        <SearchFilterBar />
        <HazardFeed />
        <Footer />
      </div>
    </div>
  );
}

export default DashboardPage;