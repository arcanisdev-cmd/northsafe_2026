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
    <section className="flex pl-[108px] pr-[80px] py-[80px] gap-[64px] bg-gradient-to-b from-gray-100 to-white">
      {/* Left: carousel image + centered pill indicators */}
      <div className="shrink-0 flex flex-col items-center">
        <div
          className="relative rounded-lg overflow-hidden"
          style={{ width: "661.03px", height: "436px" }}
        >
          {slides.map((src, index) => (
            <img
              key={src}
              src={src}
              alt={`NORTHSAFE preview ${index + 1}`}
              className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700"
              style={{ opacity: index === activeIndex ? 1 : 0 }}
            />
          ))}
        </div>

        {/* Pill indicators, centered under the image */}
        <div className="flex items-center justify-center gap-2 mt-4">
          {slides.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setActiveIndex(index)}
              aria-label={`Go to slide ${index + 1}`}
              className="h-2 rounded-full transition-all duration-300"
              style={{
                width: index === activeIndex ? "24px" : "8px",
                backgroundColor: index === activeIndex ? "#0BA6DF" : "#D9D9D9",
              }}
            />
          ))}
        </div>
      </div>

      {/* Right: text block — fixed 640x436, content TOP-aligned and CENTER-aligned */}
      <div
        className="shrink-0"
        style={{ width: "640px", height: "436px" }}
      >
        <h2 className="font-roboto text-[64px] leading-[58px] text-black text-left">
          <h2 className="font-roboto text-left">
          <span className="block text-5xl font-semibold text-black">What is</span>
          <span className="block text-7xl font-bold text-[#08457E]">NORTHSAFE?</span>
</h2>
        </h2>

        <p
          className="font-source-sans font-normal text-black text-justify mt-6"
          style={{
            width: "581px",
            fontSize: "20px",
            lineHeight: "36px",
            letterSpacing: "7%",
          }}
        >
          NORTHSAFE provides a centralized platform where users can report
          hazards using GPS-based location tracking and photo evidence. It
          also uses AI to automatically classify hazards and assess their
          severity. By bringing these features together, the system promotes
          faster response times, better coordination, improved community
          safety, and greater accountability among both residents and
          barangay responders in North Caloocan City.
        </p>
      </div>
    </section>
  );
}

export default WhatIsNorthsafe;