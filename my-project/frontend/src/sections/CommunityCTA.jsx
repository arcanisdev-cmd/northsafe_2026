import { Link } from "react-router-dom";

function CommunityCTA() {
  return (
    <section className="px-[100px] pt-0 pb-[60px]">
      <div
        className="rounded-2xl flex items-center justify-between gap-8"
        style={{ backgroundColor: "#A8DBFF", padding: "40px 60px" }}
      >
        <div>
          <h3
            className="font-inter font-bold"
            style={{ fontSize: "33.16px", color: "#2F3A72", maxWidth: "825px" }}
          >
            Ready to Make Your Community Safer?
          </h3>

          <p
            className="font-krub font-medium mt-3"
            style={{ fontSize: "16.58px", lineHeight: "24.9px", color: "#383838", maxWidth: "834px" }}
          >
            Join hundreds of residents already using NORTHSAFE to report and resolve hazards.
            Together, we can build a safer North Caloocan. Takes less than 2 minutes. Your information is kept private.
          </p>
        </div>

        <Link
          to="/signup"
          className="shrink-0 px-8 py-3 rounded-full font-inter font-bold text-sm text-white whitespace-nowrap"
          style={{ backgroundColor: "#042545" }}
        >
          Create an Account
        </Link>
      </div>
    </section>
  );
}

export default CommunityCTA;