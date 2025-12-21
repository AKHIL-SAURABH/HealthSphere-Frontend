"use client";

import { useAuth } from "@/context/AuthContext";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminMediSlotPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user?.role !== "ADMIN") {
      router.replace("/dashboard");
    }
  }, [user, loading]);

  if (loading) return null;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">🛏️ Bed Allocation — Admin</h1>
      <p className="text-gray-600">
        Manage hospital beds, allocations, and availability.
      </p>
    </div>
  );
}
