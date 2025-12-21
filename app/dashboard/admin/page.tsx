"use client";

import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

/* ================= TYPES ================= */

type AdminStats = {
  total_users: number;
  patients: number;
  doctors: number;
  medvault_records: number;
  ai_predictions: number;
  pending_predictions: number;
  verified_predictions: number;
  rejected_predictions: number;
};

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

/* ================= PAGE ================= */

export default function AdminDashboardPage() {
  const { user, token, loading } = useAuth();
  const router = useRouter();

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [healthAI, setHealthAI] = useState<HealthAIActivity[]>([]);
  const [medvault, setMedvault] = useState<MedVaultActivity[]>([]);
  const [error, setError] = useState("");

  /* 🔐 ADMIN GUARD */
  useEffect(() => {
    if (!loading && user?.role !== "ADMIN") {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  /* 📊 FETCH DATA */
  useEffect(() => {
    if (!token || user?.role !== "ADMIN") return;

    const fetchAll = async () => {
      try {
        const [statsRes, aiRes, mvRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/stats`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/recent/healthai`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/recent/medvault`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (!statsRes.ok) throw new Error("Stats failed");

        setStats(await statsRes.json());
        setHealthAI(await aiRes.json());
        setMedvault(await mvRes.json());
      } catch {
        setError("Failed to load admin monitoring data");
      }
    };

    fetchAll();
  }, [token, user]);

  if (loading || !user) return null;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!stats) return <p>Loading admin dashboard...</p>;

  /* ================= UI ================= */

  return (
    <div className="space-y-10">
      <h1 className="text-2xl font-bold">🛡️ Admin Monitoring Dashboard</h1>

      {/* ================= STATS ================= */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard label="Total Users" value={stats.total_users} />
        <StatCard label="Patients" value={stats.patients} />
        <StatCard label="Doctors" value={stats.doctors} />
        <StatCard label="MedVault Records" value={stats.medvault_records} />
        <StatCard label="AI Predictions" value={stats.ai_predictions} />
        <StatCard label="Pending AI" value={stats.pending_predictions} />
        <StatCard label="Verified AI" value={stats.verified_predictions} />
        <StatCard label="Rejected AI" value={stats.rejected_predictions} />
      </div>

      {/* ================= HEALTHAI ACTIVITY ================= */}
      <section>
        <h2 className="text-xl font-semibold mb-4">
          🧠 Recent HealthAI Activity
        </h2>

        <ActivityTable
          headers={["Prediction ID", "Patient ID", "Status", "Created"]}
          rows={healthAI.map((r) => [
            r.prediction_id,
            r.patient_id,
            r.status,
            new Date(r.created_at).toLocaleString(),
          ])}
        />
      </section>

      {/* ================= MEDVAULT ACTIVITY ================= */}
      <section>
        <h2 className="text-xl font-semibold mb-4">
          📁 Recent MedVault Activity
        </h2>

        <ActivityTable
          headers={["Record ID", "Patient ID", "Type", "Created"]}
          rows={medvault.map((r) => [
            r.record_id,
            r.patient_id,
            r.record_type,
            new Date(r.created_at).toLocaleString(),
          ])}
        />
      </section>
    </div>
  );
}

/* ================= COMPONENTS ================= */

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-white p-5 rounded shadow">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-2xl font-bold mt-2">{value}</p>
    </div>
  );
}

function ActivityTable({
  headers,
  rows,
}: {
  headers: string[];
  rows: string[][];
}) {
  if (rows.length === 0) {
    return <p className="text-gray-500">No recent activity</p>;
  }

  return (
    <div className="overflow-x-auto bg-white rounded shadow">
      <table className="w-full text-sm">
        <thead className="bg-gray-100">
          <tr>
            {headers.map((h) => (
              <th key={h} className="p-3 text-left">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-t">
              {row.map((cell, j) => (
                <td key={j} className="p-3">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
