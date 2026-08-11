import HazardReportCard from "../components/HazardReportCard";
import TyphoonWarningCard from "../components/TyphoonWarningCard";
import MiniMapCard from "../components/MiniMapCard";
import RewardsCard from "../components/RewardsCard";
import WeatherWidget from "../components/WeatherWidget";

// Placeholder reports — swap for real API data later
const reports = [1, 2, 3, 4, 5];

function HazardFeed() {
  return (
    <section className="px-[157px] py-10">
      <div className="flex gap-8 items-start">
        {/* Main column — report feed */}
        <div className="flex flex-col gap-4" style={{ width: "718px" }}>
          {reports.map((id) => (
            <HazardReportCard key={id} />
          ))}
          <button type="button" className="font-inter text-sm text-[#0BA6DF] font-medium text-center mt-2">
            Load more...
          </button>
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-4 flex-1">
          <TyphoonWarningCard />
          <MiniMapCard />
          <RewardsCard />
          <WeatherWidget />
        </div>
      </div>
    </section>
  );
}

export default HazardFeed;