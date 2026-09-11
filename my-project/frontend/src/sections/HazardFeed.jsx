import HazardReportCard from "../components/HazardReportCard";
import MiniMapCard from "../components/MiniMapCard";
import RewardsCard from "../components/RewardsCard";
import WeatherWidget from "../components/WeatherWidget";
import AlertLevelsCard from "../components/AlertLevelsCard";
import { hazardReports } from "../components/data/MockDashboardData";

function HazardFeed() {
  return (
    <section className="w-full bg-[#E8F4FF] px-5 py-6 sm:px-8 md:px-12 lg:px-[100px] lg:py-10">
      <div className="mx-auto max-w-[1532px]">

        {/* Mobile dashboard information */}
        <div className="flex flex-col gap-4 lg:hidden">
          <MiniMapCard />
          <WeatherWidget />
          <AlertLevelsCard />
          <RewardsCard />
        </div>

        {/* Mobile hazard feed */}
        <div className="mt-8 flex flex-col gap-4 lg:hidden">
          <div>
            <h2 className="font-inter text-xl font-extrabold text-[#081435]">
              Recent Hazards
            </h2>

            <p className="mt-1 font-inter text-sm text-[#626262]">
              Reports from your community
            </p>
          </div>

          {hazardReports.map((report) => (
            <HazardReportCard
              key={report.id}
              {...report}
            />
          ))}

          <button
            type="button"
            className="mt-2 py-2 text-center font-inter text-sm font-medium text-[#0BA6DF] transition-colors duration-150 hover:text-[#0789BD] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0BA6DF] focus-visible:ring-offset-2"
          >
            Load more...
          </button>
        </div>

        {/* Desktop layout */}
        <div className="hidden lg:flex lg:items-start lg:gap-8">
          <div className="flex w-[718px] shrink-0 flex-col gap-4">
            {hazardReports.map((report) => (
              <HazardReportCard
                key={report.id}
                {...report}
              />
            ))}

            <button
              type="button"
              className="mt-2 text-center font-inter text-sm font-medium text-[#0BA6DF] transition-colors duration-150 hover:text-[#0789BD] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0BA6DF] focus-visible:ring-offset-2"
            >
              Load more...
            </button>
          </div>

          <div className="flex min-w-0 flex-1 flex-col gap-4">
            <WeatherWidget />
            <MiniMapCard />
            <AlertLevelsCard />
            <RewardsCard />
          </div>
        </div>

      </div>
    </section>
  );
}

export default HazardFeed;