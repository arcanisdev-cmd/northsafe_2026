import buildingImage from "../assets/building.jpg";

function WhatIsNorthsafe() {
  return (
    <section
  className="relative flex items-center justify-between pl-[132px] pr-[128px] py-[109px]"
  style={{ background: "linear-gradient(90deg, #FFFFFF 0%, rgba(8, 20, 53, 0.25) 100%)" }}
>
      {/* Image */}
      <img
        src={buildingImage}
        alt="Barangay building in North Caloocan"
        className="w-[612px] h-[459px] object-cover rounded-lg"
      />

      {/* Right-anchored text block */}
      <div className="flex flex-col items-end">
        <h2 className="font-roboto text-[64px] leading-[75px] text-black text-center">
          <span className="font-light block">What is</span>
          <span className="font-black block">NORTHSAFE?</span>
        </h2>

        <p
          className="font-source-sans font-normal text-lg text-black text-center max-w-[544px] mt-11"
          style={{ letterSpacing: "8%" }}
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