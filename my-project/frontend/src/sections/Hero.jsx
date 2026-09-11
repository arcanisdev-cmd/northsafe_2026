import Button from "../components/Button";
import heroImage from "../assets/hero.png";

function Hero() {
  return (
    <section className="relative overflow-hidden px-5 py-16 sm:px-8 sm:py-20 md:px-12 md:py-28 lg:px-20 lg:py-32">
      {/* Background photo */}
      <img
        src={heroImage}
        alt="Aerial night view of North Caloocan"
        className="absolute inset-0 h-full w-full object-cover object-center"
      />

      {/* Dark overlay for text readability */}
      <div className="absolute inset-0 bg-navy/70" />

      {/* Actual content */}
      <div className="relative z-10 mx-auto w-full max-w-[1532px]">
        <h1 className="max-w-[648px] font-inter text-[38px] font-bold leading-[46px] text-white sm:text-[48px] sm:leading-[58px] md:text-[56px] md:leading-[68px] lg:text-[60px] lg:leading-[73px]">
          Stronger Community,{" "}
          <span className="text-teal">Safer</span> North Caloocan.
        </h1>

        <p className="mt-5 max-w-[591px] font-krub text-base font-medium leading-6 text-white sm:mt-6 sm:text-lg sm:leading-7 md:mt-7 md:text-xl md:leading-[26px]">
          NORTHSAFE: is a smart community hazard reporting system with
          AI-powered image classification to help report, track, and resolve
          hazards faster and more accurately.
        </p>

        <div className="mt-7 flex w-full flex-col gap-3 sm:flex-row sm:gap-4">
          <Button
            variant="yellow"
            className="h-12 w-full flex items-center justify-center sm:w-[220px] md:w-[250px]"
          >
            Report a Hazard
          </Button>

          <Button
            variant="outline"
            className="h-12 w-full flex items-center justify-center sm:w-[220px] md:w-[250px]"
          >
            View Live Map
          </Button>
        </div>
      </div>
    </section>
  );
}

export default Hero;