import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthNavbar from "../layouts/AuthNavbar";
import DashboardHero from "../sections/DashboardHero";
import SearchFilterBar from "../sections/SearchFilterBar";
import HazardFeed from "../sections/HazardFeed";
import Footer from "../layouts/Footer";

function clearStoredAuth() {
  localStorage.removeItem("northsafe_token");
  localStorage.removeItem("northsafe_user");
  sessionStorage.removeItem("northsafe_token");
  sessionStorage.removeItem("northsafe_user");
}

function formatDateTime(date) {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const year = date.getFullYear();
  const hours24 = date.getHours();
  const hours12 = hours24 % 12 || 12;
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const suffix = hours24 >= 12 ? "PM" : "AM";

  return `${month}/${day}/${year} ${String(hours12).padStart(2, "0")}:${minutes}${suffix}`;
}

function formatTimeAgo(dateValue) {
  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "just now";
  }

  const minutes = Math.max(1, Math.round((Date.now() - date.getTime()) / 60000));
  if (minutes < 60) {
    return `${minutes} min${minutes === 1 ? "" : "s"} ago`;
  }

  const hours = Math.round(minutes / 60);
  if (hours < 24) {
    return `${hours} hr${hours === 1 ? "" : "s"} ago`;
  }

  const days = Math.round(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

function normalizeReport(report) {
  const createdAt = report.createdAt ?? report.created_at ?? new Date().toISOString();
  const createdDate = new Date(createdAt);

  return {
    id: report.id,
    reporterName: report.reporterName ?? "NorthSafe User",
    timeAgo: report.timeAgo ?? formatTimeAgo(createdDate),
    alertLevel: report.alertLevel ?? "blue",
    hazardType: report.hazardType ?? "",
    title: report.title ?? "Untitled Report",
    description: report.description ?? "",
    address: report.address ?? report.locationName ?? "",
    dateTime: report.dateTime ?? formatDateTime(createdDate),
    verified: Array.isArray(report.statusHistory)
      ? report.statusHistory.some((status) => status.status === "Verified")
      : false,
    upvotes: report.upvotes ?? 0,
    downvotes: report.downvotes ?? 0,
    comments: report.comments ?? 0,
    imageSrc: report.imageSrc ?? report.imageUrl ?? null,
  };
}

function DashboardPage() {
  const navigate = useNavigate();
  const apiBaseUrl = import.meta.env.VITE_API_URL ?? "";
  const [user, setUser] = useState(null);
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("northsafe_token") ?? sessionStorage.getItem("northsafe_token");

    if (!token) {
      navigate("/signin");
      return;
    }

    const controller = new AbortController();

    async function loadDashboardData() {
      setIsLoading(true);

      try {
        const [meResponse, reportsResponse] = await Promise.all([
          fetch(`${apiBaseUrl}/api/me`, {
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${token}`,
            },
            signal: controller.signal,
          }),
          fetch(`${apiBaseUrl}/api/reports`, {
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${token}`,
            },
            signal: controller.signal,
          }),
        ]);

        if (meResponse.status === 401 || reportsResponse.status === 401) {
          clearStoredAuth();
          navigate("/signin");
          return;
        }

        const meData = await meResponse.json();
        const reportsData = await reportsResponse.json();

        if (meResponse.ok) {
          setUser(meData?.user ?? null);
        }

        if (reportsResponse.ok) {
          setReports((reportsData?.reports ?? []).map(normalizeReport));
        }
      } catch (error) {
        if (error.name !== "AbortError") {
          setUser(null);
          setReports([]);
        }
      } finally {
        setIsLoading(false);
      }
    }

    loadDashboardData();

    return () => controller.abort();
  }, [apiBaseUrl, navigate]);

  const userName = useMemo(
    () => user?.fullName ?? user?.name ?? "NorthSafe User",
    [user]
  );

  const weather = useMemo(
    () => ({
      condition: "Partly Cloudy",
      temp: 30,
      date: new Date().toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      }),
      location: user?.barangay ? `${user.barangay}, Caloocan City` : "Caloocan City",
    }),
    [user]
  );

  return (
    <div className="overflow-x-hidden">
      <div className="max-w-[1532px] mx-auto">
        <AuthNavbar />
        <DashboardHero />
        <SearchFilterBar userName={userName} />
        {isLoading ? (
          <section className="px-[100px] py-10">
            <div className="bg-white rounded-2xl p-8 text-center text-gray-400 text-sm">
              Loading dashboard data...
            </div>
          </section>
        ) : (
          <HazardFeed reports={reports} user={user} weather={weather} />
        )}
        <Footer />
      </div>
    </div>
  );
}

export default DashboardPage;