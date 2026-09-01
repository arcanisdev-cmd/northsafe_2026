import Navbar from "../layouts/NavBar";
import Hero from "../sections/Hero";
import Features from "../sections/Features";
import CommunityCTA from "../sections/CommunityCTA";
import WhatIsNorthsafe from "../sections/WhatIsNorthsafe";
import HowItWorks from "../sections/HowItWorks";
import HazardMapReports from "../sections/HazardMapReports";
import EmergencyHotlines from "../sections/EmergencyHotlines";
import FAQ from "../sections/FAQ";
import Footer from "../layouts/Footer";

function LandingPage() {
  return (
    <div className="overflow-x-hidden">
      <div className="max-w-[1532px] mx-auto">
        <Navbar />
        <Hero />
        <WhatIsNorthsafe />
        <Features />
        <CommunityCTA/>
        <HowItWorks />
        <HazardMapReports />
        <EmergencyHotlines />
        <FAQ />
        <Footer />
      </div>
    </div>
  );
}

export default LandingPage;