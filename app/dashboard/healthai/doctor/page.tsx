"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

type Result = {
  disease: string;
  confidence: number;
};

type Prediction = {
  prediction_id: string;
  image_path: string;
  results: Result[];
  created_at: string;
};

export default function DoctorHealthAIPage() {
  const { user, token, loading } = useAuth();
  const router = useRouter();

  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [pageLoading, setPageLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  /* =========================
     🔐 Doctor-only access
     ========================= */
  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
      return;
    }

    if (!loading && user?.role !== "DOCTOR") {
      router.replace("/dashboard");
    }
  }, [user, loading, router]);

  /* =========================
     📥 Fetch pending predictions
     ========================= */
  useEffect(() => {
    if (!token) return;

    const fetchPredictions = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/healthai/pending`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!res.ok) throw new Error("Fetch failed");

        const data = await res.json();
        setPredictions(data || []);
      } catch (err) {
        console.error("Failed to fetch predictions");
      } finally {
        setPageLoading(false);
      }
    };

    fetchPredictions();
  }, [token]);

  /* =========================
     ✅ Verify / Reject
     ========================= */
  const handleAction = async (
    predictionId: string,
    action: "VERIFIED" | "REJECTED"
  ) => {
    if (!token || actionLoading) return;

    setActionLoading(predictionId);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/healthai/verify/${predictionId}?action=${action}&notes=${encodeURIComponent(
          notes[predictionId] || ""
        )}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) throw new Error("Action failed");

      // Remove verified/rejected prediction from UI
      setPredictions((prev) =>
        prev.filter((p) => p.prediction_id !== predictionId)
      );
    } catch {
      alert("Failed to update prediction status");
    } finally {
      setActionLoading(null);
    }
  };

  if (loading || pageLoading) {
    return <p className="text-gray-500">Loading AI predictions...</p>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">
        🧑‍⚕️ HealthAI — Doctor Verification
      </h1>

      {predictions.length === 0 ? (
        <p className="text-gray-500">No pending predictions.</p>
      ) : (
        predictions.map((p) => (
          <div
            key={p.prediction_id}
            className="bg-white p-6 rounded shadow space-y-4"
          >
            {/* X-ray Image */}
            <img
              src={`${process.env.NEXT_PUBLIC_API_BASE_URL}/${p.image_path}`}
              alt="X-ray"
              className="w-64 border rounded"
            />

            {/* AI Results */}
            <ul className="text-sm space-y-1">
              {p.results.map((r, i) => (
                <li key={i} className="flex justify-between">
                  <span>{r.disease}</span>
                  <span>{(r.confidence * 100).toFixed(1)}%</span>
                </li>
              ))}
            </ul>

            {/* Doctor Notes */}
            <textarea
              placeholder="Doctor remarks..."
              className="w-full border rounded p-2"
              value={notes[p.prediction_id] || ""}
              onChange={(e) =>
                setNotes((prev) => ({
                  ...prev,
                  [p.prediction_id]: e.target.value,
                }))
              }
            />

            {/* Actions */}
            <div className="flex gap-4">
              <button
                onClick={() =>
                  handleAction(p.prediction_id, "VERIFIED")
                }
                disabled={actionLoading === p.prediction_id}
                className="bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50"
              >
                ✅ Verify
              </button>

              <button
                onClick={() =>
                  handleAction(p.prediction_id, "REJECTED")
                }
                disabled={actionLoading === p.prediction_id}
                className="bg-red-600 text-white px-4 py-2 rounded disabled:opacity-50"
              >
                ❌ Reject
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
