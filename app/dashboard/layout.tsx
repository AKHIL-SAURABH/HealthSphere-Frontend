"use client";

import { ReactNode } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading) return null;

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md p-6">
        <h2 className="text-xl font-bold mb-6 text-blue-600">
          HealthSphere
        </h2>

        

        <nav className="space-y-4">
        {/* ================= PATIENT ================= */}
          {user?.role === "PATIENT" && (
            <>
              <NavItem label="Dashboard" href="/dashboard" />
              <NavItem label="MedVault" href="/dashboard/medvault" />
              <NavItem label="MediSlot" href="/dashboard/medislot" />
              <NavItem label="Bed Selection" href="/dashboard/medislot/bed" />
              <NavItem label="HealthAI" href="/dashboard/healthai" />
            </>
          )}

          {/* ================= DOCTOR ================= */}
          {user?.role === "DOCTOR" && (
            <>
              <NavItem label="Dashboard" href="/dashboard" />
              <NavItem label="HealthAI" href="/dashboard/healthai" />
              <NavItem label="Doctor MediSlot" href="/dashboard/medislot/doctor" />
            </>
          )}

          {/* ================= ADMIN ================= */}
          {user?.role === "ADMIN" && (
            <>
              <NavItem label="Dashboard" href="/dashboard" />
              <NavItem label="Admin Panel" href="/dashboard/admin" />
              <NavItem label="Users" href="/dashboard/admin/users" />
              <NavItem label="Doctor Approvals" href="/dashboard/admin/doctor_approval"/>
              <NavItem label="Bed Allocation" href="/dashboard/admin/bed-allocation" />
              {/* <NavItem label="MediSlot (Beds)" href="/dashboard/medislot/admin" /> */}
              <NavItem label="Audit Logs" href="/dashboard/admin/audit" />
              <NavItem label="Analytics" href="/dashboard/admin/analytics" />
            </>
          )}
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}

function NavItem({ label, href }: { label: string; href: string }) {
  const router = useRouter();

  return (
    <button
      onClick={() => router.push(href)}
      className="w-full text-left px-3 py-2 rounded hover:bg-blue-100 text-gray-700"
    >
      {label}
    </button>
  );
}
