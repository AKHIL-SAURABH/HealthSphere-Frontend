"use client";

import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";

type Bed = {
  id: string;
  ward: string;
  bed_number: string;
  is_available: boolean;
};

type BedRequest = {
  allocation_id: string;
  patient_name: string;
  ward: string;
  bed_number: string;
  status: "REQUESTED" | "ACTIVE" | "REJECTED" | "RELEASED";
};

export default function AdminBedAllocationPage() {
  const { token } = useAuth();

  const [beds, setBeds] = useState<Bed[]>([]);
  const [requests, setRequests] = useState<BedRequest[]>([]);

  const [ward, setWard] = useState("");
  const [bedNumber, setBedNumber] = useState("");
  const [loading, setLoading] = useState(false);

  /* ================= FETCH BEDS ================= */
  const fetchBeds = async () => {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/medislot/beds`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setBeds(await res.json());
  };

  /* ================= FETCH REQUESTS ================= */
  const fetchRequests = async () => {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/medislot/bed-requests`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setRequests(await res.json());
  };

  useEffect(() => {
    if (token) {
      fetchBeds();
      fetchRequests();
    }
  }, [token]);

  /* ================= ADD BED ================= */
  const addBed = async () => {
    if (!ward || !bedNumber) return alert("Enter ward and bed number");

    setLoading(true);

    await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/medislot/beds?ward=${ward}&bed_number=${bedNumber}`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    setWard("");
    setBedNumber("");
    setLoading(false);
    fetchBeds();
  };

  /* ================= APPROVE / REJECT ================= */
  const decideRequest = async (
    allocationId: string,
    action: "APPROVE" | "REJECT"
  ) => {
    await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/medislot/bed-requests/${allocationId}/decision?action=${action}`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    fetchBeds();
    fetchRequests();
  };

  /* ================= RELEASE ================= */
  const releaseBed = async (allocationId: string) => {
    await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/medislot/bed-allocations/${allocationId}/release`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    fetchBeds();
    fetchRequests();
  };

  return (
    <div className="space-y-10">
      <h1 className="text-2xl font-bold">🛏️ Admin — Bed Allocation</h1>

      {/* ================= ADD BED ================= */}
      <div className="bg-white p-6 rounded shadow space-y-3 max-w-md">
        <h2 className="font-semibold">Add New Bed</h2>

        <input
          value={ward}
          onChange={(e) => setWard(e.target.value)}
          placeholder="Ward"
          className="border p-2 rounded w-full"
        />

        <input
          value={bedNumber}
          onChange={(e) => setBedNumber(e.target.value)}
          placeholder="Bed Number"
          className="border p-2 rounded w-full"
        />

        <button
          onClick={addBed}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Add Bed
        </button>
      </div>

      {/* ================= BEDS ================= */}
      <div>
        <h2 className="text-xl font-semibold mb-3">All Beds</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {beds.map((b) => (
            <div key={b.id} className="bg-white p-4 rounded shadow">
              <p>Ward: {b.ward}</p>
              <p>Bed: {b.bed_number}</p>
              <p>
                Status:{" "}
                {b.is_available ? (
                  <span className="text-green-600">Available</span>
                ) : (
                  <span className="text-red-600">Occupied</span>
                )}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ================= REQUESTS ================= */}
      <div>
        <h2 className="text-xl font-semibold mb-3">
          Bed Requests & Allocations
        </h2>

        {requests.length === 0 ? (
          <p className="text-gray-500">No requests.</p>
        ) : (
          <div className="space-y-3">
            {requests.map((r) => (
              <div
                key={r.allocation_id}
                className="bg-white p-4 rounded shadow"
              >
                <p>Patient: {r.patient_name}</p>
                <p>
                  Bed: {r.ward} — {r.bed_number}
                </p>
                <p>Status: {r.status}</p>

                <div className="mt-2 space-x-2">
                  {r.status === "REQUESTED" && (
                    <>
                      <button
                        onClick={() =>
                          decideRequest(r.allocation_id, "APPROVE")
                        }
                        className="bg-green-600 text-white px-3 py-1 rounded"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() =>
                          decideRequest(r.allocation_id, "REJECT")
                        }
                        className="bg-red-600 text-white px-3 py-1 rounded"
                      >
                        Reject
                      </button>
                    </>
                  )}

                  {r.status === "ACTIVE" && (
                    <button
                      onClick={() => releaseBed(r.allocation_id)}
                      className="bg-yellow-600 text-white px-3 py-1 rounded"
                    >
                      Release Bed
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
