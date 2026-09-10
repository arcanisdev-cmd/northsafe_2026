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
    description: "Upvote legitimate reports and flag suspicious ones. Community engagement ensures report accuracy and authenticity.",
  },
  {
    icon: notificationIcon,
    title: "Real-Time Updates",
    description: "Receive notifications and track resolution progress through every stage, from verification to completion.",
  },
  {
    icon: trophyIcon,
    title: "Rewards Program",
    description: "Earn reward points for verified reports that can be converted to prepaid load, encouraging active community participation.",
  },
  {
    icon: mapIcon,
    title: "GPS-Based Mapping",
    description: "Visualize all reported hazards on an interactive map. Track patterns and identify high-risk areas in your community.",
  },
  {
    icon: analyticsIcon,
    title: "Real-Time Reporting",
    description: "Submit hazard reports instantly with photo evidence and GPS location. Your reports are processed immediately for faster response times.",
  },
  {
    icon: aiIcon,
    title: "AI-Powered Classification",
    description: "Advanced AI automatically categorizes hazards, assesses severity, and routes reports to the appropriate response teams.",
  },
];

function Features() {
  return (
    <section id="features" className="px-[100px] pt-[30px] pb-[80px] scroll-mt-[100px]">
      <p
        className="font-inter font-black text-center"
        style={{ fontSize: "20px", color: "#00BEC2" }}
      >
        REPORT. TRACK. PROTECT
      </p>

      <h2
        className="font-inter font-semibold text-center mt-[10px]"
        style={{ fontSize: "36px", color: "#112472" }}
      >
        A Safer Community Starts with You.
      </h2>

      <p
        className="font-krub font-medium text-center mt-[10px]"
        style={{ fontSize: "20px", lineHeight: "130.2%", letterSpacing: "14%", color: "#000000" }}
      >
        Help us build a safer North Caloocan by reporting hazards in your area. Your report can save lives.
      </p>

      <div className="grid grid-cols-3 gap-x-[30px] gap-y-[30px] mt-[48px]">
        {features.map((feature) => (
          <FeatureCard key={feature.title} {...feature} />
        ))}
      </div>
    </section>
  );
}

export default Features;