import AuthNavbar from "../layouts/AuthNavbar";
import MapFilterBar from "../sections/MapFilterBar";
import MapSidebar from "../sections/MapSidebar";
import SeverityLegend from "../components/SeverityLegend";
import LayersToggle from "../components/LayersToggle";
import Footer from "../layouts/Footer";

function HazardMapPage() {
  return (
    <div className="overflow-x-hidden">
      <div className="max-w-[1532px] mx-auto">
        <AuthNavbar />

        {/* Full-bleed map area — sidebar and filter bar float on top */}
        <div className="relative" style={{ width: "1531px", height: "720px" }}>
          {/* Map placeholder — real map library/backend integration goes here */}
          <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
            <span className="text-gray-400 text-sm">Map integration goes here</span>
          </div>

          {/* Sidebar — floats top-left */}
          <div className="absolute" style={{ left: "2px", top: "0px" }}>
            <MapSidebar />
          </div>

          {/* Filter bar — floats top, starting after the sidebar */}
          <div className="absolute" style={{ left: "325px", top: "17px" }}>
            <MapFilterBar />
          </div>

          <SeverityLegend />
          <LayersToggle />
        </div>

        <Footer />
      </div>
    </div>
  );
}

export default HazardMapPage;