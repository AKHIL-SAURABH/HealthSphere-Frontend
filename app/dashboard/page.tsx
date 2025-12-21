"use client";

import { useAuth } from "@/context/AuthContext";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();

  // 🔐 Protect route
useEffect(() => {
  if (!loading && !user) {
    router.push("/login");
  }
}, [user, loading, router]);




  // ⏳ Prevent UI flash & crashes
  if (loading || !user) return null;

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-5xl mx-auto bg-white rounded shadow p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">
              Welcome, {user?.role}
            </h1>
            <p className="text-gray-600">Role: {user.role}</p>
          </div>

          <button
            onClick={logout}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Logout
          </button>
        </div>

        <hr className="mb-6" />

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        {user?.role === "PATIENT" && (
        <>
        <DashboardCard
          title="MedVault"
          desc="Upload & view your medical records"
          href="/dashboard/medvault"
        />
        <DashboardCard
          title="HealthAI"
          desc="X-ray disease prediction"
          href="/dashboard/healthai"
        />
      </>
    )}
    {user?.role === "DOCTOR" && (
      <DashboardCard
        title="HealthAI"
        desc="Verify AI predictions"
        href="/dashboard/healthai/doctor"
      />
    )}

    {user?.role === "ADMIN" && (
      <DashboardCard
        title="Admin Panel"
        desc="System control & analytics"
        href="/dashboard/admin"
      />
    )}

    {/* Common */}
    <DashboardCard
      title="MediSlot"
      desc="Appointments & Bed Availability"
      href="/dashboard/medislot"
    />
  </div>
      </div>
    </main>
  );
}

/* ---------------- CARD COMPONENT ---------------- */

function DashboardCard({
  title,
  desc,
  href,
}: {
  title: string;
  desc: string;
  href: string;
}) {
  const router = useRouter();

  return (
    <div
      onClick={() => router.push(href)}
      className="border rounded p-4 hover:shadow transition cursor-pointer bg-white"
    >
      <h2 className="text-lg font-semibold mb-2">{title}</h2>
      <p className="text-gray-600">{desc}</p>
    </div>
  );
}
