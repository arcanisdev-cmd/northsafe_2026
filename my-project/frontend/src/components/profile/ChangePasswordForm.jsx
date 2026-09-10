import { useState, useMemo } from "react";
const inputClass =
  "w-full rounded-md border border-gray-200 bg-gray-100 px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-[#1B2A56] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#1B2A56]";

function Field({ label, required, hint, children }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-semibold text-gray-800">
        {label}{" "}
        {hint && <span className="font-normal text-gray-400">{hint}</span>}{" "}
        {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}

const REQUIREMENTS = [
  { key: "length", label: "8+ characters", test: (pw) => pw.length >= 8 },
  { key: "upper", label: "Uppercase (A-Z)", test: (pw) => /[A-Z]/.test(pw) },
  { key: "lower", label: "Lowercase (a-z)", test: (pw) => /[a-z]/.test(pw) },
  { key: "number", label: "Number (0-9)", test: (pw) => /[0-9]/.test(pw) },
  { key: "special", label: "Special character", test: (pw) => /[^A-Za-z0-9]/.test(pw) },
];

function checkRequirements(pw) {
  return REQUIREMENTS.map((r) => ({ ...r, met: r.test(pw) }));
}

function validate({ currentPassword, newPassword, confirmPassword }) {
  const errors = {};
  const allMet = checkRequirements(newPassword).every((r) => r.met);

  if (!currentPassword) errors.currentPassword = "Required";

  if (!newPassword) {
    errors.newPassword = "Required";
  } else if (!allMet) {
    errors.newPassword = "Password doesn't meet all requirements";
  } else if (currentPassword && newPassword === currentPassword) {
    errors.newPassword = "New password must be different from current password";
  }

  if (!confirmPassword) {
    errors.confirmPassword = "Required";
  } else if (newPassword && confirmPassword !== newPassword) {
    errors.confirmPassword = "Passwords don't match";
  }

  return errors;
}

// Mock async save — replace with a real API call once the backend is wired in.
// Kept deliberately similar in shape to mockReverseGeocode in PersonalInformationForm.jsx.
function mockChangePassword({ currentPassword, newPassword }) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (currentPassword !== "password123") {
        reject(new Error("Current password is incorrect."));
        return;
      }
      resolve({ passwordUpdatedAt: new Date().toISOString() });
    }, 1000);
  });
}

function InfoIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 text-[#1B2A56]">
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-11.5a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM9 9a1 1 0 000 2h.01a1 1 0 100-2H9zm.25 3a.75.75 0 00-.75.75v2.5a.75.75 0 001.5 0v-2.5a.75.75 0 00-.75-.75z"
        clipRule="evenodd"
        
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5 shrink-0 text-emerald-500">
      <path
        fillRule="evenodd"
        d="M16.704 5.29a1 1 0 010 1.415l-7.25 7.25a1 1 0 01-1.414 0l-3.25-3.25a1 1 0 111.414-1.414l2.543 2.543 6.543-6.543a1 1 0 011.414 0z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function DotIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5 shrink-0 text-red-400">
      <circle cx="10" cy="10" r="4" />
    </svg>
  );
}

export default function ChangePasswordForm({ user, onUpdateUser }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const requirementResults = useMemo(() => checkRequirements(newPassword), [newPassword]);

  function makeChangeHandler(setter, field) {
    return (e) => {
      setter(e.target.value);
      setErrors((prev) => ({ ...prev, [field]: undefined }));
      setFormError("");
    };
  }

  function resetFields() {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  }

  function handleCancel() {
    resetFields();
    setErrors({});
    setFormError("");
  }

  function handleSave() {
    const nextErrors = validate({ currentPassword, newPassword, confirmPassword });
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSaving(true);
    setSaved(false);
    setFormError("");

    // TODO: replace with a real POST/PATCH to the change-password endpoint once Laravel is wired in
    mockChangePassword({ currentPassword, newPassword })
      .then(({ passwordUpdatedAt }) => {
        onUpdateUser?.((prev) => ({ ...prev, passwordUpdatedAt }));
        resetFields();
        setSaving(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      })
      .catch((err) => {
        setSaving(false);
        setFormError(err.message || "Something went wrong. Please try again.");
      });
  }

  const lastUpdatedLabel = user?.passwordUpdatedAt
    ? new Date(user.passwordUpdatedAt).toLocaleDateString("en-US", {
        month: "numeric",
        day: "numeric",
        year: "numeric",
      })
    : null;

  return (
    <div>
      <h2 className="text-2xl font-bold text-[#1B2A56]">Change Password</h2>
      <p className="mt-1 text-sm text-gray-500">
        You'll use this password to log into your account. Use at least 8 letters, numbers, and special characters.
      </p>
      <div className="mt-4 border-b border-gray-200" />

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_280px]">
        <div className="flex flex-col gap-5">
          <Field
            label="Current Password"
            required
            hint={lastUpdatedLabel ? `(Updated last ${lastUpdatedLabel})` : undefined}
          >
            <input
              type="password"
              autoComplete="current-password"
              className={inputClass}
              value={currentPassword}
              onChange={makeChangeHandler(setCurrentPassword, "currentPassword")}
            />
            {errors.currentPassword && <p className="mt-1 text-xs text-red-500">{errors.currentPassword}</p>}
          </Field>

          <Field label="New Password" required>
            <input
              type="password"
              autoComplete="new-password"
              className={inputClass}
              value={newPassword}
              onChange={makeChangeHandler(setNewPassword, "newPassword")}
            />
            {errors.newPassword && <p className="mt-1 text-xs text-red-500">{errors.newPassword}</p>}
          </Field>

          <Field label="Re-type New Password" required>
            <input
              type="password"
              autoComplete="new-password"
              className={inputClass}
              value={confirmPassword}
              onChange={makeChangeHandler(setConfirmPassword, "confirmPassword")}
            />
            {errors.confirmPassword && <p className="mt-1 text-xs text-red-500">{errors.confirmPassword}</p>}
          </Field>

          <button type="button" className="w-fit text-sm font-medium text-sky-600 hover:underline">
            Forgot Password?
          </button>
        </div>

        <div className="h-fit rounded-lg bg-indigo-50 p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-800">
            <InfoIcon />
            Password Requirements
          </div>
          <ul className="mt-3 flex flex-col gap-2">
            {requirementResults.map((req) => (
              <li
                key={req.key}
                className={`flex items-center gap-2 text-xs font-medium ${
                  req.met ? "text-emerald-600" : "text-red-500"
                }`}
              >
                {req.met ? <CheckIcon /> : <DotIcon />}
                {req.label}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {formError && <p className="mt-4 text-sm font-medium text-red-500">{formError}</p>}
      {saved && <p className="mt-4 text-sm font-medium text-emerald-600">Password changed.</p>}

      <div className="mt-8 flex justify-end gap-3">
        <button
          type="button"
          onClick={handleCancel}
          disabled={saving}
          className="rounded-md bg-gray-200 px-6 py-2.5 text-sm font-semibold text-gray-500 transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          Cancel
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