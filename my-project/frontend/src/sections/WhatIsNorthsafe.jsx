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
      className="scroll-mt-[100px] bg-gradient-to-b from-gray-100 to-white px-5 pb-10 pt-12 sm:px-8 sm:pb-12 sm:pt-16 md:px-12 md:pb-16 md:pt-20 lg:px-[108px] lg:pb-[30px] lg:pt-[80px]"
    >
      <div className="mx-auto flex max-w-[1531px] flex-col gap-10 md:gap-12 lg:flex-row lg:items-start lg:gap-[21px]">

        {/* Left: Carousel */}
        <div className="flex w-full shrink-0 flex-col items-center lg:w-[661.03px]">
          <div className="relative aspect-[661/436] w-full overflow-hidden rounded-lg">
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

          {/* Pill indicators */}
          <div className="mt-4 flex items-center justify-center gap-2">
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
        <div className="w-full shrink-0 lg:h-[436px] lg:w-[640px]">
          <h2 className="font-roboto text-left">
            <span className="block text-[40px] font-semibold leading-[48px] text-black sm:text-5xl sm:leading-[58px] md:text-[52px] md:leading-[62px] lg:text-5xl lg:leading-[58px]">
              What is
            </span>

            <span className="block text-[52px] font-bold leading-[60px] text-[#08457E] sm:text-6xl sm:leading-[70px] md:text-[64px] md:leading-[76px] lg:text-7xl lg:leading-[84px]">
              NORTHSAFE?
            </span>
          </h2>

          <p className="mt-5 w-full font-source-sans text-base font-normal leading-7 text-black sm:mt-6 sm:text-lg sm:leading-8 md:text-xl md:leading-9 lg:mt-6 lg:w-[581px]">
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