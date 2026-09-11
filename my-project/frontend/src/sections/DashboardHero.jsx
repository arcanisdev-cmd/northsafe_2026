import { useState } from "react";
import {
  AlertTriangle,
  MapPin,
  Compass,
  Camera,
  Phone,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import ndrrmcBg from "../assets/ndrrmc.png";
import caloocanLogo from "../assets/caloocan-logo.png";
import {
  typhoonAlert,
  hotlines,
} from "../components/data/MockDashboardData";

function TyphoonWarningCard({ alert }) {
  return (
    <div
      className="flex h-auto w-full shrink-0 flex-col rounded-[15px] px-5 py-6 sm:px-8 md:px-10 lg:h-[325px] lg:w-[638px] lg:px-[50px] lg:pt-6 lg:pb-[45px]"
      style={{
        background:
          "linear-gradient(180deg, #C40000 0%, #000000 100%)",
        border: "1px solid rgba(255,255,255,0.15)",
      }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-2">
          <span
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
            style={{
              backgroundColor: "rgba(255,221,222,0.25)",
            }}
          >
            <AlertTriangle
              size={16}
              className="text-white"
            />
          </span>

          <h2 className="font-inter text-xl font-extrabold leading-6 text-white sm:text-2xl sm:leading-[20px]">
            {alert.title}
          </h2>
        </div>

        <div className="shrink-0 text-right">
          <p className="font-inter text-[11px] font-bold leading-[13px] text-white sm:text-xs">
            {alert.date}
          </p>
          <p className="font-inter text-[11px] font-bold leading-[13px] text-white sm:text-xs">
            {alert.time}
          </p>
        </div>
      </div>

      <p className="mt-5 font-inter text-sm font-medium leading-6 text-white sm:text-base sm:leading-[25px]">
        {alert.message}
      </p>

      <div className="mt-6 flex flex-wrap items-center gap-2.5 lg:mt-auto">
        <button
          type="button"
          className="flex h-10 w-full items-center justify-center gap-2 rounded-[8px] border border-white/60 px-4 text-sm font-semibold text-white transition-colors hover:bg-white/10 sm:w-[290px]"
        >
          <Compass size={16} />
          {alert.primaryCta.label}
        </button>

        <button
          type="button"
          className="flex h-10 w-full items-center justify-center gap-2 rounded-[8px] bg-[#D30004] px-4 text-sm font-semibold text-white transition-colors hover:brightness-95 sm:w-[200px]"
        >
          {alert.secondaryCta.label}
        </button>
      </div>
    </div>
  );
}

function HotlinesCard({ items }) {
  return (
    <div className="relative w-full shrink-0 rounded-[15px] bg-white pb-6 lg:w-[607px] lg:min-h-[407px]">
      <div className="flex flex-col items-center px-4 pt-6">
        <img
          src={caloocanLogo}
          alt="Caloocan City seal"
          className="h-auto w-[146.19px] object-contain"
        />

        <h2
          className="mt-1 text-center"
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
          className="mt-1 text-center"
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

      <div className="mx-auto mt-6 flex w-full max-w-[493.39px] flex-col gap-2 px-4 sm:px-6 lg:px-0">
        {items.map((h) => {
          const dialNumber =
            "tel:" + h.number.replace(/[^\d+]/g, "");

          return (
            <a
              key={h.label}
              href={dialNumber}
              aria-label={`Call ${h.label} ${h.number}`}
              className="flex min-h-[48px] items-center gap-3 rounded-[4.65px] px-3 py-2.5 transition-colors hover:bg-gray-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0BA6DF] focus-visible:ring-offset-2 sm:px-4"
              style={{
                backgroundColor: "#F4F4F4",
              }}
            >
              <span
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                style={{
                  backgroundColor: h.color,
                }}
              >
                <Phone
                  size={15}
                  className="text-white"
                  fill="white"
                  strokeWidth={0}
                />
              </span>

              <span
                className="min-w-0 flex-1 leading-snug"
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
                className="shrink-0 whitespace-nowrap text-right"
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
  const navigate = useNavigate();
  const [isReportTransitioning, setIsReportTransitioning] =
    useState(false);

  function handleFloatingReport() {
    if (isReportTransitioning) return;

    setIsReportTransitioning(true);

    window.setTimeout(() => {
      navigate("/report-hazard");
    }, 550);
  }

  return (
    <section className="relative min-h-0 overflow-hidden lg:h-[657px]">
      <img
        src={ndrrmcBg}
        alt="NDRRMC operations center"
        className="absolute inset-0 h-full w-full object-cover"
      />

      <div className="absolute inset-0 bg-navy/50" />

      <div className="relative z-10 mx-auto flex w-full max-w-[1532px] items-center px-5 py-10 sm:px-8 sm:py-12 md:px-12 md:py-14 lg:h-full lg:px-[100px] lg:py-0">
        <div className="flex w-full flex-col gap-8 lg:flex-row lg:items-start lg:justify-between lg:gap-6">
          <div className="flex min-w-0 w-full flex-col gap-5 lg:w-auto">
            <TyphoonWarningCard alert={typhoonAlert} />

            <div className="flex w-full justify-center">
              <div className="flex w-full max-w-[360px] flex-col items-center gap-3 sm:max-w-none sm:flex-row sm:gap-[10px]">
                <Link
                  to="/report-hazard"
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-[8px] bg-[#FF5B5B] px-6 text-sm font-extrabold text-white transition-colors hover:brightness-95 sm:w-[314px]"
                  style={{
                    fontFamily: "'Montserrat', sans-serif",
                    fontSize: "14.14px",
                    fontWeight: 800,
                  }}
                >
                  <Camera size={18} />
                  Report a Hazard
                </Link>

                <Link
                  to="/hazard-map"
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-[8px] border px-6 text-sm font-extrabold text-white transition-colors hover:bg-white/10 sm:w-[314px]"
                  style={{
                    fontFamily: "'Montserrat', sans-serif",
                    fontSize: "14.14px",
                    fontWeight: 800,
                    borderColor: "#479F9C",
                  }}
                >
                  <MapPin size={18} />
                  View Hazard Map
                </Link>
              </div>
            </div>
          </div>

          <HotlinesCard items={hotlines} />
        </div>
      </div>

      <button
  type="button"
  aria-label="Report a hazard"
  onClick={handleFloatingReport}
  disabled={isReportTransitioning}
  className={`fixed bottom-5 right-5 z-[10000] flex h-14 w-14 items-center justify-center rounded-full bg-[#D30004] text-white shadow-[0_6px_20px_rgba(0,0,0,0.3)] transition-all duration-200 hover:scale-105 hover:bg-[#B30003] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#081435] active:scale-95 sm:bottom-6 sm:right-6 sm:h-14 sm:w-14 ${
    isReportTransitioning
      ? "pointer-events-none scale-110"
      : ""
  }`}
>
  <Camera
    size={22}
    className={`transition-transform duration-300 ${
      isReportTransitioning
        ? "scale-125 rotate-[-8deg]"
        : ""
    }`}
  />
  </button>

      {isReportTransitioning && (
        <div
          aria-hidden="true"
          className="report-camera-transition pointer-events-none fixed inset-0 z-[30000] bg-[#D30004]"
        >
          <div className="flex h-full w-full items-center justify-center">
            <Camera
              size={42}
              strokeWidth={2.2}
              className="text-white report-camera-icon"
            />
          </div>
        </div>
      )}
    </section>
  );
}

export default DashboardHero;