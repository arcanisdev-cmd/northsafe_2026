import { SlidersHorizontal, Search } from "lucide-react";
import { currentUser } from "../components/data/MockDashboardData";

function SearchFilterBar() {
  const firstName = currentUser.name.split(" ")[0];

  return (
    // Whole band: solid teal #479F9C (was an incorrect lavender before),
    // fixed height 69px, 100px side padding matching the hero's convention.
    // The greeting block and search+sort sit side-by-side in one row —
    // stacking them as two separate rows wouldn't fit in 69px total height.
    <section
      className="flex items-center justify-between"
      style={{ backgroundColor: "#479F9C", height: "69px", paddingLeft: "100px", paddingRight: "100px" }}
    >
      {/* Greeting — two tightly-stacked lines, both white per spec (the
          previous dark navy colors would've been invisible on this teal
          background). Pulling first name from the shared mock user data
          instead of a hardcoded default prop. */}
      {/* Single line — greeting and subtext run together with just a
          space between them, not stacked as two separate lines. */}
      <p className="whitespace-nowrap">
        <span
          className="text-white"
          style={{ fontFamily: "Inter, sans-serif", fontWeight: 800, fontSize: "20px", lineHeight: "20px" }}
        >
          Good morning, {firstName}!
        </span>{" "}
        <span
          className="text-white ml-2"
          style={{ fontFamily: "Inter, sans-serif", fontWeight: 500, fontSize: "16px", lineHeight: "20px" }}
        >
          Stay updated with hazards happening around your community.
        </span>
      </p>

      {/* Search bar (511x40, radius 20) + sort button, 15px gap between
          them (526 - 511 = 15, per spec). Animation on the search bar is
          intentionally on hold per your note. */}
      <div className="flex items-center gap-[15px] shrink-0">
        <div
          className="flex items-center gap-3 bg-white px-5"
          style={{ width: "511px", height: "40px", borderRadius: "20px" }}
        >
          <Search size={18} style={{ color: "#626262" }} className="shrink-0" />
          <input
            type="text"
            placeholder="Search hazard reports or locations ..."
            className="flex-1 text-sm bg-transparent outline-none min-w-0"
            style={{ color: "#4E4E4E" }}
          />
        </div>

        {/* 30x30 per spec — SlidersHorizontal sized to sit comfortably
            inside that box. */}
        <button
          type="button"
          className="flex items-center justify-center bg-white shrink-0"
          style={{ width: "30px", height: "30px", borderRadius: "8px" }}
          aria-label="More filters"
        >
          <SlidersHorizontal size={18} style={{ color: "#292828" }} />
        </button>
      </div>
    </section>
  );
}

export default SearchFilterBar;