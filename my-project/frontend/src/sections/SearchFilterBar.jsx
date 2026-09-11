import { SlidersHorizontal, Search } from "lucide-react";
import { currentUser } from "../components/data/MockDashboardData";

function SearchFilterBar() {
  const firstName = currentUser.name.split(" ")[0];

  return (
    <section
      className="flex w-full flex-col gap-4 px-5 py-4 sm:px-8 md:px-12 lg:h-[69px] lg:flex-row lg:items-center lg:justify-between lg:gap-6 lg:px-[100px] lg:py-0"
      style={{ backgroundColor: "#479F9C" }}
    >
      <p className="min-w-0 text-center lg:text-left">
        <span className="block font-inter text-[26px] font-extrabold leading-[30px] text-white lg:inline lg:text-[20px] lg:font-extrabold lg:leading-[20px]">
          Good morning, {firstName}!
        </span>

        <span className="mt-2 block font-inter text-[15px] font-medium leading-5 text-white lg:ml-2 lg:mt-0 lg:inline lg:text-[16px]">
          Stay updated with hazards happening around your community.
        </span>
      </p>

      <div className="flex w-full shrink-0 items-center gap-[15px] lg:w-auto">
        <div className="group flex h-10 min-w-0 flex-1 items-center gap-3 rounded-[20px] bg-white px-5 shadow-sm transition-all duration-200 ease-out focus-within:shadow-[0_0_0_3px_rgba(255,255,255,0.25),0_4px_12px_rgba(8,20,53,0.12)] sm:px-5 lg:w-[511px] lg:flex-none">
          <Search
            size={18}
            className="shrink-0 text-[#626262] transition-all duration-200 ease-out group-focus-within:scale-110 group-focus-within:text-[#479F9C]"
          />

          <input
            type="text"
            placeholder="Search hazard reports or locations ..."
            aria-label="Search hazard reports or locations"
            className="min-w-0 flex-1 bg-transparent text-sm text-[#4E4E4E] outline-none placeholder:text-[#888888]"
          />
        </div>

        <button
          type="button"
          className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-[8px] bg-white transition-all duration-150 hover:bg-gray-100 hover:shadow-sm active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#479F9C]"
          aria-label="More filters"
        >
          <SlidersHorizontal
            size={18}
            className="text-[#292828]"
          />
        </button>
      </div>
    </section>
  );
}

export default SearchFilterBar;