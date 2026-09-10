import { useNavigate } from "react-router-dom";
import HazardReportCard from "../components/HazardReportCard";
import MiniMapCard from "../components/MiniMapCard";
import RewardsCard from "../components/RewardsCard";
import WeatherWidget from "../components/WeatherWidget";
import AlertLevelsCard from "../components/AlertLevelsCard";

function HazardFeed({ reports = [], user = null, weather = null }) {
  const navigate = useNavigate();

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
          {reports.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center text-gray-400 text-sm">
              No reports available yet.
            </div>
          ) : (
            reports.map((report) => (
              <HazardReportCard
                key={report.id}
                {...report}
                onViewHazardMap={() =>
                  navigate("/hazard-map", { state: { focusReportId: report.id } })
                }
              />
            ))
          )}
          <button type="button" className="font-inter text-sm text-[#0BA6DF] font-medium text-center mt-2">
            Load more...
          </button>
        </div>

        {/* Sidebar — TyphoonWarningCard removed (that content now lives in
            DashboardHero). Final figma order: Weather -> Map ->
            Alert Levels -> Rewards. */}
        <div className="flex flex-col gap-4 flex-1">
          <WeatherWidget weather={weather} />
          <MiniMapCard />
          <AlertLevelsCard />
          <RewardsCard
            points={user?.rewardPoints ?? 0}
            prepaidLoad={user?.prepaidLoad ?? 0}
          />
        </div>
      </div>
    </section>
  );
}

export default HazardFeed;