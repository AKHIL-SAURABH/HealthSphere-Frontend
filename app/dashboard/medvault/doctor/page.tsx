"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";

type Record = {
  id: string;
  record_type: string;
  file_path: string;
  created_at: string;
  patient_id: string;
};

export default function DoctorMedVaultPage() {
  const { token, user } = useAuth();
  const [records, setRecords] = useState<Record[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role !== "DOCTOR") return;

    const fetchRecords = async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/medvault/doctor/records`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();
      setRecords(data);
      setLoading(false);
    };

    fetchRecords();
  }, [token, user]);

  if (loading) return <p>Loading records...</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">
        🧑‍⚕️ Patient Medical Records
      </h1>

      {records.length === 0 ? (
        <p className="text-gray-600">No records found.</p>
      ) : (
        <div className="space-y-4">
          {records.map((record) => (
            <div
              key={record.id}
              className="border p-4 rounded shadow-sm flex justify-between items-center"
            >
              <div>
                <p className="font-semibold">{record.record_type}</p>
                <p className="text-sm text-gray-500">
                  Patient ID: {record.patient_id}
                </p>
                <p className="text-sm text-gray-400">
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
  );
}
