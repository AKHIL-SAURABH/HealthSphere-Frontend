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
  doctor_verified: "VERIFIED" | "REJECTED" | "NO" | "YES";
  doctor_notes?: string | null;
  results: Result[];
  created_at: string;
};

export default function HealthAIPage() {
  const { token, user, loading } = useAuth();
  const router = useRouter();

  /* =========================
     🔐 ROLE GUARD
     ========================= */
  useEffect(() => {
    if (!loading && user?.role === "DOCTOR") {
      router.replace("/dashboard/healthai/doctor");
    }
  }, [user, loading, router]);

  if (loading || !user) return null;

  /* ================= Upload state ================= */
  const [file, setFile] = useState<File | null>(null);
  const [results, setResults] = useState<Result[]>([]);
  const [note, setNote] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  /* ================= History state ================= */
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  /* ================= Upload X-ray ================= */
  const handleUpload = async () => {
    if (!file || !token || uploading) return;

    setUploading(true);
    setError("");
    setResults([]);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/healthai/predict`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        }
      );

      if (!res.ok) throw new Error();

      const data = await res.json();
      setResults(data.results || []);
      setNote(data.note || "");

      await fetchHistory();
    } catch {
      setError("Failed to analyze X-ray");
    } finally {
      setUploading(false);
    }
  };

  /* ================= Fetch history ================= */
  const fetchHistory = async () => {
    if (!token) return;

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/healthai/my-predictions`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) throw new Error();

      const data = await res.json();
      setPredictions(data || []);
    } catch {
      console.error("Failed to fetch HealthAI history");
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
    // eslint-disable-next-line
  }, []);

  /* ================= STATUS LABEL ================= */
  const renderStatus = (status: string) => {
    if (status === "VERIFIED" || status === "YES") {
      return <span className="text-green-600">✅ Verified</span>;
    }
    if (status === "REJECTED") {
      return <span className="text-red-600">❌ Rejected</span>;
    }
    return <span className="text-yellow-600">⏳ Pending</span>;
  };

  return (
    <div className="space-y-10">
      <h1 className="text-2xl font-bold">🧠 HealthAI — X-ray Analysis</h1>

      {/* Upload */}
      <div className="bg-white p-6 rounded shadow max-w-lg">
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="mb-4"
        />

        <button
          onClick={handleUpload}
          disabled={uploading || !file}
          className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {uploading ? "Analyzing..." : "Upload X-ray"}
        </button>

        {error && <p className="text-red-500 mt-3">{error}</p>}
      </div>

      {/* History */}
      <div>
        <h2 className="text-xl font-semibold mb-4">
          📋 Previous X-ray Reports
        </h2>

        {historyLoading ? (
          <p>Loading history...</p>
        ) : predictions.length === 0 ? (
          <p className="text-gray-500">No X-rays uploaded yet.</p>
        ) : (
          <div className="space-y-6">
            {predictions.map((p) => (
              <div
                key={p.prediction_id}
                className="bg-white p-6 rounded shadow space-y-3"
              >
                <img
                  src={`${process.env.NEXT_PUBLIC_API_BASE_URL}/${p.image_path}`}
                  className="w-48 border rounded"
                  alt="X-ray"
                />

                <p className="font-medium">
                  Doctor Status: {renderStatus(p.doctor_verified)}
                </p>

                {p.doctor_notes && (
                  <div className="bg-green-50 border p-3 rounded">
                    <p className="text-sm font-semibold text-green-700">
                      🧑‍⚕️ Doctor Remarks
                    </p>
                    <p className="text-sm mt-1 text-gray-700">
                      {p.doctor_notes}
                    </p>
                  </div>
                )}

                <ul className="text-sm space-y-1">
                  {p.results.map((r, i) => (
                    <li key={i} className="flex justify-between">
                      <span>{r.disease}</span>
                      <span>
                        {(r.confidence * 100).toFixed(1)}%
                      </span>
                    </li>
                  ))}
                </ul>

                <p className="text-xs text-gray-500">
                  Uploaded: {new Date(p.created_at).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
