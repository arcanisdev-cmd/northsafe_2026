import { Zap, MessageSquareText, MapPin, Users, Bell, Gift } from "lucide-react";
import FeatureCard from "../components/FeatureCard";

const features = [
  { icon: Zap, iconColor: "#EC8305", title: "Real-Time Reporting", description: "Submit hazard reports instantly with photo evidence and GPS location. Your reports are processed immediately for faster response times." },
  { icon: MessageSquareText, iconColor: "#79D7BE", title: "AI-Powered Classification", description: "Advanced AI automatically categorizes hazards, assesses severity, and routes reports to the appropriate response teams." },
  { icon: MapPin, iconColor: "#EB3223", title: "GPS-Based Mapping", description: "Visualize all reported hazards on an interactive map. Track patterns and identify high-risk areas in your community." },
  { icon: Users, iconColor: "#BB271A", title: "Community Validation", description: "Upvote legitimate reports and flag suspicious ones. Community engagement ensures report accuracy and authenticity." },
  { icon: Bell, iconColor: "#FFFD54", title: "Real-Time Updates", description: "Receive notifications and track resolution progress through every stage, from verification to completion." },
  { icon: Gift, iconColor: "#F29D38", title: "Rewards Program", description: "Earn reward points for verified reports that can be converted to prepaid load, encouraging active community participation." },
];

function Features() {
  return (
    <section className="pl-[108px] pr-[80px] py-24">
      <div className="grid" style={{ gridTemplateColumns: "361px 983px" }}>
        {/* Left column — exactly 361px, matching Figma's gap to the cards */}
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

        {/* Right column — cards, exactly 983px */}
        <div className="grid gap-x-[25px] gap-y-[27px]" style={{ gridTemplateColumns: "repeat(3, 311px)" }}>
          {features.map((feature) => (
            <FeatureCard key={feature.title} {...feature} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default Features;