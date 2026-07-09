import Button from "../components/Button";
import heroImage from "../assets/hero.png";

function Hero() {
  return (
    <section className="relative overflow-hidden px-6 md:px-12 lg:px-20 py-24 md:py-32">
      {/* Background photo */}
      <img
        src={heroImage}
        alt="Aerial night view of North Caloocan"
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Dark overlay for text readability */}
      <div className="absolute inset-0 bg-navy/70" />

      {/* Actual content, sits above the image + overlay */}
      <div className="relative z-10">
        <h1 className="font-inter font-bold text-[60px] leading-[73px] text-white max-w-[648px]">
          Stronger Community, <span className="text-teal">Safer</span> North Caloocan.
        </h1>

        <p className="font-krub font-medium text-xl leading-[26px] text-white max-w-[591px] mt-7">
          NORTHSAFE: is a smart community hazard reporting system with AI-powered
          image classification to help report, track, and resolve hazards faster
          and more accurately.
        </p>

        <div className="flex items-center gap-4 mt-7">
          <Button variant="yellow" className="w-[250px] h-[48px] flex items-center justify-center">
            Report a Hazard
          </Button>
          <Button variant="outline" className="w-[250px] h-[48px] flex items-center justify-center">
            View Live Map
          </Button>
        </div>
      </div>
    </section>
  );
}

export default Hero;