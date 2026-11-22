import { useState, useEffect } from "react";
import hero1 from "../assets/hero.png";
import hero2 from "../assets/hero2.png";
import hero3 from "../assets/hero3.png";
import hero4 from "../assets/hero4.png";
import hero5 from "../assets/hero5.png";

const slides = [hero1, hero2, hero3, hero4, hero5];

function WhatIsNorthsafe() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % slides.length);
    }, 4000);

    return () => clearInterval(timer);
  }, []);

  return (
    <section
      id="about"
      className="relative isolate scroll-mt-[100px] overflow-hidden bg-gradient-to-b from-mint/50 via-mint/20 to-white px-5 pb-10 pt-12 sm:px-8 sm:pb-12 sm:pt-16 md:px-12 md:pb-16 md:pt-20 lg:px-[108px] lg:pb-[30px] lg:pt-[80px]"
    >
      {/* Decorative background glows (purely visual, one per corner) */}
      {/* Top-right: teal */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 -top-24 -z-10 h-72 w-72 rounded-full bg-teal/20 blur-3xl sm:h-96 sm:w-96"
      />
      {/* Top-left / left side: teal-mint */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-32 top-10 -z-10 h-72 w-72 rounded-full bg-teal/15 blur-3xl sm:h-96 sm:w-96"
      />
      {/* Bottom-left: yellow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-32 -left-24 -z-10 h-72 w-72 rounded-full bg-yellow/30 blur-3xl sm:h-80 sm:w-80"
      />
      {/* Bottom-right: Figma blue, sitting a bit higher on the right edge */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-32 bottom-8 -z-10 h-72 w-72 rounded-full bg-[#08457E]/15 blur-3xl sm:h-96 sm:w-96"
      />
      {/* Bottom-right corner: yellow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-32 -right-16 -z-10 h-72 w-72 rounded-full bg-yellow/30 blur-3xl sm:h-80 sm:w-80"
      />

      <div className="mx-auto flex max-w-[1531px] flex-col gap-10 md:gap-12 xl:flex-row xl:items-start xl:gap-12 2xl:gap-14">
        {/* Left: Carousel */}
        <div className="flex w-full flex-col items-center xl:min-w-0 xl:flex-1 2xl:w-[661.03px] 2xl:flex-none">
          <div className="relative isolate w-full">
            {/* Offset shape (bottom-left, away from the text) */}
            <div
              aria-hidden="true"
              className="absolute inset-0 -z-10 -translate-x-3 translate-y-3 rounded-lg bg-teal/30 sm:-translate-x-4 sm:translate-y-4"
            />

            <div className="relative aspect-[661/436] w-full overflow-hidden rounded-lg shadow-[0_20px_50px_-12px_rgba(8,20,53,0.25)] ring-1 ring-navy/10">
              {slides.map((src, index) => (
                <img
                  key={src}
                  src={src}
                  alt={`NORTHSAFE preview ${index + 1}`}
                  className="absolute inset-0 h-full w-full object-cover transition-opacity duration-700"
                  style={{
                    opacity: index === activeIndex ? 1 : 0,
                  }}
                />
              ))}
            </div>
          </div>

          {/* Pill indicators (behavior unchanged; only mt-4 -> mt-7 so the offset shape doesn't crowd them) */}
          <div className="mt-7 flex items-center justify-center gap-2">
            {slides.map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setActiveIndex(index)}
                aria-label={`Go to slide ${index + 1}`}
                className="h-2 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#0BA6DF] focus:ring-offset-2"
                style={{
                  width: index === activeIndex ? "24px" : "8px",
                  backgroundColor:
                    index === activeIndex ? "#0BA6DF" : "#D9D9D9",
                }}
              />
            ))}
          </div>
        </div>

        {/* Right: Text */}
        <div className="w-full xl:min-w-0 xl:flex-1">
          <h2 className="font-roboto text-left">
            <span className="block text-[40px] font-semibold leading-[48px] text-navy sm:text-5xl sm:leading-[58px] md:text-[52px] md:leading-[62px] lg:text-5xl lg:leading-[58px]">
              What is
            </span>

            {/* #08457E is from Figma, so it stays */}
            <span className="block text-[52px] font-bold leading-[60px] text-[#08457E] sm:text-6xl sm:leading-[70px] md:text-[64px] md:leading-[76px] lg:text-7xl lg:leading-[84px]">
              NORTHSAFE?
            </span>
          </h2>

          <p className="mt-5 w-full font-source-sans text-base font-normal leading-7 text-navy sm:mt-6 sm:text-lg sm:leading-8 md:text-xl md:leading-[34px] xl:max-w-[581px]">
            NORTHSAFE provides a centralized platform where users can report
            hazards using GPS-based location tracking and photo evidence. It
            also uses AI to automatically classify hazards and assess their
            severity. By bringing these features together, the system promotes
            faster response times, better coordination, improved community
            safety, and greater accountability among both residents and
            barangay responders in North Caloocan City.
          </p>
        </div>
      </div>
    </section>
  );
}

export default WhatIsNorthsafe;