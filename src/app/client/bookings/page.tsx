"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Calendar,
  Clock,
  MapPin,
  MessageSquare,
  X,
  Loader2,
  Star,
  ArrowRight,
} from "lucide-react";
import { formatDateLT } from "@/lib/utils";
import { bookingStatusLabel, bookingStatusColor, cn } from "@/lib/utils";

interface LegacySlot {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
}

interface AvailabilitySlot {
  id: string;
  startTime: string;
  endTime: string;
  maxParticipants?: number | null;
  arena: { id: string; name: string; city: string };
  trainer: { id: string; displayName: string; photoUrl?: string | null };
}

interface Booking {
  id: string;
  status: string;
  clientNotes?: string;
  createdAt: string;
  slot: LegacySlot | null;
  availabilitySlot: AvailabilitySlot | null;
  service?: { id: string; name: string; durationMinutes: number } | null;
  sessionNote?: { trainerNote?: string; clientNote?: string } | null;
}

interface MyReview {
  id: string;
  trainerId: string;
  rating: number;
  comment?: string | null;
  createdAt: string;
}

function getBookingDate(b: Booking): Date {
  if (b.availabilitySlot) return new Date(b.availabilitySlot.startTime);
  if (b.slot) return new Date(b.slot.date);
  return new Date(b.createdAt);
}

function getBookingTimeLabel(b: Booking): string {
  if (b.availabilitySlot) {
    const start = new Date(b.availabilitySlot.startTime);
    const end = new Date(b.availabilitySlot.endTime);
    const fmt = (d: Date) =>
      d.toLocaleTimeString("lt-LT", { hour: "2-digit", minute: "2-digit" });
    return `${fmt(start)} – ${fmt(end)}`;
  }
  if (b.slot) return `${b.slot.startTime} – ${b.slot.endTime}`;
  return "";
}

function getBookingDateLabel(b: Booking): string {
  if (b.availabilitySlot) {
    return new Date(b.availabilitySlot.startTime).toLocaleDateString("lt-LT", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }
  if (b.slot) return formatDateLT(b.slot.date);
  return formatDateLT(b.createdAt);
}

function StarPicker({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          onMouseEnter={() => setHovered(n)}
          onMouseLeave={() => setHovered(0)}
          className="p-0.5 rounded transition-transform hover:scale-110"
        >
          <Star
            size={22}
            className={
              n <= (hovered || value)
                ? "text-yellow-400 fill-yellow-400"
                : "text-gray-300 fill-gray-300"
            }
          />
        </button>
      ))}
    </div>
  );
}

function TrainerAvatar({
  displayName,
  photoUrl,
  size = "md",
}: {
  displayName: string;
  photoUrl?: string | null;
  size?: "sm" | "md" | "lg";
}) {
  const sz =
    size === "lg"
      ? "w-14 h-14 text-xl"
      : size === "sm"
      ? "w-8 h-8 text-xs"
      : "w-10 h-10 text-sm";

  if (photoUrl) {
    return (
      <img
        src={photoUrl}
        alt={displayName}
        className={cn(sz, "rounded-full object-cover border-2 border-white shadow")}
      />
    );
  }
  return (
    <div
      className={cn(
        sz,
        "rounded-full bg-[#0B5C71] flex items-center justify-center font-800 text-white border-2 border-white shadow"
      )}
    >
      {displayName[0]}
    </div>
  );
}

const tabs = [
  { key: "upcoming", label: "Artėjančios" },
  { key: "past", label: "Praėjusios" },
  { key: "all", label: "Visos" },
];

function ClientBookingsContent() {
  const searchParams = useSearchParams();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [myReviews, setMyReviews] = useState<Record<string, MyReview>>({});
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState(searchParams.get("tab") || "upcoming");
  const [cancelling, setCancelling] = useState<string | null>(null);
  const [noteBookingId, setNoteBookingId] = useState<string | null>(null);
  const [noteText, setNoteText] = useState("");
  const [savingNote, setSavingNote] = useState(false);

  // Review state
  const [reviewBookingId, setReviewBookingId] = useState<string | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/bookings").then((r) => r.json()),
      fetch("/api/reviews/my").then((r) => r.json()),
    ])
      .then(([bookingsData, reviewsData]) => {
        setBookings(Array.isArray(bookingsData) ? bookingsData : []);
        if (Array.isArray(reviewsData)) {
          const map: Record<string, MyReview> = {};
          reviewsData.forEach((r: MyReview) => {
            map[r.trainerId] = r;
          });
          setMyReviews(map);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = bookings.filter((b) => {
    const future = getBookingDate(b) >= new Date();
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

  const handleSubmitReview = async () => {
    const booking = bookings.find((b) => b.id === reviewBookingId);
    if (!booking?.availabilitySlot?.trainer?.id) return;
    const trainerId = booking.availabilitySlot.trainer.id;

    setSubmittingReview(true);
    setReviewError(null);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trainerId, rating: reviewRating, comment: reviewComment }),
      });
      if (res.status === 409) {
        setReviewError("Jūs jau palikote atsiliepimą šiam treneriui.");
      } else if (!res.ok) {
        setReviewError("Nepavyko išsaugoti atsiliepimo. Bandykite vėliau.");
      } else {
        const created: MyReview = { id: "", trainerId, rating: reviewRating, comment: reviewComment, createdAt: new Date().toISOString() };
        setMyReviews((prev) => ({ ...prev, [trainerId]: created }));
        setReviewBookingId(null);
        setReviewRating(5);
        setReviewComment("");
      }
    } finally {
      setSubmittingReview(false);
    }
  };

  const isPast = (b: Booking) => {
    const future = getBookingDate(b) >= new Date();
    return !future || ["COMPLETED", "CANCELLED"].includes(b.status);
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
          {filtered.map((booking) => {
            const past = isPast(booking);
            const trainer = booking.availabilitySlot?.trainer;
            const trainerId = trainer?.id;
            const alreadyReviewed = trainerId ? myReviews[trainerId] : null;

            return (
              <div key={booking.id} className="card p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    {/* Trainer avatar or generic icon */}
                    {trainer ? (
                      <TrainerAvatar
                        displayName={trainer.displayName}
                        photoUrl={trainer.photoUrl}
                        size="md"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-[#FF5733]/10 flex items-center justify-center shrink-0 text-xl">
                        🎾
                      </div>
                    )}
                    <div>
                      <p className="font-700 text-[#0B5C71]">
                        {getBookingDateLabel(booking)}
                      </p>
                      <p className="text-gray-500 text-sm flex items-center gap-1 mt-0.5">
                        <Clock size={13} />
                        {getBookingTimeLabel(booking)}
                      </p>
                      {booking.availabilitySlot && (
                        <>
                          <p className="text-gray-500 text-sm flex items-center gap-1 mt-0.5">
                            <MapPin size={13} />
                            {booking.availabilitySlot.arena.name},{" "}
                            {booking.availabilitySlot.arena.city}
                          </p>
                          {trainer && (
                            <p className="text-sm font-600 text-[#0B5C71] mt-0.5">
                              Treneris:{" "}
                              <Link
                                href={`/trainers/${trainer.id}`}
                                className="hover:text-[#FF5733] transition-colors underline-offset-2 hover:underline"
                              >
                                {trainer.displayName}
                              </Link>
                            </p>
                          )}
                        </>
                      )}
                      {booking.service && (
                        <p className="text-xs text-[#FF5733] font-600 mt-1">
                          {booking.service.name} · {booking.service.durationMinutes} min
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
                    {booking.availabilitySlot?.maxParticipants && booking.availabilitySlot.maxParticipants > 0 && (
                      <span className="badge text-xs text-orange-600 bg-orange-50 border-orange-200">Grupinė</span>
                    )}
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

                {/* Past booking extras */}
                {past && trainer && (
                  <div className="mt-4 flex flex-wrap items-center gap-3 pt-3 border-t border-gray-100">
                    <Link
                      href={`/booking?trainerId=${trainer.id}`}
                      className="inline-flex items-center gap-1.5 text-sm font-600 text-[#FF5733] hover:underline"
                    >
                      Rezervuoti vėl pas {trainer.displayName}
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                )}

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

                {/* Review section — only for past bookings with a trainer */}
                {past && trainer && (
                  <div className="mt-3">
                    {alreadyReviewed ? (
                      <p className="text-xs text-gray-400">Jūs jau įvertinote trenerį</p>
                    ) : reviewBookingId === booking.id ? (
                      <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-3">
                        <p className="text-sm font-700 text-[#0B5C71]">
                          Palikite atsiliepimą apie trenerį {trainer.displayName}
                        </p>
                        <StarPicker value={reviewRating} onChange={setReviewRating} />
                        <textarea
                          value={reviewComment}
                          onChange={(e) => setReviewComment(e.target.value)}
                          placeholder="Komentaras (neprivaloma)..."
                          rows={3}
                          className="w-full border border-gray-200 rounded-xl p-3 text-sm resize-none focus:outline-none focus:border-[#FF5733] transition-colors"
                        />
                        {reviewError && (
                          <p className="text-xs text-red-500">{reviewError}</p>
                        )}
                        <div className="flex gap-2">
                          <button
                            onClick={handleSubmitReview}
                            disabled={submittingReview || reviewRating === 0}
                            className="btn-primary text-sm py-2 px-4"
                          >
                            {submittingReview ? "Siunčiama..." : "Pateikti"}
                          </button>
                          <button
                            onClick={() => {
                              setReviewBookingId(null);
                              setReviewError(null);
                            }}
                            className="btn-secondary text-sm py-2 px-4"
                          >
                            Atšaukti
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setReviewBookingId(booking.id);
                          setReviewRating(5);
                          setReviewComment("");
                          setReviewError(null);
                        }}
                        className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-yellow-500 transition-colors"
                      >
                        <Star size={14} />
                        Palikti atsiliepimą apie trenerį
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function ClientBookingsPage() {
  return (
    <Suspense fallback={null}>
      <ClientBookingsContent />
    </Suspense>
  );
}
