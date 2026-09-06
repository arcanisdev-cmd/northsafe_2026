import { AlertTriangle, MapPin, Compass, Camera, Phone } from "lucide-react";
import ndrrmcBg from "../assets/ndrrmc.png";
import caloocanLogo from "../assets/caloocan-logo.png";
import { typhoonAlert, hotlines } from "../components/data/MockDashboardData";

function TyphoonWarningCard({ alert }) {
  return (
    // Fixed 638x325 per spec, corner radius 15. Horizontal padding is
    // exactly 50px each side (confirmed: message width 538 = 638 - 2*50,
    // and the date block's right edge at x=431+107=538 lines up with that
    // same content width — so header and message share one padded box).
    <div
      className="rounded-[15px] flex flex-col px-[50px] pt-6 pb-[45px] shrink-0"
      style={{
        width: "638px",
        height: "325px",
        // Reddish top fading to a black shade at the bottom, per feedback.
        background: "linear-gradient(180deg, #C40000 0%, #000000 100%)",
        border: "1px solid rgba(255,255,255,0.15)",
      }}
    >
      {/* justify-between reproduces the exact figma x-positions without
          needing absolute coordinates: icon+title flush left (icon 32px +
          gap-2 8px = 40px, matching the title's x=40), date flush right at
          the content box's right edge (matching x=431,w=107 -> ends at 538,
          the same width as the message box below). */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <span
            className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
            style={{ backgroundColor: "rgba(255,221,222,0.25)" }}
          >
            <AlertTriangle size={16} className="text-white" />
          </span>
          {/* Inter ExtraBold 24, line-height 20 */}
          <h2 className="font-inter font-extrabold text-2xl leading-[20px] text-white">
            {alert.title}
          </h2>
        </div>

        {/* Inter Bold 12, line-height 13, white — same style for both lines */}
        <div className="text-right shrink-0">
          <p className="font-inter font-bold text-xs leading-[13px] text-white">
            {alert.date}
          </p>
          <p className="font-inter font-bold text-xs leading-[13px] text-white">
            {alert.time}
          </p>
        </div>
      </div>

      {/* Inter Medium 16, line-height 25. mt-5 gives it a bit more room to
          breathe below the header, per feedback on the dead space there. */}
      <p className="font-inter font-medium text-base leading-[25px] text-white mt-5">
        {alert.message}
      </p>

      {/* Exact widths/gap from spec: 290px + 10px gap + 200px = 500px total,
          matching the earlier group width. mt-auto pins this row to the
          card's bottom padding so it lands at y=240 regardless of the
          header/message height above it. */}
      <div className="flex items-center gap-[10px] mt-auto">
        <button
          type="button"
          style={{ width: "290px", height: "40px" }}
          className="flex items-center justify-center gap-2 rounded-[8px] border border-white/60 text-white font-inter font-semibold text-sm hover:bg-white/10 transition-colors"
        >
          <Compass size={16} />
          {alert.primaryCta.label}
        </button>

        <button
          type="button"
          style={{ width: "200px", height: "40px" }}
          className="flex items-center justify-center gap-2 rounded-[8px] bg-[#D30004] text-white font-inter font-semibold text-sm hover:brightness-95 transition-colors"
        >
          {alert.secondaryCta.label}
        </button>
      </div>
    </div>
  );
}

function HotlinesCard({ items }) {
  return (
    // Fixed 607x407 per spec. Children are absolute-positioned at their
    // exact figma coordinates rather than stacked with flex gaps, since the
    // given y-values confirm zero gap between logo/heading/subtitle
    // (37.23 = logo height exactly; 54.92 = 37.23 + heading height 17.69).
    // Corner radius wasn't specified for this outer frame — assumed 15px
    // to match the Typhoon card; flag if that should differ.
    <div
      className="relative bg-white rounded-[15px] shrink-0 pb-6"
      style={{ width: "607px", minHeight: "407px" }}
    >
      {/* Logo, heading, and subtitle now stack in normal document flow
          instead of absolute pixel offsets. The previous approach fixed the
          heading's box to height:17.69px, but that doesn't actually clamp
          how tall the text renders at font-size 18.62px — the glyphs
          overflowed that box, and since "Automatic Dials" was pinned to a
          fixed top offset regardless, it didn't account for that overflow
          and the two collided. Flow layout removes that fragility. */}
      <div className="pt-6 flex flex-col items-center">
        <img
          src={caloocanLogo}
          alt="Caloocan City seal"
          className="object-contain"
          style={{ width: "146.19px", height: "37.23px" }}
        />

        <h2
          className="text-center mt-1"
          style={{
            fontFamily: "'Montserrat', sans-serif",
            fontWeight: 900,
            fontSize: "18.62px",
            color: "#D30004",
          }}
        >
          EMERGENCY HOTLINES
        </h2>

        <p
          className="text-center mt-1"
          style={{
            fontFamily: "'Montserrat', sans-serif",
            fontWeight: 500,
            fontSize: "13.03px",
            color: "#292828",
          }}
        >
          Automatic Dials
        </p>
      </div>

      {/* Numbers list — switched from a fixed 269.97px height + justify-
          between to auto-sizing rows with a tight gap. The last row's label
          wraps to two lines, but its previous fixed height:48px didn't
          actually clamp that — the text overflowed past the container's
          fixed height and spilled outside the card's rounded bottom edge.
          minHeight (not height) lets rows grow when their label wraps. */}
      <div
        className="flex flex-col gap-2 mt-6 mx-auto"
        style={{ width: "493.39px" }}
      >
        {items.map((h) => {
          const dialNumber = "tel:" + h.number.replace(/[^\d+]/g, "");

          return (
            <a
              key={h.label}
              href={dialNumber}
              className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-200 transition-colors"
              style={{ backgroundColor: "#F4F4F4", borderRadius: "4.65px", minHeight: "48px" }}
            >
              <span
                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                style={{ backgroundColor: h.color }}
              >
                <Phone
                  size={15}
                  className="text-white"
                  fill="white"
                  strokeWidth={0}
                />
              </span>

              <span
                className="flex-1 leading-snug"
                style={{
                  fontFamily: "'Montserrat', sans-serif",
                  fontWeight: 700,
                  fontSize: "14.89px",
                  color: "#292828",
                }}
              >
                {h.label}
              </span>

              <span
                className="shrink-0 whitespace-nowrap"
                style={{
                  fontFamily: "'Montserrat', sans-serif",
                  fontWeight: 400,
                  fontSize: "14.89px",
                  color: "#292828",
                }}
              >
                {h.number}
              </span>
            </a>
          );
        })}
      </div>
    </div>
  );
}

function DashboardHero() {
  return (
    // Hero frame: w1532 h657 per spec, with the app's already-established
    // px-[100px] side padding (matches the navbars, so no new convention
    // introduced). Content is vertically centered since 657px is taller
    // than the card+button stack (325 + 20 + 48 = 393px).
    <section className="relative overflow-hidden h-[657px]">
      <img
        src={ndrrmcBg}
        alt="NDRRMC operations center"
        className="absolute inset-0 w-full h-full object-cover"
      />

      <div className="absolute inset-0 bg-navy/50" />

      <div className="relative z-10 h-full max-w-[1532px] mx-auto px-[100px] flex items-center">
        <div className="flex flex-col lg:flex-row lg:justify-between items-start w-full gap-6">
          {/* gap-5 (20px) between the card and the CTA row below it —
              matches spec exactly: buttons y345 - card height325 = 20px. */}
          <div className="flex flex-col gap-5">
            <TyphoonWarningCard alert={typhoonAlert} />

            {/* Exact spec: 314px each, 10px gap (324-314), radius 8.
                Montserrat ExtraBold 14.14 for the label text. */}
            <div className="flex items-center gap-[10px]">
              <button
                type="button"
                style={{
                  width: "314px",
                  height: "48px",
                  padding: "0 50px",
                  fontFamily: "'Montserrat', sans-serif",
                  fontSize: "14.14px",
                  fontWeight: 800,
                }}
                className="flex items-center justify-center gap-2 rounded-[8px] bg-[#FF5B5B] text-white transition-colors hover:brightness-95"
              >
                <Camera size={18} />
                Report a Hazard
              </button>

              <button
                type="button"
                style={{
                  width: "314px",
                  height: "48px",
                  padding: "0 50px",
                  fontFamily: "'Montserrat', sans-serif",
                  fontSize: "14.14px",
                  fontWeight: 800,
                  borderColor: "#479F9C",
                }}
                className="flex items-center justify-center gap-2 rounded-[8px] border text-white transition-colors hover:bg-white/10"
              >
                <MapPin size={18} />
                View Hazard Map
              </button>
            </div>
          </div>

          <HotlinesCard items={hotlines} />
        </div>
      </div>

      {/* Floating quick-report button */}
      <button
        type="button"
        aria-label="Report a hazard"
        className="absolute bottom-6 right-6 z-10 w-14 h-14 rounded-full bg-[#D30004] text-white flex items-center justify-center shadow-lg hover:bg-[#b30003] transition-colors"
      >
        <Camera size={22} />
      </button>
    </section>
  );
}

export default DashboardHero;