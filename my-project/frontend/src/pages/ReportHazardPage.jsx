import { useState } from "react";
import { MapPin } from "lucide-react";
import AuthNavbar from "../layouts/AuthNavbar";
import Footer from "../layouts/Footer";
import StepProgressBar from "../components/StepProgressBar";
import PhotoDropzone from "../components/PhotoDropzone";
import HazardCategoryPicker from "../components/HazardCategoryPicker";
import MiniMapPreview from "../components/MiniMapPreview";
import BarangaySelect from "../components/BarangaySelect";
import ReportSuccessModal from "../components/ReportSuccessModal";

const barangayOptions = Array.from({ length: 24 }, (_, i) => `Barangay ${165 + i}`);

function ReportHazardPage() {
  const [photoFile, setPhotoFile] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(null);
  const [address, setAddress] = useState("");
  const [barangay, setBarangay] = useState("");
  const [barangayTouched, setBarangayTouched] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const step1Complete = photoFile !== null;
  const step2Complete = title.trim() !== "" && description.trim() !== "" && category !== null;
  const step3Complete = address.trim() !== "" && barangay !== "" && selectedLocation !== null;

  const completedSteps = [
    step1Complete && 1,
    step2Complete && 2,
    step3Complete && 3,
  ].filter(Boolean);

  const canSubmit = step1Complete && step2Complete && step3Complete;

  const handleSubmit = () => {
    // Backend integration point: send as multipart/form-data since it includes a file
    const formData = new FormData();
    formData.append("photo", photoFile);
    formData.append("title", title);
    formData.append("description", description);
    formData.append("category", category);
    formData.append("address", address);
    formData.append("barangay", barangay);
    formData.append("location", JSON.stringify(selectedLocation));

    // Example for whoever wires this up:
    // await fetch("/api/reports", { method: "POST", body: formData });
    console.log("Submitting report:", Object.fromEntries(formData));

    setShowSuccessModal(true);
  };

  const handleReportAnother = () => {
    setPhotoFile(null);
    setTitle("");
    setDescription("");
    setCategory(null);
    setAddress("");
    setBarangay("");
    setBarangayTouched(false);
    setSelectedLocation(null);
    setShowSuccessModal(false);
  };

  return (
    <div className="overflow-x-hidden">
      <div className="max-w-[1532px] mx-auto">
        <AuthNavbar />

        <div style={{ backgroundColor: "#D4D3FF" }} className="px-[108px] py-8">
          <h1 className="font-inter font-bold text-2xl text-center" style={{ color: "#0D0B61" }}>
            Report a Hazard
          </h1>

          <div className="mt-6">
            <StepProgressBar completedSteps={completedSteps} />
          </div>

          {/* Main form card */}
          <div className="bg-white rounded-[15px] p-8 mt-6 flex items-start gap-8">
            {/* Column 1: Photo */}
            <PhotoDropzone file={photoFile} onFileSelect={setPhotoFile} />

            {/* Column 2: Details */}
            <div style={{ width: "377px" }}>
              <label className="font-inter font-semibold text-sm text-black">
                Hazard Report Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Brief description (e.g., Large pothole in Main road)"
                className="w-full mt-1.5 px-4 rounded-full text-sm outline-none"
                style={{ height: "51px", border: "1px solid #BCBCBC" }}
              />

              <label className="font-inter font-semibold text-sm text-black mt-5 block">
                Detailed Description *
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide more details of the hazard, its location, and potential risks."
                className="w-full mt-1.5 px-4 py-3 rounded-[10px] text-sm outline-none resize-none"
                style={{ height: "115px", border: "1px solid #BCBCBC" }}
              />

              <label className="font-inter font-semibold text-sm text-black mt-5 block">
                Hazard Category
              </label>
              <div className="mt-2">
                <HazardCategoryPicker selected={category} onSelect={setCategory} />
              </div>
            </div>

            {/* Column 3: Location */}
            <div style={{ width: "404px" }}>
              <button
                type="button"
                onClick={() => setSelectedLocation({ x: 50, y: 50 })}
                className="w-full flex items-center justify-center gap-2 rounded-[10px] text-white font-inter font-bold text-sm"
                style={{ height: "37px", backgroundColor: "#00BAFF" }}
              >
                <MapPin size={16} />
                Use Current Location
              </button>

              <div className="mt-3">
                <MiniMapPreview onLocationSelect={setSelectedLocation} />
              </div>

              <label className="font-inter font-semibold text-sm text-black mt-4 block">
                Address/Landmark *
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Street, barangay, barangay or nearby landmark"
                className="w-full mt-1.5 px-4 rounded-[10px] text-sm outline-none"
                style={{ height: "40px", border: "1px solid #BCBCBC" }}
              />

              <div className="mt-4">
                <BarangaySelect
                  value={barangay}
                  onChange={setBarangay}
                  onBlur={() => setBarangayTouched(true)}
                  touched={barangayTouched}
                  error={barangay ? "" : "Please select your barangay"}
                  options={barangayOptions}
                />
              </div>

              <button
                type="button"
                disabled={!canSubmit}
                onClick={handleSubmit}
                className="w-full rounded-[10px] text-white font-inter font-bold text-sm mt-10 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ height: "44px", backgroundColor: "#042545" }}
              >
                SUBMIT REPORT
              </button>
            </div>
          </div>
        </div>

        <Footer />
      </div>

      <ReportSuccessModal
        isOpen={showSuccessModal}
        onReportAnother={handleReportAnother}
      />
    </div>
  );
}

export default ReportHazardPage;