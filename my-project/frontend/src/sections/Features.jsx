function FeatureCard() {
  return (
    <div className="w-[311px] h-[150px] bg-white rounded-lg border border-gray-200 shadow-sm" />
  );
}

function Features() {
  const cards = [1, 2, 3, 4, 5, 6];

  return (
    <section className="px-6 md:px-12 lg:px-20 py-24">
      <div className="grid md:grid-cols-2 gap-12">
        {/* Left column */}
        <div>
          <p className="font-inter font-black text-base text-[#41AEAF] uppercase tracking-wide">
            Report. Track. Protect
          </p>

          <h2 className="font-inter font-semibold text-[32px] leading-tight text-black max-w-[300px] mt-[14px]">
            A Safer Community Starts with You.
          </h2>

          <p
            className="font-krub font-normal text-sm text-black max-w-[217px] mt-6"
            style={{ lineHeight: "130.2%", letterSpacing: "14%" }}
          >
            Help us build a safer North Caloocan by reporting hazards in your
            area. Your report can save lives.
          </p>
        </div>

        {/* Right column — feature cards grid */}
        <div className="grid grid-cols-3 gap-x-[25px] gap-y-[27px]">
          {cards.map((card) => (
            <FeatureCard key={card} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default Features;