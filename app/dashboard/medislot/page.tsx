"use client";

import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";

type Doctor = {
  doctor_id: string;
  name: string;
  specialization: string;
};

type Appointment = {
  id: string;
  doctor_id: string;
  appointment_date: string;
  appointment_time: string;
  status: "PENDING" | "APPROVED" | "CANCELLED" | "COMPLETED";
};

export default function PatientMediSlotPage() {
  const { token } = useAuth();

  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  /* ================= FETCH DOCTORS ================= */
  const fetchDoctors = async () => {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/doctors`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setDoctors(await res.json());
  };

  /* ================= FETCH MY APPOINTMENTS ================= */
  const fetchMyAppointments = async () => {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/medislot/my-appointments`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setAppointments(await res.json());
  };

  useEffect(() => {
    if (!token) return;
    fetchDoctors();
    fetchMyAppointments();
  }, [token]);

  /* ================= HELPERS ================= */
  const getAppointmentForDoctor = (doctorId: string) =>
    appointments.find(a => a.doctor_id === doctorId);

  const isBlocked = (status?: Appointment["status"]) =>
    status === "PENDING" || status === "APPROVED";

  /* ================= BOOK APPOINTMENT ================= */
  const bookAppointment = async () => {
    if (!selectedDoctor || !date || !time) {
      setMessage("Please select date and time");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/medislot/appointments?doctor_id=${selectedDoctor.doctor_id}&appointment_date=${date}&appointment_time=${time}`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail);

      setMessage("📨 Appointment request sent");
      setSelectedDoctor(null);
      setDate("");
      setTime("");
      await fetchMyAppointments();
    } catch (err: any) {
      setMessage(err.message || "Request failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-10">
      <h1 className="text-2xl font-bold">
        📅 MediSlot — Patient Appointments
      </h1>

      {/* ================= DOCTOR LIST ================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {doctors.map(doc => {
          const appt = getAppointmentForDoctor(doc.doctor_id);

          return (
            <div
              key={doc.doctor_id}
              className="bg-white p-6 rounded shadow space-y-3"
            >
              <h2 className="font-semibold text-lg">{doc.name}</h2>
              <p className="text-sm text-gray-600">
                {doc.specialization || "General"}
              </p>

              {/* STATUS */}
              {appt ? (
                <p
                  className={`text-sm font-medium ${
                    appt.status === "PENDING"
                      ? "text-yellow-600"
                      : appt.status === "APPROVED"
                      ? "text-green-600"
                      : appt.status === "CANCELLED"
                      ? "text-red-600"
                      : "text-blue-600"
                  }`}
                >
                  {appt.status === "PENDING" && "⏳ Pending approval"}
                  {appt.status === "APPROVED" && "✅ Approved"}
                  {appt.status === "CANCELLED" && "❌ Rejected"}
                  {appt.status === "COMPLETED" && "✔ Completed"}
                </p>
              ) : (
                <p className="text-sm text-gray-500">No appointment</p>
              )}

              {/* ACTION */}
              <button
                disabled={isBlocked(appt?.status)}
                onClick={() => setSelectedDoctor(doc)}
                className="mt-2 bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
              >
                {appt
                  ? appt.status === "CANCELLED"
                    ? "Book Again"
                    : appt.status
                  : "Request Appointment"}
              </button>
            </div>
          );
        })}
      </div>

      {/* ================= APPOINTMENT HISTORY ================= */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">📋 My Appointment History</h2>

        {appointments.length === 0 ? (
          <p className="text-gray-500">No appointments yet.</p>
        ) : (
          appointments.map(a => (
            <div
              key={a.id}
              className="bg-white p-4 rounded shadow text-sm"
            >
              <p>Date: {a.appointment_date}</p>
              <p>Time: {a.appointment_time}</p>
              <p>Status: {a.status}</p>
            </div>
          ))
        )}
      </div>

      {/* ================= BOOK MODAL ================= */}
      {selectedDoctor && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded w-full max-w-md space-y-4">
            <h2 className="text-lg font-bold">
              Request appointment with Dr. {selectedDoctor.name}
            </h2>

            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="w-full border p-2 rounded"
            />

            <input
              type="time"
              value={time}
              onChange={e => setTime(e.target.value)}
              className="w-full border p-2 rounded"
            />

            {message && (
              <p className="text-sm text-center font-medium">
                {message}
              </p>
            )}

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setSelectedDoctor(null)}
                className="border px-4 py-2 rounded"
              >
                Cancel
              </button>

              <button
                onClick={bookAppointment}
                disabled={loading}
                className="bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50"
              >
                {loading ? "Sending..." : "Send Request"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
