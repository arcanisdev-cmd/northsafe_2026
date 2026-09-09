import HazardReportCard from "../components/HazardReportCard";
import MiniMapCard from "../components/MiniMapCard";
import RewardsCard from "../components/RewardsCard";
import WeatherWidget from "../components/WeatherWidget";
import AlertLevelsCard from "../components/AlertLevelsCard";
import { hazardReports } from "../components/data/MockDashboardData";

function HazardFeed() {
  return (
    // px-[157px] -> px-[100px]: this was the source of the misalignment
    // you flagged — the hero and greeting bar both use 100px side padding,
    // so 157px here made this section's content start further right than
    // everything above it.
    <section style={{ backgroundColor: "#E8F4FF" }} className="px-[100px] py-10">
      <div className="flex gap-8 items-start">
        {/* Main column — report feed, now driven by real mock data instead
            of looping over placeholder ids with no props passed in. */}
        <div className="flex flex-col gap-4" style={{ width: "718px" }}>
          {hazardReports.map((report) => (
            <HazardReportCard key={report.id} {...report} />
          ))}
          <button type="button" className="font-inter text-sm text-[#0BA6DF] font-medium text-center mt-2">
            Load more...
          </button>
        </div>

        {/* Sidebar — TyphoonWarningCard removed (that content now lives in
            DashboardHero). Final figma order: Weather -> Map ->
            Alert Levels -> Rewards. */}
        <div className="flex flex-col gap-4 flex-1">
          <WeatherWidget />
          <MiniMapCard />
          <AlertLevelsCard />
          <RewardsCard />
        </div>
      </div>
    </section>
  );
}

export default HazardFeed;