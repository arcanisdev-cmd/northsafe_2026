import FeatureCard from "../components/FeatureCard";
import peopleIcon from "../assets/People.png";
import notificationIcon from "../assets/Notification.png";
import trophyIcon from "../assets/Trophy.png";
import mapIcon from "../assets/Map.png";
import analyticsIcon from "../assets/Analytics.png";
import aiIcon from "../assets/AI.png";

const features = [
  {
    icon: peopleIcon,
    title: "Community Validation",
    description:
      "Upvote legitimate reports and flag suspicious ones. Community engagement ensures report accuracy and authenticity.",
  },
  {
    icon: notificationIcon,
    title: "Real-Time Updates",
    description:
      "Receive notifications and track resolution progress through every stage, from verification to completion.",
  },
  {
    icon: trophyIcon,
    title: "Rewards Program",
    description:
      "Earn reward points for verified reports that can be converted to prepaid load, encouraging active community participation.",
  },
  {
    icon: mapIcon,
    title: "GPS-Based Mapping",
    description:
      "Visualize all reported hazards on an interactive map. Track patterns and identify high-risk areas in your community.",
  },
  {
    icon: analyticsIcon,
    title: "Real-Time Reporting",
    description:
      "Submit hazard reports instantly with photo evidence and GPS location. Your reports are processed immediately for faster response times.",
  },
  {
    icon: aiIcon,
    title: "AI-Powered Classification",
    description:
      "Advanced AI automatically categorizes hazards, assesses severity, and routes reports to the appropriate response teams.",
  },
];

function Features() {
  return (
    <section
      id="features"
      className="scroll-mt-[100px] px-5 pb-16 pt-12 sm:px-8 sm:pb-20 sm:pt-16 md:px-12 md:pb-24 md:pt-20 lg:px-[100px] lg:pb-[80px] lg:pt-[30px]"
    >
      {/* Section label */}
      <p className="text-center font-inter text-base font-black text-[#00BEC2] sm:text-lg md:text-[20px]">
        REPORT. TRACK. PROTECT
      </p>

      {/* Heading */}
      <h2 className="mt-2 text-center font-inter text-[28px] font-semibold leading-tight text-[#112472] sm:text-[32px] md:mt-[10px] md:text-[36px]">
        A Safer Community Starts with You.
      </h2>

      {/* Description */}
      <p className="mx-auto mt-3 max-w-[900px] text-center font-krub text-base font-medium leading-7 text-black sm:text-lg md:mt-[10px] md:text-[20px] md:leading-[130.2%]">
        Help us build a safer North Caloocan by reporting hazards in your
        area. Your report can save lives.
      </p>

      {/* Feature Cards */}
      <div className="mt-10 grid grid-cols-1 gap-5 sm:mt-12 sm:grid-cols-2 sm:gap-6 lg:mt-[48px] lg:grid-cols-3 lg:gap-[30px]">
        {features.map((feature) => (
          <FeatureCard key={feature.title} {...feature} />
        ))}
      </div>
    </section>
  );
}

export default Features;