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

async function reverseGeocodeLocation(latitude, longitude) {
  const url = new URL("https://nominatim.openstreetmap.org/reverse");
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("lat", String(latitude));
  url.searchParams.set("lon", String(longitude));
  url.searchParams.set("zoom", "18");
  url.searchParams.set("addressdetails", "1");

  const response = await fetch(url.toString(), {
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Reverse geocoding failed.");
  }

  const data = await response.json();
  const address = data?.address ?? {};
  const shortAddress = [
    address.road,
    address.neighbourhood ?? address.suburb ?? address.village,
    address.city ?? address.town ?? address.municipality,
  ]
    .filter(Boolean)
    .join(", ");

  return shortAddress || data?.display_name || "Current location, Caloocan City";
}

async function prepareImage(file) {
  const sourceUrl = URL.createObjectURL(file);
  const image = await new Promise((resolve, reject) => {
    const element = new Image();
    element.onload = () => resolve(element);
    element.onerror = () => reject(new Error("Unable to decode the selected image."));
    element.src = sourceUrl;
  });
  const maxDimension = 1600;
  const scale = Math.min(1, maxDimension / Math.max(image.width, image.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(image.width * scale));
  canvas.height = Math.max(1, Math.round(image.height * scale));
  canvas.getContext("2d").drawImage(image, 0, 0, canvas.width, canvas.height);
  URL.revokeObjectURL(sourceUrl);

  let blob = null;
  for (const quality of [0.78, 0.65, 0.52, 0.4]) {
    blob = await new Promise((resolve) => {
      canvas.toBlob(resolve, "image/jpeg", quality);
    });

    if (blob && blob.size <= 1.5 * 1024 * 1024) {
      break;
    }
  }

  if (!blob) {
    throw new Error("Unable to prepare the selected image.");
  }

  const dataUrl = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Unable to read the selected image."));
    reader.readAsDataURL(blob);
  });

  return {
    dataUrl,
    name: `${file.name.replace(/\.[^.]+$/, "") || "report-image"}.jpg`,
    mime: "image/jpeg",
  };
}

function ReportHazardPage() {
  const apiBaseUrl = import.meta.env.VITE_API_URL ?? "";
  const [photoFile, setPhotoFile] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(null);
  const [address, setAddress] = useState("");
  const [barangay, setBarangay] = useState("");
  const [barangayTouched, setBarangayTouched] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [locationError, setLocationError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const clearStoredAuth = () => {
    localStorage.removeItem("northsafe_token");
    localStorage.removeItem("northsafe_user");
    sessionStorage.removeItem("northsafe_token");
    sessionStorage.removeItem("northsafe_user");
  };

  const step1Complete = photoFile !== null;
  const step2Complete = title.trim() !== "" && description.trim() !== "" && category !== null;
  const step3Complete = address.trim() !== "" && barangay !== "" && selectedLocation !== null;

  const completedSteps = [
    step1Complete && 1,
    step2Complete && 2,
    step3Complete && 3,
  ].filter(Boolean);

  const canSubmit = step1Complete && step2Complete && step3Complete;

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Your browser does not support location access.");
      return;
    }

    setLocationError("");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        let resolvedAddress = "Current location, Caloocan City";

        try {
          resolvedAddress = await reverseGeocodeLocation(latitude, longitude);
        } catch {
          // Keep a human-readable fallback when reverse geocoding is unavailable.
        }

        setSelectedLocation({
          latitude,
          longitude,
          label: resolvedAddress,
          source: "current-location",
        });

        setAddress((currentAddress) =>
          currentAddress.trim() ? currentAddress : resolvedAddress
        );
      },
      () => {
        setLocationError("We could not access your current location. Please allow location permission and try again.");
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const handleSubmit = async () => {
    if (!canSubmit || isSubmitting) {
      return;
    }

    const token = localStorage.getItem("northsafe_token") ?? sessionStorage.getItem("northsafe_token");

    if (!token) {
      setSubmitError("Please sign in before submitting a report.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");

    try {
      const preparedImage = await prepareImage(photoFile);

      const response = await fetch(`${apiBaseUrl}/api/reports`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: title.trim(),
          hazard_type: category,
          description: description.trim(),
          latitude: selectedLocation.latitude,
          longitude: selectedLocation.longitude,
          location_name: address.trim(),
          barangay,
          image_data: preparedImage.dataUrl,
          image_name: preparedImage.name,
          image_mime: preparedImage.mime,
        }),
      });

      const responseText = await response.text();
      let data = {};

      try {
        data = responseText ? JSON.parse(responseText) : {};
      } catch {
        data = { message: responseText };
      }

      if (!response.ok) {
        if (response.status === 401) {
          clearStoredAuth();
          setSubmitError("Your session expired. Please sign in again before submitting a report.");
          return;
        }

        const validationErrors = data?.errors ? Object.values(data.errors).flat().join(" ") : "";
        setSubmitError(
          data?.message ??
            validationErrors ??
            `Upload failed with status ${response.status}.`
        );
        return;
      }

      setShowSuccessModal(true);
    } catch (error) {
      setSubmitError(error.message || "Unable to submit your report.");
    } finally {
      setIsSubmitting(false);
    }
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
    setLocationError("");
    setSubmitError("");
    setShowSuccessModal(false);
  };

  return (
    <div >
      <div className="mx-auto" style={{ maxWidth: "1532px" }}>
        <AuthNavbar />

        <div style={{ backgroundColor: "#D4D3FF", paddingLeft: "108px", paddingRight: "108px" }} className="py-8">
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
                onClick={handleUseCurrentLocation}
                className="w-full flex items-center justify-center gap-2 rounded-[10px] text-white font-inter font-bold text-sm"
                style={{ height: "37px", backgroundColor: "#00BAFF" }}
              >
                <MapPin size={16} />
                Use Current Location
              </button>

              {locationError && (
                <p className="mt-2 text-xs font-medium text-[#D30004]">{locationError}</p>
              )}

              <div className="mt-3">
                <MiniMapPreview location={selectedLocation} onLocationSelect={setSelectedLocation} />
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
                disabled={!canSubmit || isSubmitting}
                onClick={handleSubmit}
                className="w-full rounded-[10px] text-white font-inter font-bold text-sm mt-10 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ height: "44px", backgroundColor: "#042545" }}
              >
                {isSubmitting ? "SUBMITTING..." : "SUBMIT REPORT"}
              </button>

              {submitError && (
                <p className="mt-3 text-sm font-medium text-[#D30004]">{submitError}</p>
              )}
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