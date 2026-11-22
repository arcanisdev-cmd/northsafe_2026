
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

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-navy/90 via-navy/65 to-navy/35" />

      {/* Actual content */}
      <div className="relative z-10 mx-auto w-full max-w-[1532px] translate-y-3 sm:translate-y-4 md:translate-y-6 lg:translate-y-8">
        <h1 className="max-w-[648px] font-inter text-[38px] font-bold leading-[46px] text-white sm:text-[48px] sm:leading-[58px] md:text-[56px] md:leading-[68px] lg:text-[60px] lg:leading-[73px]">
          Stronger Community,{" "}
          <span className="text-teal">Safer</span> North Caloocan.
        </h1>

        <p className="mt-6 max-w-[591px] font-krub text-base font-medium leading-6 text-white sm:mt-7 sm:text-lg sm:leading-7 md:mt-8 md:text-xl md:leading-[26px]">
          Report community hazards, track incidents, and help make North
          Caloocan safer through AI-assisted hazard reporting.
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
