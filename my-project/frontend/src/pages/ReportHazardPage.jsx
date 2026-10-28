import { useEffect, useMemo, useState } from "react";
import { MapPin, Sparkles } from "lucide-react";
import AuthNavbar from "../layouts/AuthNavbar";
import Footer from "../layouts/Footer";
import StepProgressBar from "../components/StepProgressBar";
import PhotoDropzone from "../components/PhotoDropzone";
import HazardCategoryPicker from "../components/HazardCategoryPicker";
import MiniMapPreview from "../components/MiniMapPreview";
import BarangaySelect from "../components/BarangaySelect";
import ReportSuccessModal from "../components/ReportSuccessModal";
import PhotoSourceButtons from "../components/PhotoSourceButtons";
import QuickQuestionsModal from "../components/QuickQuestions";
import EmergencyBanner from "../components/EmergencyBanner";
import NearbyReportsNotice from "../components/NearbyReportsNotice";
import northCaloocanBarangays from "../components/data/northCaloocanBarangays.json";
import { getQuickQuestions, looksLikeEmergency } from "../components/data/reportConfig";
import { distanceMeters, normalizePoint, findBarangayAtPoint, readGpsOnce } from "../utils/geo";
import { compressImage, validatePhoto } from "../utils/image";
import { findNearbyReports, submitReport } from "../utils/reportsApi";
import { reverseGeocode } from "../utils/geocode";

const barangayOptions = Array.from({ length: 24 }, (_, i) => `Barangay ${165 + i}`);

const DRAFT_KEY = "northsafe_report_draft_v1";
const CONSENT_KEY = "northsafe_privacy_consent_v1";

// Draft = text only. Photos and the pin are never saved, so an old location can't be reused by accident.
function loadDraft() {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function clearDraft() {
  try {
    localStorage.removeItem(DRAFT_KEY);
  } catch {
    /* ignore */
  }
}

function ReportHazardPage() {
  const [draft] = useState(loadDraft);

  // Photo
  const [photoFile, setPhotoFile] = useState(null);
  const [captureMethod, setCaptureMethod] = useState(null); // "live" | "uploaded"
  const [widePhoto, setWidePhoto] = useState(null);
  const [photoError, setPhotoError] = useState("");

  // Details
  const [title, setTitle] = useState(draft.title ?? "");
  const [description, setDescription] = useState(draft.description ?? "");
  const [category, setCategory] = useState(draft.category ?? null);
  const [severityLevel, setSeverityLevel] = useState(null);
  const [quickAnswers, setQuickAnswers] = useState(draft.quickAnswers ?? {});
  const [questionsOpen, setQuestionsOpen] = useState(false);

  // Location
  const [address, setAddress] = useState(draft.address ?? "");
  const [addressEdited, setAddressEdited] = useState(Boolean(draft.address));
  const [addressLoading, setAddressLoading] = useState(false);
  const [barangay, setBarangay] = useState("");
  const [barangayTouched, setBarangayTouched] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [gpsReading, setGpsReading] = useState(null); // { lat, lng, accuracy }
  const [locating, setLocating] = useState(false);
  const [locationMessage, setLocationMessage] = useState("");

  // Checks and prompts
  const [consent, setConsent] = useState(() => {
    try {
      return localStorage.getItem(CONSENT_KEY) === "yes";
    } catch {
      return false;
    }
  });
  const [emergencyAck, setEmergencyAck] = useState(false);
  const [nearby, setNearby] = useState([]);
  const [nearbyDismissed, setNearbyDismissed] = useState(false);
  const [mergeInto, setMergeInto] = useState(null);
  const [isOnline, setIsOnline] = useState(typeof navigator === "undefined" ? true : navigator.onLine);
  const [draftRestored, setDraftRestored] = useState(
    Boolean(draft.title || draft.description || draft.address || draft.category)
  );

  // Submit
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitted, setSubmitted] = useState(null); // { id, status }
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Derived values
  const questions = useMemo(() => getQuickQuestions(category), [category]);
  const questionsAnswered = questions.every((q) => quickAnswers[q.id]);
  const answeredCount = questions.filter((q) => quickAnswers[q.id]).length;
  const pin = useMemo(() => normalizePoint(selectedLocation), [selectedLocation]);
  const barangayAtPin = useMemo(
    () => (pin ? findBarangayAtPoint(pin, northCaloocanBarangays) : undefined),
    [pin]
  );
  const outsideArea = barangayAtPin === null; // undefined = boundary data not loaded, so no check
  const gpsPinDistance = gpsReading && pin ? Math.round(distanceMeters(gpsReading, pin)) : null;
  const farFromPin = gpsPinDistance !== null && gpsPinDistance > 500;
  const weakGps = gpsReading !== null && gpsReading.accuracy > 100;

  // One location note at a time, most important first
  const locationNote = outsideArea
    ? { tone: "error", text: "This pin is outside North Caloocan. Move it onto the hazard." }
    : weakGps
    ? { tone: "info", text: "Weak GPS signal. Check that the pin is on the hazard." }
    : farFromPin
    ? { tone: "info", text: "You're far from this pin. That's fine if you saw the hazard earlier." }
    : null;

  const emergency =
    looksLikeEmergency(title + " " + description) ||
    questions.some((q) => q.emergencyIf && quickAnswers[q.id] === q.emergencyIf);

  const step1Complete = photoFile !== null;
  const step2Complete =
    title.trim() !== "" && description.trim() !== "" && category !== null && questionsAnswered;
  const step3Complete =
    address.trim() !== "" && barangay !== "" && selectedLocation !== null && !outsideArea;

  const completedSteps = [
    step1Complete && 1,
    step2Complete && 2,
    step3Complete && 3,
  ].filter(Boolean);

  const needsEmergencyAck = emergency && !emergencyAck;
  const canSubmit =
    step1Complete &&
    step2Complete &&
    step3Complete &&
    consent &&
    !needsEmergencyAck &&
    isOnline &&
    !isSubmitting;

  // Save the text draft (skipped while the success modal is open)
  useEffect(() => {
    if (showSuccessModal) return undefined;
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(
          DRAFT_KEY,
          JSON.stringify({ title, description, category, address, quickAnswers })
        );
      } catch {
        /* storage full or blocked */
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [title, description, category, address, quickAnswers, showSuccessModal]);

  // Online / offline
  useEffect(() => {
    const goOnline = () => setIsOnline(true);
    const goOffline = () => setIsOnline(false);
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  // Fill the barangay from the pin (when boundary data exists)
  useEffect(() => {
    if (typeof barangayAtPin === "string" && barangayOptions.includes(barangayAtPin)) {
      setBarangay(barangayAtPin);
    }
  }, [barangayAtPin]);

  // Fill the address from the pin, unless the user has typed their own
  useEffect(() => {
    if (!pin || addressEdited) return undefined;
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setAddressLoading(true);
      const text = await reverseGeocode({ lat: pin.lat, lng: pin.lng, signal: controller.signal });
      if (controller.signal.aborted) return;
      setAddressLoading(false);
      if (text) setAddress(text);
    }, 700);
    return () => {
      clearTimeout(timer);
      controller.abort();
      setAddressLoading(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pin?.lat, pin?.lng, addressEdited]);

  // Look for a similar open report nearby (duplicate prompt)
  const categoryForLookup = typeof category === "string" ? category : category?.id ?? category?.label ?? "";
  useEffect(() => {
    setMergeInto(null);
    setNearbyDismissed(false);
    if (!pin || !categoryForLookup) {
      setNearby([]);
      return undefined;
    }
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      const found = await findNearbyReports({
        lat: pin.lat,
        lng: pin.lng,
        category: categoryForLookup,
        signal: controller.signal,
      });
      if (!controller.signal.aborted) setNearby(found);
    }, 600);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pin?.lat, pin?.lng, categoryForLookup]);

  // Dev hint: location checks need { lat, lng }
  useEffect(() => {
    if (selectedLocation && !pin) {
      console.warn("ReportHazardPage: selectedLocation is not { lat, lng }, so location checks are skipped.");
    }
  }, [selectedLocation, pin]);

  const handlePhotoPicked = (file, method) => {
    if (!file) {
      setPhotoFile(null);
      setCaptureMethod(null);
      setPhotoError("");
      return;
    }
    const problem = validatePhoto(file);
    if (problem) {
      setPhotoError(problem);
      return;
    }
    setPhotoError("");
    setPhotoFile(file);
    setCaptureMethod(method);
  };

  const handleWidePhotoPicked = (file) => {
    const problem = validatePhoto(file);
    if (problem) {
      setPhotoError(problem);
      return;
    }
    setPhotoError("");
    setWidePhoto(file);
  };

  const handleCategorySelect = (next) => {
    if (next !== category) {
      setQuickAnswers({});
      if (getQuickQuestions(next).length > 0) setQuestionsOpen(true);
    }
    setCategory(next);
  };

  const handleAnswer = (id, value) => {
    setQuickAnswers((prev) => ({ ...prev, [id]: value }));
  };

  const handleConsentChange = (checked) => {
    setConsent(checked);
    try {
      if (checked) localStorage.setItem(CONSENT_KEY, "yes");
      else localStorage.removeItem(CONSENT_KEY);
    } catch {
      /* ignore */
    }
  };

  const handleUseCurrentLocation = async () => {
    setLocating(true);
    setLocationMessage("");
    const { reading, error } = await readGpsOnce({ timeout: 10000 });
    setLocating(false);
    if (reading) {
      setGpsReading(reading);
      setSelectedLocation({ lat: reading.lat, lng: reading.lng, source: "gps" });
    } else {
      setLocationMessage(
        error === "denied"
          ? "Location permission was denied. Tap the map to place the pin instead."
          : "We couldn't get your location. Tap the map to place the pin instead."
      );
    }
  };

  const resetForm = () => {
    setPhotoFile(null);
    setCaptureMethod(null);
    setWidePhoto(null);
    setPhotoError("");
    setTitle("");
    setDescription("");
    setCategory(null);
    setQuickAnswers({});
    setQuestionsOpen(false);
    setAddress("");
    setAddressEdited(false);
    setAddressLoading(false);
    setBarangay("");
    setBarangayTouched(false);
    setSelectedLocation(null);
    setGpsReading(null);
    setLocationMessage("");
    setNearby([]);
    setNearbyDismissed(false);
    setMergeInto(null);
    setEmergencyAck(false);
    setSubmitError("");
    setSubmitted(null);
    setDraftRestored(false);
    setShowSuccessModal(false);
  };

  const handleStartFresh = () => {
    clearDraft();
    resetForm();
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    setSubmitError("");
    setIsSubmitting(true);
    try {
      // One-time GPS read if the user only tapped the map (never tracked)
      let gps = gpsReading;
      if (!gps) {
        const result = await readGpsOnce({ timeout: 6000 });
        gps = result.reading;
        if (gps) setGpsReading(gps);
      }

      const photo = await compressImage(photoFile);
      const wide = widePhoto ? await compressImage(widePhoto) : null;
      const gpsToPin = gps && pin ? Math.round(distanceMeters(gps, pin)) : null;
      const categoryValue =
        category && typeof category === "object" ? category.id ?? category.label : category;

      // Backend integration point: multipart/form-data because it includes files
      const formData = new FormData();
      formData.append("photo", photo);
      if (wide) formData.append("wide_photo", wide);
      formData.append("capture_method", captureMethod ?? "uploaded");
      formData.append("photo_last_modified", new Date(photoFile.lastModified).toISOString());
      formData.append("title", title.trim());
      formData.append("description", description.trim());
      formData.append("category", categoryValue);
      if (severityLevel) formData.append("severity_level", severityLevel);
      formData.append("quick_answers", JSON.stringify(quickAnswers));
      formData.append("address", address.trim());
      formData.append("barangay", barangay);
      formData.append("location", JSON.stringify(selectedLocation));
      formData.append("location_source", selectedLocation?.source ?? "map");
      if (pin) {
        formData.append("pin_lat", pin.lat);
        formData.append("pin_lng", pin.lng);
      }
      if (gps) {
        formData.append("gps_lat", gps.lat);
        formData.append("gps_lng", gps.lng);
        formData.append("gps_accuracy_m", gps.accuracy);
      }
      if (gpsToPin !== null) formData.append("gps_pin_distance_m", gpsToPin);
      if (mergeInto) formData.append("merge_into", mergeInto);
      formData.append("privacy_consent", "1");

      const result = await submitReport(formData);
      clearDraft();
      setSubmitted(result);
      setShowSuccessModal(true);
    } catch (err) {
      setSubmitError(err?.message || "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReportAnother = () => {
    clearDraft();
    resetForm();
  };

  return (
    <div>
      <div className="max-w-[1532px] mx-auto">
        <AuthNavbar />

        <div
          style={{ backgroundColor: "#D4D3FF" }}
          className="px-5 py-6 sm:px-8 sm:py-8 md:px-12 lg:px-[108px] lg:py-8"
        >
          <h1
            className="font-inter font-bold text-2xl sm:text-3xl text-center"
            style={{ color: "#0D0B61" }}
          >
            Report a Hazard
          </h1>

          <div className="mt-6">
            <StepProgressBar completedSteps={completedSteps} />
          </div>

          {!isOnline && (
            <div
              role="status"
              className="rounded-[10px] px-4 py-3 mt-4 font-inter text-xs"
              style={{ backgroundColor: "#FEF9C3", border: "1px solid #FDE047", color: "#713F12" }}
            >
              You're offline. Your draft is saved. Reconnect to submit.
            </div>
          )}

          {draftRestored && (
            <div
              role="status"
              className="rounded-[10px] px-4 py-3 mt-4 font-inter text-xs flex items-center justify-between gap-3"
              style={{ backgroundColor: "#FFFFFF", border: "1px solid #BCBCBC", color: "#0D0B61" }}
            >
              <span>Draft restored. Add your photo and pin again.</span>
              <button type="button" onClick={handleStartFresh} className="underline font-semibold shrink-0">
                Start fresh
              </button>
            </div>
          )}

          {emergency && <EmergencyBanner />}

          {/* Main form card */}
          <div
            className="
              bg-white
              rounded-[15px]
              min-w-0
              p-4 sm:p-6 lg:p-7
              mt-6 grid grid-cols-1 gap-7
              lg:grid-cols-2 lg:gap-7
              xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.1fr)_minmax(0,1fr)]
              xl:gap-6 xl:items-stretch
            "
          >
            {/* Column 1: Photo */}
            <div className="flex w-full min-w-0 flex-col xl:border-r xl:border-gray-200 xl:pr-6">
              <div className="report-photo-dropzone box-border w-full min-w-0 max-w-full [&>div]:!box-border [&>div]:!h-[230px] [&>div]:!min-h-[230px] [&>div]:!w-full [&>div]:!min-w-0 [&>div]:!max-w-full [&>div_*]:!box-border [&>div_*]:!max-w-full">
                <PhotoDropzone
                  file={photoFile}
                  onFileSelect={(file) => handlePhotoPicked(file, "uploaded")}
                />
              </div>
              <PhotoSourceButtons
                onTakePhoto={(file) => handlePhotoPicked(file, "live")}
                widePhoto={widePhoto}
                onWidePhotoSelect={handleWidePhotoPicked}
                recommendWide={captureMethod === "uploaded"}
                error={photoError}
                category={categoryForLookup}
              />

              <div
                className="mt-5 flex min-h-[255px] w-full min-w-0 flex-col rounded-xl border border-dashed p-4 sm:p-5"
                style={{ borderColor: "#B8C8E8", backgroundColor: "#F8FAFF" }}
              >
                <div className="flex w-full min-w-0 items-center justify-between gap-2">
                  <h2 className="min-w-0 font-inter font-bold text-sm" style={{ color: "#042545" }}>
                    AI Classification Preview
                  </h2>
                  <span
                    className="shrink-0 rounded-full px-2.5 py-1 font-inter font-semibold text-[10px]"
                    style={{ backgroundColor: "#E8EDF7", color: "#526581" }}
                  >
                    On hold
                  </span>
                </div>
                <div className="flex flex-1 flex-col items-center justify-center px-2 text-center" aria-hidden="true">
                  <Sparkles size={27} strokeWidth={1.6} className="mb-3 shrink-0" style={{ color: "#6F87B5" }} />
                  <p className="max-w-[230px] font-inter text-xs leading-5" style={{ color: "#64748B" }}>
                    AI photo analysis will appear here when the classification service is enabled.
                  </p>
                </div>
              </div>
            </div>

            {/* Column 2: Details */}
            <div className="w-full min-w-0 xl:border-r xl:border-gray-200 xl:pr-6">
              <label className="font-inter font-semibold text-sm text-black">
                Hazard Report Title *
              </label>

              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Brief description (e.g., Large pothole in Main road)"
                className="w-full mt-1.5 px-4 rounded-[10px] text-sm outline-none"
                style={{
                  height: "51px",
                  border: "1px solid #BCBCBC",
                }}
              />

              <label className="font-inter font-semibold text-sm text-black mt-5 block">
                Detailed Description *
              </label>

              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide more details of the hazard, its location, and potential risks."
                className="w-full mt-1.5 px-4 py-3 rounded-[10px] text-sm outline-none resize-none"
                style={{
                  height: "115px",
                  border: "1px solid #BCBCBC",
                }}
              />

              <label className="font-inter font-semibold text-sm text-black mt-5 block">
                Hazard Category *
              </label>

              <div className="mt-2">
                <HazardCategoryPicker
                  selected={category}
                  onSelect={handleCategorySelect}
                />
              </div>

              <label className="font-inter font-semibold text-sm text-black mt-5 block">
                Severity Level
              </label>
              <div className="grid grid-cols-3 gap-2 mt-2">
                {[
                  { value: "low", label: "Low", detail: "White alert", background: "#F3F6FA", color: "#334155", accent: "#64748B", border: "#D8E0EA" },
                  { value: "medium", label: "Medium", detail: "Blue alert", background: "#EAF4FF", color: "#174A7E", accent: "#1689FF", border: "#B8D8FF" },
                  { value: "critical", label: "Critical", detail: "Red alert", background: "#FFF0F0", color: "#9F2424", accent: "#EF4444", border: "#FECACA" },
                ].map((level) => (
                  <button
                    key={level.value}
                    type="button"
                    aria-pressed={severityLevel === level.value}
                    onClick={() => setSeverityLevel(level.value)}
                    className="min-w-0 rounded-[10px] px-1.5 py-3 flex flex-col items-center justify-center transition-shadow"
                    style={{
                      backgroundColor: level.background,
                      color: level.color,
                      border: `1px solid ${severityLevel === level.value ? level.accent : level.border}`,
                      boxShadow: severityLevel === level.value ? `0 0 0 2px ${level.accent}26` : "none",
                    }}
                  >
                    <span className="flex items-center justify-center gap-1.5 font-inter font-bold text-xs">
                      <span
                        aria-hidden="true"
                        className="inline-block h-2.5 w-2.5 rounded-full border"
                        style={{
                          borderColor: level.accent,
                          backgroundColor: severityLevel === level.value ? level.accent : "transparent",
                        }}
                      />
                      {level.label}
                    </span>
                    <span className="font-inter text-[10px] mt-1">{level.detail}</span>
                  </button>
                ))}
              </div>

              {category !== null && questions.length > 0 && (
                <button
                  type="button"
                  onClick={() => setQuestionsOpen(true)}
                  className="w-full mt-4 px-4 flex items-center justify-between rounded-[10px] font-inter text-sm"
                  style={{
                    height: "44px",
                    border: `1px solid ${questionsAnswered ? "#BCBCBC" : "#00BAFF"}`,
                    color: "#042545",
                  }}
                >
                  <span className="font-semibold">Quick questions</span>
                  <span className="text-xs text-gray-600">
                    {questionsAnswered
                      ? "Answered · Edit"
                      : `${answeredCount} of ${questions.length} answered`}
                  </span>
                </button>
              )}
            </div>

            {/* Column 3: Location */}
            <div className="w-full min-w-0 lg:col-span-2 xl:col-span-1">
              <button
                type="button"
                onClick={handleUseCurrentLocation}
                disabled={locating}
                className="w-full flex items-center justify-center gap-2 rounded-[10px] text-white font-inter font-bold text-sm disabled:opacity-60"
                style={{
                  height: "37px",
                  backgroundColor: "#00BAFF",
                }}
              >
                <MapPin size={16} />
                {locating ? "Finding your location..." : "Use Current Location"}
              </button>
              {locationMessage && (
                <p role="alert" className="font-inter text-xs mt-1.5" style={{ color: "#B91C1C" }}>
                  {locationMessage}
                </p>
              )}

              <div className="report-map-preview mt-3 w-full min-w-0 overflow-hidden rounded-[10px]">
                <MiniMapPreview
                  value={selectedLocation}
                  onLocationSelect={setSelectedLocation}
                />
              </div>

              {locationNote && (
                <p
                  role={locationNote.tone === "error" ? "alert" : "status"}
                  className="font-inter text-xs mt-2"
                  style={{ color: locationNote.tone === "error" ? "#B91C1C" : "#4B5563" }}
                >
                  {locationNote.text}
                </p>
              )}

              <label className="font-inter font-semibold text-sm text-black mt-4 block">
                Address/Landmark *
              </label>

              <input
                type="text"
                value={address}
                onChange={(e) => {
                  setAddress(e.target.value);
                  setAddressEdited(e.target.value.trim() !== "");
                }}
                placeholder={
                  addressLoading ? "Finding the address..." : "Street, barangay or nearby landmark"
                }
                className="w-full mt-1.5 px-4 rounded-[10px] text-sm outline-none"
                style={{
                  height: "40px",
                  border: "1px solid #BCBCBC",
                }}
              />

              <div className="mt-4">
                <BarangaySelect
                  value={barangay}
                  onChange={setBarangay}
                  onBlur={() => setBarangayTouched(true)}
                  touched={barangayTouched}
                  error={barangay ? "" : "Please select the barangay of the hazard"}
                  options={barangayOptions}
                  label="Barangay of the hazard"
                />
              </div>

              {!nearbyDismissed && (
                <NearbyReportsNotice
                  reports={nearby}
                  mergeInto={mergeInto}
                  onMerge={setMergeInto}
                  onDismiss={() => {
                    setNearbyDismissed(true);
                    setMergeInto(null);
                  }}
                />
              )}

              {emergency && (
                <label className="flex items-start gap-2 mt-4 font-inter text-xs text-black">
                  <input
                    type="checkbox"
                    checked={emergencyAck}
                    onChange={(e) => setEmergencyAck(e.target.checked)}
                    className="mt-0.5"
                  />
                  <span>I've called for help, or this isn't an emergency.</span>
                </label>
              )}

              {!consent && (
                <label className="flex items-start gap-2 mt-4 font-inter text-xs text-black">
                  <input
                    type="checkbox"
                    checked={consent}
                    onChange={(e) => handleConsentChange(e.target.checked)}
                    className="mt-0.5"
                  />
                  <span>
                    I agree that my photo, location, and report details are shared with barangay and DRRM staff to handle this report, and that an AI service may analyze my photo.
                  </span>
                </label>
              )}

              {submitError && (
                <p role="alert" className="font-inter text-xs mt-4" style={{ color: "#B91C1C" }}>
                  {submitError}
                </p>
              )}

              <div className="mt-6 w-full min-w-0">
                <button
                  type="button"
                  disabled={!canSubmit}
                  onClick={handleSubmit}
                  className="w-full min-w-0 rounded-[10px] text-white font-inter font-bold text-sm transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{
                    height: "44px",
                    backgroundColor: "#042545",
                  }}
                >
                  {isSubmitting ? "SUBMITTING..." : "SUBMIT REPORT"}
                </button>
              </div>

            </div>
          </div>
        </div>

        <Footer />
      </div>

      <QuickQuestionsModal
        isOpen={questionsOpen}
        onClose={() => setQuestionsOpen(false)}
        questions={questions}
        answers={quickAnswers}
        onChange={handleAnswer}
      />

      <ReportSuccessModal
        isOpen={showSuccessModal}
        onReportAnother={handleReportAnother}
        reportId={submitted?.id}
        status={submitted?.status}
      />
    </div>
  );
}

export default ReportHazardPage;