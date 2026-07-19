import Navbar from "./layouts/NavBar";
import Hero from "./sections/Hero";
import Features from "./sections/Features";
import WhatIsNorthsafe from "./sections/WhatIsNorthsafe";
import HowItWorks from "./sections/HowItWorks";
import HazardMapReports from "./sections/HazardMapReports";

function App() {
  return (
    <div className="overflow-x-hidden">
      <div className="max-w-[1532px] mx-auto">
        <Navbar />
        <Hero />
        <Features />
        <WhatIsNorthsafe />
        <HowItWorks />
        <HazardMapReports />
      </div>
    </div>
  );
}

export default App;