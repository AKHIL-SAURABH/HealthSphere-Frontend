"use client";

import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";

const COLORS = ["#2563eb", "#16a34a", "#dc2626", "#9333ea"];

export default function AdminAnalyticsPage() {
  const { user, token, loading } = useAuth();
  const router = useRouter();

  const [healthDaily, setHealthDaily] = useState<any[]>([]);
  const [healthStatus, setHealthStatus] = useState<any[]>([]);
  const [medvaultDaily, setMedvaultDaily] = useState<any[]>([]);
  const [userRoles, setUserRoles] = useState<any[]>([]);
  const [error, setError] = useState("");

  /* 🔐 ADMIN GUARD */
  useEffect(() => {
    if (!loading && user?.role !== "ADMIN") {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!token) return;

    const fetchAll = async () => {
      try {
        const headers = { Authorization: `Bearer ${token}` };

        const [
          hDaily,
          hStatus,
          mDaily,
          uRoles,
        ] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/analytics/healthai/daily`, { headers }),
          fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/analytics/healthai/status`, { headers }),
          fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/analytics/medvault/daily`, { headers }),
          fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/analytics/users/roles`, { headers }),
        ]);

        setHealthDaily(await hDaily.json());
        setHealthStatus(await hStatus.json());
        setMedvaultDaily(await mDaily.json());
        setUserRoles(await uRoles.json());
      } catch {
        setError("Failed to load analytics data");
      }
    };

    fetchAll();
  }, [token]);

  if (loading || !user) return null;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div className="space-y-10">
      <h1 className="text-2xl font-bold">📊 Admin Analytics</h1>

      {/* HealthAI Daily */}
      <section className="bg-white p-6 rounded shadow">
        <h2 className="font-semibold mb-4">HealthAI — Daily Predictions</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={healthDaily}>
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line dataKey="count" stroke="#2563eb" />
          </LineChart>
        </ResponsiveContainer>
      </section>

      {/* HealthAI Status */}
      <section className="bg-white p-6 rounded shadow">
        <h2 className="font-semibold mb-4">HealthAI — Status</h2>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie data={healthStatus} dataKey="count" nameKey="status" outerRadius={120}>
              {healthStatus.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </section>

      {/* MedVault Daily */}
      <section className="bg-white p-6 rounded shadow">
        <h2 className="font-semibold mb-4">MedVault — Daily Uploads</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={medvaultDaily}>
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#16a34a" />
          </BarChart>
        </ResponsiveContainer>
      </section>

      {/* User Roles */}
      <section className="bg-white p-6 rounded shadow">
        <h2 className="font-semibold mb-4">User Roles</h2>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie data={userRoles} dataKey="count" nameKey="role" outerRadius={120}>
              {userRoles.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </section>
    </div>
  );
}
