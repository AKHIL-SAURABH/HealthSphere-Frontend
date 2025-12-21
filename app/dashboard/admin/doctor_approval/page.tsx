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

export default function DoctorApprovalPage() {
  const { user, token, loading } = useAuth();
  const router = useRouter();

  const [users, setUsers] = useState<User[]>([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState("");

  /* 🔐 ADMIN GUARD */
  useEffect(() => {
    if (!loading && user?.role !== "ADMIN") {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  /* 📥 FETCH USERS */
  useEffect(() => {
    if (!token || user?.role !== "ADMIN") return;

    const fetchUsers = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/users`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!res.ok) throw new Error();
        const data = await res.json();
        setUsers(data);
      } catch {
        setError("Failed to load users");
      } finally {
        setPageLoading(false);
      }
    };

    fetchUsers();
  }, [token, user]);

  /* 🔁 APPROVE / DEMOTE DOCTOR */
  const changeRole = async (userId: string, role: "DOCTOR" | "PATIENT") => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/users/${userId}/role?role=${role}`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) throw new Error();

      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId ? { ...u, role } : u
        )
      );
    } catch {
      alert("Failed to update role");
    }
  };

  if (loading || pageLoading) return null;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">
        🧑‍⚕️ Admin — Doctor Approvals
      </h1>

      <div className="bg-white rounded shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Email</th>
              <th className="p-3 text-left">Role</th>
              <th className="p-3 text-left">Action</th>
            </tr>
          </thead>

          <tbody>
            {users
            .filter((u) => u.role !== "ADMIN")
            .map((u) => (
              <tr key={u.id} className="border-t">
                <td className="p-3">{u.name}</td>
                <td className="p-3">{u.email}</td>
                <td className="p-3 font-medium">{u.role}</td>
                <td className="p-3 space-x-2">
                  {u.role !== "DOCTOR" && (
                    <button
                      onClick={() => changeRole(u.id, "DOCTOR")}
                      className="bg-green-600 text-white px-3 py-1 rounded text-xs"
                    >
                      Approve Doctor
                    </button>
                  )}

                  {u.role === "DOCTOR" && (
                    <button
                      onClick={() => changeRole(u.id, "PATIENT")}
                      className="bg-yellow-600 text-white px-3 py-1 rounded text-xs"
                    >
                      Demote
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
