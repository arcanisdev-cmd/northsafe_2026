// jb false pa async call neto 'di ko gagalawin backend ikaw n magayos
const USE_MOCK_API = true;
const MOCK_NEARBY = false; 
const API_BASE = "/api/reports";

export class SubmitError extends Error {
  constructor(code, message) {
    super(message);
    this.code = code;
  }
}

const authHeaders = () => ({}); // TODO: add the auth token header once real auth exists

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function findNearbyReports({ lat, lng, category, signal }) {
  if (USE_MOCK_API) {
    if (!MOCK_NEARBY) return [];
    await wait(400);
    return [
      { id: "NS-MOCK-0001", title: "Knee-deep flood near the barangay hall", distance_m: 40, status: "Under review" },
    ];
  }
  try {
    const qs = new URLSearchParams({ lat: String(lat), lng: String(lng), category });
    const res = await fetch(API_BASE + "/nearby?" + qs.toString(), {
      signal,
      headers: { Accept: "application/json", ...authHeaders() },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : data.data ?? [];
  } catch {
    return [];
  }
}

export async function submitReport(formData) {
  if (USE_MOCK_API) {
    await wait(1200);
    return { id: "NS-MOCK-" + String(Math.floor(Math.random() * 900000) + 100000), status: "Submitted" };
  }
  let res;
  try {
    res = await fetch(API_BASE, {
      method: "POST",
      body: formData,
      headers: { Accept: "application/json", ...authHeaders() },
    });
  } catch {
    throw new SubmitError("network", "No connection. Your draft is saved on this device. Try again when you are back online.");
  }
  let data = null;
  try {
    data = await res.json();
  } catch {
    /* non-JSON response */
  }
  if (res.ok) {
    const body = data?.data ?? data ?? {};
    return { id: body.report_id ?? body.id ?? body.reference ?? "", status: body.status ?? "Submitted" };
  }
  const firstInvalid = data?.errors ? Object.values(data.errors).flat()[0] : null;
  if (res.status === 401) throw new SubmitError("auth", "Please sign in again to submit your report.");
  if (res.status === 403 && data?.code === "phone_not_verified") throw new SubmitError("phone", "Please verify your phone number before reporting.");
  if (res.status === 413) throw new SubmitError("size", "Your photo is too large. Try a smaller one.");
  if (res.status === 422) throw new SubmitError("invalid", firstInvalid || data?.message || "Some details are missing or invalid.");
  if (res.status === 429) throw new SubmitError("limit", "You have reached the report limit for now. Please try again later.");
  throw new SubmitError("server", data?.message || "Something went wrong on our side. Please try again.");
}