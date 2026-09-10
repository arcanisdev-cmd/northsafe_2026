import { useState } from "react";
import BarangaySelect from "../BarangaySelect";
import ProfilePictureUploader from "./ProfilePictureUploader";

const BARANGAY_OPTIONS = ["Brgy. 167", "Brgy. 168", "Brgy. 169"]; // TODO: swap for the real official list

const REQUIRED_FIELDS = ["firstName", "middleName", "surname", "email", "contactNumber", "houseNumber", "street", "barangay", "zipCode"];

function Field({ label, required, children }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-semibold text-gray-800">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputClass =
  "w-full rounded-md border border-gray-200 bg-gray-100 px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-[#1B2A56] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#1B2A56]";

// Fake reverse-geocode stub — replace with a real OpenStreetMap/Nominatim call once the backend is wired in
function mockReverseGeocode(lat, lng) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ street: "Benedict Ville", barangay: "Brgy. 167", zipCode: "1400" });
    }, 1000);
  });
}

export default function PersonalInformationForm({ user, onUpdateUser }) {
  const [formData, setFormData] = useState({
    firstName: user?.firstName ?? "",
    middleName: user?.middleName ?? "",
    surname: user?.surname ?? "",
    suffix: user?.suffix ?? "",
    email: user?.email ?? "",
    contactNumber: user?.contactNumber ?? "",
    houseNumber: user?.houseNumber ?? "",
    street: user?.street ?? "",
    barangay: user?.barangay ?? "",
    zipCode: user?.zipCode ?? "",
    profilePicture: user?.profilePicture ?? null,
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState("");

  function updateField(field, value) {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  function handleContactChange(e) {
    const digits = e.target.value.replace(/[^\d+]/g, "");
    updateField("contactNumber", digits);
  }

  function handleEmailChange(e) {
    updateField("email", e.target.value.toLowerCase());
  }

  function validate() {
    const nextErrors = {};
    REQUIRED_FIELDS.forEach((field) => {
      if (!formData[field]?.trim()) nextErrors[field] = "Required";
    });
    if (formData.email && !/^\S+@\S+\.\S+$/.test(formData.email)) {
      nextErrors.email = "Enter a valid email address";
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function handleSave() {
    if (!validate()) return;
    setSaving(true);
    setSaved(false);
    // TODO: replace with a real PATCH /api/profile call once Laravel is wired in
    setTimeout(() => {
      onUpdateUser?.((prev) => ({ ...prev, ...formData, fullName: `${formData.firstName} ${formData.surname}` }));
      setSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    }, 1200);
  }

  function handleUseCurrentLocation() {
    setLocationError("");
    if (!navigator.geolocation) {
      setLocationError("Location services aren't available in this browser.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        mockReverseGeocode(pos.coords.latitude, pos.coords.longitude).then((address) => {
          setFormData((prev) => ({ ...prev, ...address }));
          setLocating(false);
        });
      },
      () => {
        setLocationError("Couldn't access your location. Enter your address manually.");
        setLocating(false);
      }
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-[#1B2A56]">Personal Information</h2>
      <div className="mt-4 border-b border-gray-200" />

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[auto_1fr]">
        <ProfilePictureUploader
          value={formData.profilePicture}
          onChange={(_file, url) => updateField("profilePicture", url)}
        />

        <div className="grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2">
          <Field label="First" required>
            <input className={inputClass} value={formData.firstName} onChange={(e) => updateField("firstName", e.target.value)} placeholder="Juan" />
            {errors.firstName && <p className="mt-1 text-xs text-red-500">{errors.firstName}</p>}
          </Field>
          <Field label="Middle" required>
            <input className={inputClass} value={formData.middleName} onChange={(e) => updateField("middleName", e.target.value)} placeholder="Monilla" />
            {errors.middleName && <p className="mt-1 text-xs text-red-500">{errors.middleName}</p>}
          </Field>

          <Field label="Surname" required>
            <input className={inputClass} value={formData.surname} onChange={(e) => updateField("surname", e.target.value)} placeholder="Dela Cruz" />
            {errors.surname && <p className="mt-1 text-xs text-red-500">{errors.surname}</p>}
          </Field>
          <Field label="Suffix">
            <input className={inputClass} value={formData.suffix} onChange={(e) => updateField("suffix", e.target.value)} placeholder="Jr." />
          </Field>

          <Field label="Email Address" required>
            <input type="email" className={inputClass} value={formData.email} onChange={handleEmailChange} placeholder="juan@email.com" />
            {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
          </Field>
          <Field label="Contact Number" required>
            <input className={inputClass} value={formData.contactNumber} onChange={handleContactChange} placeholder="+63 0000000000" />
            {errors.contactNumber && <p className="mt-1 text-xs text-red-500">{errors.contactNumber}</p>}
          </Field>

          <Field label="House Number" required>
            <input className={inputClass} value={formData.houseNumber} onChange={(e) => updateField("houseNumber", e.target.value)} placeholder="Block 1, Lot 1" />
            {errors.houseNumber && <p className="mt-1 text-xs text-red-500">{errors.houseNumber}</p>}
          </Field>
          <Field label="Street/Subdivision" required>
            <input className={inputClass} value={formData.street} onChange={(e) => updateField("street", e.target.value)} placeholder="Benedict Ville" />
            {errors.street && <p className="mt-1 text-xs text-red-500">{errors.street}</p>}
          </Field>

          <Field label="Baranggay" required>
            <BarangaySelect
              value={formData.barangay}
              onChange={(val) => updateField("barangay", val)}
              options={BARANGAY_OPTIONS}
              placeholder="Brgy. 167"
            />
            {errors.barangay && <p className="mt-1 text-xs text-red-500">{errors.barangay}</p>}
          </Field>
          <Field label="Zip code" required>
            <input className={inputClass} value={formData.zipCode} onChange={(e) => updateField("zipCode", e.target.value)} placeholder="1400" />
            {errors.zipCode && <p className="mt-1 text-xs text-red-500">{errors.zipCode}</p>}
          </Field>
        </div>
      </div>

      {locationError && <p className="mt-4 text-sm text-red-500">{locationError}</p>}
      {saved && <p className="mt-4 text-sm font-medium text-emerald-600">Changes saved.</p>}

      <div className="mt-8 flex justify-end gap-3">
        <button
          type="button"
          onClick={handleUseCurrentLocation}
          disabled={locating}
          className="flex items-center gap-2 rounded-md bg-[#1B2A56] px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
            <path d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5Z" />
          </svg>
          {locating ? "Locating…" : "Use Current Location"}
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="rounded-md bg-sky-500 px-6 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save Changes"}
        </button>
      </div>
    </div>
  );
}