function FeatureCard({ icon, title, description, zoom = 300 }) {
  return (
    <div
      className="flex flex-col items-center text-center rounded-xl bg-white border transition-all duration-300 hover:-translate-y-1"
      style={{
        borderColor: "#EDEDED",
        padding: "24px 24px 20px",
        boxShadow: "0 6px 16px -6px rgba(0,0,0,0.15)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow =
          "0 16px 30px -8px rgba(0,0,0,0.22)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow =
          "0 6px 16px -6px rgba(0,0,0,0.15)";
      }}
    >
      <div
        role="img"
        aria-hidden="true"
        style={{
          width: "100px",
          height: "75px",
          backgroundImage: `url(${icon})`,
          backgroundSize: `${zoom}%`,
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          marginBottom: "2px",
          flexShrink: 0,
        }}
      />

      <h3
        className="font-roboto font-medium text-xl text-black"
        style={{
          maxWidth: "320px",
          margin: 0,
        }}
      >
        {title}
      </h3>

      <p
        className="font-source-sans font-normal text-sm text-black mt-[6px]"
        style={{
          maxWidth: "320px",
          lineHeight: "30px",
        }}
      >
        {description}
      </p>
    </div>
  );
}

export default FeatureCard;