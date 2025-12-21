"use client";

import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type User = {
  id: string;
  name: string;
  email: string;
  role: "PATIENT" | "DOCTOR" | "ADMIN";
};

export default function AdminUsersPage() {
  const { user, token, loading } = useAuth();
  const router = useRouter();

  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  /* =========================
     🔐 ADMIN GUARD
     ========================= */
  useEffect(() => {
    if (!loading && user?.role !== "ADMIN") {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  if (loading || !user) return null;

  /* =========================
     📥 FETCH USERS
     ========================= */
  const fetchUsers = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/users`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) throw new Error();

      const data = await res.json();
      setUsers(data);
    } catch {
      setError("Failed to load users");
    }
  };

  useEffect(() => {
    if (token) fetchUsers();
  }, [token]);

  /* =========================
     🔄 CHANGE ROLE
     ========================= */
  const changeRole = async (userId: string, role: User["role"]) => {
    try {
      setUpdatingId(userId);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/users/${userId}/role?role=${role}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) throw new Error();

      fetchUsers(); // refresh list
    } catch {
      alert("Failed to update role");
    } finally {
      setUpdatingId(null);
    }
  };

  /* =========================
     🖥️ UI
     ========================= */
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">👥 User Management</h1>

      {error && <p className="text-red-500">{error}</p>}

      <div className="overflow-x-auto bg-white rounded shadow">
        <table className="w-full border-collapse">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Email</th>
              <th className="p-3 text-left">Role</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>

          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t">
                <td className="p-3">{u.name}</td>
                <td className="p-3">{u.email}</td>

                <td className="p-3">
                  <span
                    className={`px-3 py-1 rounded text-sm font-medium
                      ${
                        u.role === "ADMIN"
                          ? "bg-purple-100 text-purple-700"
                          : u.role === "DOCTOR"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-green-100 text-green-700"
                      }`}
                  >
                    {u.role}
                  </span>
                </td>

                <td className="p-3 space-x-2">
                  {["PATIENT", "DOCTOR", "ADMIN"].map((r) => (
                    <button
                      key={r}
                      disabled={updatingId === u.id || u.role === r}
                      onClick={() =>
                        changeRole(u.id, r as User["role"])
                      }
                      className="px-3 py-1 text-sm rounded border hover:bg-gray-100 disabled:opacity-50"
                    >
                      Make {r}
                    </button>
                  ))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
