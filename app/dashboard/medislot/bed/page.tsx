"use client";

import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";

type Bed = {
  id: string;
  ward: string;
  bed_number: string;
  is_available: boolean;
};

type MyBed = {
  status: "NONE" | "REQUESTED" | "ACTIVE" | "REJECTED";
  ward?: string;
  bed_number?: string;
  allocated_at?: string;
};

export default function PatientBedPage() {
  const { token } = useAuth();

  const [beds, setBeds] = useState<Bed[]>([]);
  const [myBed, setMyBed] = useState<MyBed | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  /* ================= FETCH ALL BEDS ================= */
  const fetchBeds = async () => {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/medislot/beds`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    const data = await res.json();
    setBeds(data);
  };

  /* ================= FETCH MY BED ================= */
  const fetchMyBed = async () => {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/medislot/my-bed`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    const data = await res.json();
    setMyBed(data);
  };

  useEffect(() => {
    if (!token) return;

    Promise.all([fetchBeds(), fetchMyBed()]).finally(() =>
      setLoading(false)
    );
  }, [token]);

  /* ================= REQUEST BED ================= */
  const requestBed = async (bedId: string) => {
    setMessage("");

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/medislot/beds/${bedId}/request`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail);

      setMessage("✅ Bed request submitted");
      await fetchMyBed();
      await fetchBeds();
    } catch (err: any) {
      setMessage(err.message || "❌ Failed to request bed");
    }
  };

  if (loading) return <p>Loading bed status...</p>;

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">🛏️ My Bed Allocation</h1>

      {/* ================= MY BED STATUS ================= */}
      <div className="bg-white p-6 rounded shadow max-w-xl">
        <h2 className="font-semibold mb-2">Current Status</h2>

        {myBed?.status === "NONE" && (
          <p className="text-gray-500">No bed requested yet.</p>
        )}

        {myBed?.status === "REQUESTED" && (
          <p className="text-yellow-600 font-medium">
            ⏳ Bed request pending admin approval
          </p>
        )}

        {myBed?.status === "ACTIVE" && (
          <div className="text-green-600 font-medium space-y-1">
            <p>✅ Bed Allocated</p>
            <p>
              Ward: {myBed.ward} — Bed: {myBed.bed_number}
            </p>
          </div>
        )}

        {myBed?.status === "REJECTED" && (
          <p className="text-red-600 font-medium">
            ❌ Bed request rejected
          </p>
        )}
      </div>

      {/* ================= MESSAGE ================= */}
      {message && (
        <p className="font-medium text-sm text-center">{message}</p>
      )}

      {/* ================= BED LIST ================= */}
      <div>
        <h2 className="text-xl font-semibold mb-4">
          🏥 Available Beds
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {beds.map(bed => (
            <div
              key={bed.id}
              className="bg-white p-4 rounded shadow space-y-2"
            >
              <p>
                <strong>Ward:</strong> {bed.ward}
              </p>
              <p>
                <strong>Bed:</strong> {bed.bed_number}
              </p>
              <p
                className={`font-medium ${
                  bed.is_available
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {bed.is_available ? "Available" : "Occupied"}
              </p>

              <button
                disabled={
                  !bed.is_available ||
                  myBed?.status === "REQUESTED" ||
                  myBed?.status === "ACTIVE"
                }
                onClick={() => requestBed(bed.id)}
                className="mt-2 bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
              >
                Request Bed
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
