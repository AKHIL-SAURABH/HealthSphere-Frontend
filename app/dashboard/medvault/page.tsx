"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

type Record = {
  id: string;
  record_type: string;
  file_path: string;
  created_at: string;
};

export default function MedVaultPage() {
  const { token, user, loading } = useAuth();
  const router = useRouter();

  /* =========================
     🔐 ROLE GUARD
     ========================= */
useEffect(() => {
  if (!loading && user?.role !== "PATIENT") {
    router.push("/dashboard");
  }
}, [user, loading, router]);

if (loading || !user) return null;

  /* =========================
     STATE
     ========================= */
  const [file, setFile] = useState<File | null>(null);
  const [recordType, setRecordType] = useState("PRESCRIPTION");
  const [message, setMessage] = useState("");

  const [records, setRecords] = useState<Record[]>([]);
  const [recordsLoading, setRecordsLoading] = useState(true);

  /* =========================
     FETCH RECORDS
     ========================= */
  const fetchRecords = async () => {
    if (!token) return;

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/medvault/records`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) throw new Error("Failed to fetch");

      const data = await res.json();
      setRecords(data || []);
    } catch (err) {
      console.error("Failed to fetch records");
    } finally {
      setRecordsLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [token]);

  /* =========================
     UPLOAD HANDLER
     ========================= */
  const handleUpload = async () => {
    if (!file || !token) {
      setMessage("Please select a file");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/medvault/upload?record_type=${recordType}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (!res.ok) throw new Error();

      setMessage("Record uploaded successfully ✅");
      setFile(null);

      fetchRecords(); // refresh list
    } catch {
      setMessage("Upload failed ❌");
    }
  };

  /* =========================
     UI
     ========================= */
  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">MedVault</h1>

      {/* ================= Upload ================= */}
      <div className="bg-white p-6 rounded shadow max-w-lg">
        <h2 className="text-lg font-semibold mb-4">
          Upload Medical Record
        </h2>

        <label className="block mb-2 font-medium">Record Type</label>
        <select
          value={recordType}
          onChange={(e) => setRecordType(e.target.value)}
          className="w-full border p-2 rounded mb-4"
        >
          <option value="PRESCRIPTION">Prescription</option>
          <option value="REPORT">Report</option>
        </select>

        <input
          type="file"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="mb-4"
        />

        <button
          onClick={handleUpload}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Upload Record
        </button>

        {message && (
          <p className="mt-4 text-sm font-medium">{message}</p>
        )}
      </div>

      <hr />

      {/* ================= Records ================= */}
      <div>
        <h2 className="text-xl font-bold mb-4">
          📁 MedVault Records
        </h2>

        {recordsLoading ? (
          <p>Loading records...</p>
        ) : records.length === 0 ? (
          <p className="text-gray-600">No records uploaded yet.</p>
        ) : (
          <div className="space-y-4">
            {records.map((record) => (
              <div
                key={record.id}
                className="border p-4 rounded shadow-sm flex justify-between items-center"
              >
                <div>
                  <p className="font-semibold">
                    {record.record_type}
                  </p>
                  <p className="text-sm text-gray-500">
                    {new Date(record.created_at).toLocaleString()}
                  </p>
                </div>

                <a
                  href={`${process.env.NEXT_PUBLIC_API_BASE_URL}/${record.file_path}`}
                  target="_blank"
                  className="text-blue-600 hover:underline"
                >
                  Download
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
