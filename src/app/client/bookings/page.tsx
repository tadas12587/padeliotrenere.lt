"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Calendar, Clock, MessageSquare, X, Loader2 } from "lucide-react";
import { formatDateLT } from "@/lib/utils";
import { bookingStatusLabel, bookingStatusColor, cn } from "@/lib/utils";

interface Booking {
  id: string;
  status: string;
  clientNotes?: string;
  createdAt: string;
  slot: { date: string; startTime: string; endTime: string };
  sessionNote?: { trainerNote?: string; clientNote?: string } | null;
}

const tabs = [
  { key: "upcoming", label: "Artėjančios" },
  { key: "past", label: "Praėjusios" },
  { key: "all", label: "Visos" },
];

export default function ClientBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("upcoming");
  const [cancelling, setCancelling] = useState<string | null>(null);
  const [noteBookingId, setNoteBookingId] = useState<string | null>(null);
  const [noteText, setNoteText] = useState("");
  const [savingNote, setSavingNote] = useState(false);

  useEffect(() => {
    fetch("/api/bookings")
      .then((r) => r.json())
      .then(setBookings)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = bookings.filter((b) => {
    const future = new Date(b.slot.date) >= new Date();
    if (tab === "upcoming") return future && ["PENDING", "CONFIRMED"].includes(b.status);
    if (tab === "past") return !future || ["COMPLETED", "CANCELLED"].includes(b.status);
    return true;
  });

  const handleCancel = async (id: string) => {
    if (!confirm("Ar tikrai norite atšaukti šią rezervaciją?")) return;
    setCancelling(id);
    await fetch(`/api/bookings/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "CANCELLED" }),
    });
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: "CANCELLED" } : b))
    );
    setCancelling(null);
  };

  const handleSaveNote = async () => {
    if (!noteBookingId) return;
    setSavingNote(true);
    await fetch(`/api/bookings/${noteBookingId}/note`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clientNote: noteText }),
    });
    setBookings((prev) =>
      prev.map((b) =>
        b.id === noteBookingId
          ? { ...b, sessionNote: { ...b.sessionNote, clientNote: noteText } }
          : b
      )
    );
    setSavingNote(false);
    setNoteBookingId(null);
    setNoteText("");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-900 text-[#0B5C71]">Mano rezervacijos</h1>
        <Link href="/booking" className="btn-primary text-sm py-2 px-4">
          + Nauja rezervacija
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {tabs.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-600 transition-all",
              tab === key
                ? "bg-white text-[#0B5C71] shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 gap-3 text-gray-400">
          <Loader2 size={24} className="animate-spin" />
          <span>Kraunama...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <Calendar size={48} className="mx-auto mb-4 text-gray-300" />
          <p className="font-700 text-gray-500 mb-2">Rezervacijų nėra</p>
          <Link href="/booking" className="btn-primary text-sm py-2 px-5 inline-flex mt-2">
            Rezervuoti treniruotę
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((booking) => (
            <div key={booking.id} className="card p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#FF5733]/10 flex items-center justify-center shrink-0 text-2xl">
                    🎾
                  </div>
                  <div>
                    <p className="font-700 text-[#0B5C71]">
                      {formatDateLT(booking.slot.date)}
                    </p>
                    <p className="text-gray-500 text-sm flex items-center gap-1 mt-0.5">
                      <Clock size={13} />
                      {booking.slot.startTime} – {booking.slot.endTime}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`badge ${bookingStatusColor(booking.status)}`}>
                    {bookingStatusLabel(booking.status)}
                  </span>
                  {["PENDING", "CONFIRMED"].includes(booking.status) && (
                    <button
                      onClick={() => handleCancel(booking.id)}
                      disabled={cancelling === booking.id}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
                      title="Atšaukti"
                    >
                      {cancelling === booking.id ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <X size={14} />
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* Trainer note */}
              {booking.sessionNote?.trainerNote && (
                <div className="mt-4 p-3 bg-[#FF5733]/5 border border-[#FF5733]/20 rounded-xl">
                  <p className="text-xs font-700 text-[#FF5733] mb-1">
                    💬 Trenerio komentaras:
                  </p>
                  <p className="text-sm text-gray-700">{booking.sessionNote.trainerNote}</p>
                </div>
              )}

              {/* Client note */}
              {booking.sessionNote?.clientNote ? (
                <div className="mt-3 p-3 bg-blue-50 border border-blue-100 rounded-xl">
                  <p className="text-xs font-700 text-blue-500 mb-1">
                    📝 Jūsų pastabos:
                  </p>
                  <p className="text-sm text-gray-700">{booking.sessionNote.clientNote}</p>
                  <button
                    onClick={() => {
                      setNoteBookingId(booking.id);
                      setNoteText(booking.sessionNote?.clientNote || "");
                    }}
                    className="text-xs text-blue-500 font-600 mt-1 hover:underline"
                  >
                    Redaguoti
                  </button>
                </div>
              ) : booking.status === "COMPLETED" ? (
                <button
                  onClick={() => {
                    setNoteBookingId(booking.id);
                    setNoteText("");
                  }}
                  className="mt-3 flex items-center gap-1.5 text-sm text-gray-400 hover:text-[#FF5733] transition-colors"
                >
                  <MessageSquare size={14} />
                  Pridėti pastabą apie treniruotę
                </button>
              ) : null}

              {/* Note editor */}
              {noteBookingId === booking.id && (
                <div className="mt-3 space-y-2">
                  <textarea
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    placeholder="Jūsų pastabos apie treniruotę..."
                    rows={3}
                    className="w-full border border-gray-200 rounded-xl p-3 text-sm resize-none focus:outline-none focus:border-[#FF5733] transition-colors"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveNote}
                      disabled={savingNote}
                      className="btn-primary text-sm py-2 px-4"
                    >
                      {savingNote ? "Saugoma..." : "Išsaugoti"}
                    </button>
                    <button
                      onClick={() => setNoteBookingId(null)}
                      className="btn-secondary text-sm py-2 px-4"
                    >
                      Atšaukti
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
