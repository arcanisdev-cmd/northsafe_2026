function FeatureCard({ icon: Icon, iconColor, title, description }) {
  return (
    <div className="w-[311px] h-[150px] bg-white rounded-[10px] border border-gray-200 shadow-sm p-6 flex flex-col justify-between">
      <div className="flex justify-between items-start">
        <h3 className="font-roboto font-medium text-base text-black max-w-[204px]">
          {title}
        </h3>
        <Icon size={20} color={iconColor} className="shrink-0" />
      </div>

      <p
        className="font-source-sans font-normal text-[11px] text-black max-w-[204px]"
        style={{ lineHeight: "130%" }}
      >
        {description}
      </p>
    </div>
  );
}

export default FeatureCard;