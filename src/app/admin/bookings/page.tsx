"use client";

import { useState, useEffect } from "react";
import { Clock, Loader2, MessageSquare, Check, X, RotateCcw } from "lucide-react";
import { formatDateLT, bookingStatusLabel, bookingStatusColor, cn } from "@/lib/utils";

interface Booking {
  id: string;
  status: string;
  clientNotes?: string;
  createdAt: string;
  user: { name?: string; email?: string; phone?: string };
  slot: { date: string; startTime: string; endTime: string };
  sessionNote?: { trainerNote?: string; clientNote?: string } | null;
}

const statusOptions = [
  { value: "", label: "Visos" },
  { value: "PENDING", label: "Laukiama" },
  { value: "CONFIRMED", label: "Patvirtinta" },
  { value: "COMPLETED", label: "Įvykdyta" },
  { value: "CANCELLED", label: "Atšaukta" },
];

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("");
  const [noteId, setNoteId] = useState<string | null>(null);
  const [noteText, setNoteText] = useState("");
  const [savingNote, setSavingNote] = useState(false);

  useEffect(() => {
    setLoading(true);
    const qs = filterStatus ? `?status=${filterStatus}` : "";
    fetch(`/api/bookings${qs}`)
      .then((r) => r.json())
      .then(setBookings)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [filterStatus]);

  const handleStatus = async (id: string, status: string) => {
    const res = await fetch(`/api/bookings/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      setBookings((prev) =>
        prev.map((b) => (b.id === id ? { ...b, status } : b))
      );
    }
  };

  const handleSaveNote = async (id: string) => {
    setSavingNote(true);
    await fetch(`/api/bookings/${id}/note`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ trainerNote: noteText }),
    });
    setBookings((prev) =>
      prev.map((b) =>
        b.id === id
          ? { ...b, sessionNote: { ...b.sessionNote, trainerNote: noteText } }
          : b
      )
    );
    setSavingNote(false);
    setNoteId(null);
    setNoteText("");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-900 text-[#0B5C71]">Rezervacijos</h1>
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
          {statusOptions.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setFilterStatus(value)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-600 transition-all",
                filterStatus === value
                  ? "bg-white text-[#0B5C71] shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 gap-3 text-gray-400">
          <Loader2 size={24} className="animate-spin" />
          Kraunama...
        </div>
      ) : bookings.length === 0 ? (
        <div className="card p-12 text-center text-gray-400">
          <p className="font-700">Rezervacijų nėra</p>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <div key={booking.id} className="card p-6">
              <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl bg-[#0B5C71] flex items-center justify-center text-white font-900 shrink-0">
                    {(booking.user.name || booking.user.email || "?")[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="font-700 text-[#0B5C71]">
                      {booking.user.name || "—"}
                    </p>
                    <p className="text-sm text-gray-400">{booking.user.email}</p>
                    {booking.user.phone && (
                      <p className="text-sm text-gray-400">{booking.user.phone}</p>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <span className={`badge ${bookingStatusColor(booking.status)}`}>
                    {bookingStatusLabel(booking.status)}
                  </span>
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <Clock size={13} />
                    {formatDateLT(booking.slot.date)} · {booking.slot.startTime} – {booking.slot.endTime}
                  </div>
                </div>
              </div>

              {/* Client notes */}
              {booking.clientNotes && (
                <div className="mb-3 p-3 bg-blue-50 border border-blue-100 rounded-xl text-sm text-gray-600">
                  <span className="font-700 text-blue-500 text-xs">📝 Kliento pastabos: </span>
                  {booking.clientNotes}
                </div>
              )}

              {/* Trainer note */}
              {booking.sessionNote?.trainerNote && (
                <div className="mb-3 p-3 bg-[#FF5733]/5 border border-[#FF5733]/20 rounded-xl">
                  <p className="text-xs font-700 text-[#FF5733] mb-1">💬 Trenerio komentaras:</p>
                  <p className="text-sm text-gray-600">{booking.sessionNote.trainerNote}</p>
                  <button
                    onClick={() => {
                      setNoteId(booking.id);
                      setNoteText(booking.sessionNote?.trainerNote || "");
                    }}
                    className="text-xs text-[#FF5733] font-600 mt-1 hover:underline"
                  >
                    Redaguoti
                  </button>
                </div>
              )}

              {/* Note editor */}
              {noteId === booking.id && (
                <div className="mb-3 space-y-2">
                  <textarea
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    placeholder="Trenerio komentaras apie treniruotę..."
                    rows={3}
                    className="w-full border border-gray-200 rounded-xl p-3 text-sm resize-none focus:outline-none focus:border-[#FF5733]"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSaveNote(booking.id)}
                      disabled={savingNote}
                      className="btn-primary text-sm py-2 px-4"
                    >
                      {savingNote ? "Saugoma..." : "Išsaugoti"}
                    </button>
                    <button
                      onClick={() => setNoteId(null)}
                      className="btn-secondary text-sm py-2 px-4"
                    >
                      Atšaukti
                    </button>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-wrap gap-2 pt-3 border-t border-gray-100">
                {booking.status === "PENDING" && (
                  <>
                    <button
                      onClick={() => handleStatus(booking.id, "CONFIRMED")}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-50 text-green-600 text-xs font-700 hover:bg-green-100 transition-colors border border-green-200"
                    >
                      <Check size={13} /> Patvirtinti
                    </button>
                    <button
                      onClick={() => handleStatus(booking.id, "CANCELLED")}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 text-red-600 text-xs font-700 hover:bg-red-100 transition-colors border border-red-200"
                    >
                      <X size={13} /> Atšaukti
                    </button>
                  </>
                )}
                {booking.status === "CONFIRMED" && (
                  <>
                    <button
                      onClick={() => handleStatus(booking.id, "COMPLETED")}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 text-xs font-700 hover:bg-blue-100 transition-colors border border-blue-200"
                    >
                      <Check size={13} /> Pažymėti įvykdyta
                    </button>
                    <button
                      onClick={() => handleStatus(booking.id, "CANCELLED")}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 text-red-600 text-xs font-700 hover:bg-red-100 transition-colors border border-red-200"
                    >
                      <X size={13} /> Atšaukti
                    </button>
                  </>
                )}
                {booking.status === "COMPLETED" && !booking.sessionNote?.trainerNote && (
                  <button
                    onClick={() => {
                      setNoteId(booking.id);
                      setNoteText("");
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-50 text-gray-600 text-xs font-700 hover:bg-gray-100 transition-colors border border-gray-200"
                  >
                    <MessageSquare size={13} /> Komentuoti treniruotę
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
