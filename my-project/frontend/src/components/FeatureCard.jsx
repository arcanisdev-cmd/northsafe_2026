
function FeatureCard({ icon, title, description, zoom = 300 }) {
  return (
    <div
      className="flex flex-col items-center text-center rounded-xl bg-white border transition-all duration-300 hover:-translate-y-1 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
      style={{
        borderColor: "rgba(8,20,53,0.10)",
        padding: "28px 28px 28px",
        boxShadow: "0 6px 18px -3px rgba(8,20,53,0.20)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow =
          "0 14px 28px -5px rgba(8,20,53,0.26)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow =
          "0 6px 18px -3px rgba(8,20,53,0.20)";
      }}
    >
      {/* Icon tile */}
      <div
        role="img"
        aria-hidden="true"
        className="rounded-2xl bg-mint"
        style={{
          width: "100px",
          height: "75px",
          backgroundImage: `url(${icon})`,
          backgroundSize: `${zoom}%`,
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          marginBottom: "14px",
          flexShrink: 0,
        }}
      />

      <h3
        className="font-roboto font-medium text-xl text-navy"
        style={{
          maxWidth: "340px",
          margin: 0,
        }}
      >
        {title}
      </h3>

      <p
        className="font-source-sans font-normal text-base text-navy/80 text-balance mt-2"
        style={{
          maxWidth: "340px",
          lineHeight: "26px",
        }}
      >
        {description}
      </p>
    </div>
  );
}

export default FeatureCard;
