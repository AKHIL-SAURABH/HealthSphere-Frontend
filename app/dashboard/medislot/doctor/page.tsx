"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";

type Appointment = {
  id: string;
  appointment_date: string;
  appointment_time: string;
  status: string;
};

export default function DoctorMediSlotPage() {
  const { token } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  // ================= Fetch Appointments =================
  const fetchAppointments = async () => {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/medislot/doctor/appointments`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await res.json();
    setAppointments(data);
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  // ================= Update Status =================
  const updateStatus = async (
    id: string,
    status: "APPROVED" | "CANCELLED"
  ) => {
    await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/medislot/appointments/${id}/status?status=${status}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    fetchAppointments();
  };

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">
        🧑‍⚕️ MediSlot — Doctor Dashboard
      </h1>

      {appointments.length === 0 ? (
        <p className="text-gray-500">No appointments.</p>
      ) : (
        <div className="space-y-4">
          {appointments.map((a) => (
            <div
              key={a.id}
              className="bg-white p-6 rounded shadow space-y-3"
            >
              <p>Date: {a.appointment_date}</p>
              <p>Time: {a.appointment_time}</p>
              <p>Status: {a.status}</p>

              {a.status === "PENDING" && (
                <div className="flex gap-4">
                  <button
                    onClick={() =>
                      updateStatus(a.id, "APPROVED")
                    }
                    className="bg-green-600 text-white px-4 py-2 rounded"
                  >
                    Approve
                  </button>

                  <button
                    onClick={() =>
                      updateStatus(a.id, "CANCELLED")
                    }
                    className="bg-red-600 text-white px-4 py-2 rounded"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
