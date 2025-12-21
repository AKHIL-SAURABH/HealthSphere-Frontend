"use client";

import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type HealthAIActivity = {
  prediction_id: string;
  patient_id: string;
  status: string;
  created_at: string;
};

type MedVaultActivity = {
  record_id: string;
  patient_id: string;
  record_type: string;
  created_at: string;
};

export default function AdminAuditLogsPage() {
  const { user, token, loading } = useAuth();
  const router = useRouter();

  const [healthAI, setHealthAI] = useState<HealthAIActivity[]>([]);
  const [medvault, setMedVault] = useState<MedVaultActivity[]>([]);
  const [pageLoading, setPageLoading] = useState(true);

  /* =========================
     🔐 ADMIN GUARD
     ========================= */
  useEffect(() => {
    if (!loading && user?.role !== "ADMIN") {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  /* =========================
     📥 FETCH AUDIT LOGS
     ========================= */
  useEffect(() => {
    if (!token || user?.role !== "ADMIN") return;

    const fetchLogs = async () => {
      try {
        const [healthRes, medvaultRes] = await Promise.all([
          fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/recent/healthai`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          ),
          fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/recent/medvault`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          ),
        ]);

        const healthData = await healthRes.json();
        const medvaultData = await medvaultRes.json();

        setHealthAI(healthData || []);
        setMedVault(medvaultData || []);
      } catch {
        console.error("Failed to load audit logs");
      } finally {
        setPageLoading(false);
      }
    };

    fetchLogs();
  }, [token, user]);

  if (loading || pageLoading || !user) return null;

  return (
    <div className="space-y-10">
      <h1 className="text-2xl font-bold">📜 Admin Audit Logs</h1>

      {/* ================= HealthAI Logs ================= */}
      <div>
        <h2 className="text-xl font-semibold mb-4">
          🧠 Recent HealthAI Activity
        </h2>

        {healthAI.length === 0 ? (
          <p className="text-gray-500">No HealthAI activity.</p>
        ) : (
          <div className="bg-white rounded shadow overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-3 text-left">Prediction ID</th>
                  <th className="p-3 text-left">Patient ID</th>
                  <th className="p-3 text-left">Status</th>
                  <th className="p-3 text-left">Time</th>
                </tr>
              </thead>
              <tbody>
                {healthAI.map((h) => (
                  <tr key={h.prediction_id} className="border-t">
                    <td className="p-3">{h.prediction_id}</td>
                    <td className="p-3">{h.patient_id}</td>
                    <td className="p-3 font-medium">{h.status}</td>
                    <td className="p-3">
                      {new Date(h.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ================= MedVault Logs ================= */}
      <div>
        <h2 className="text-xl font-semibold mb-4">
          📁 Recent MedVault Activity
        </h2>

        {medvault.length === 0 ? (
          <p className="text-gray-500">No MedVault activity.</p>
        ) : (
          <div className="bg-white rounded shadow overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-3 text-left">Record ID</th>
                  <th className="p-3 text-left">Patient ID</th>
                  <th className="p-3 text-left">Type</th>
                  <th className="p-3 text-left">Time</th>
                </tr>
              </thead>
              <tbody>
                {medvault.map((m) => (
                  <tr key={m.record_id} className="border-t">
                    <td className="p-3">{m.record_id}</td>
                    <td className="p-3">{m.patient_id}</td>
                    <td className="p-3">{m.record_type}</td>
                    <td className="p-3">
                      {new Date(m.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
