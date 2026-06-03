"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Star } from "lucide-react";
import { bookingStatusLabel, bookingStatusColor, cn } from "@/lib/utils";

interface Trainer {
  id: string;
  displayName: string;
  photoUrl?: string | null;
}

interface PastBooking {
  id: string;
  status: string;
  createdAt: string;
  slot?: { date: string; startTime: string; endTime: string } | null;
  availabilitySlot?: {
    startTime: string;
    endTime: string;
    maxParticipants?: number | null;
    arena: { name: string; city: string };
    trainer: Trainer;
  } | null;
  service?: { name: string } | null;
  sessionNote?: { trainerNote?: string | null } | null;
}

interface MyReview {
  trainerId: string;
  rating: number;
  comment?: string | null;
}

function getDateLabel(b: PastBooking): string {
  if (b.availabilitySlot) {
    return new Date(b.availabilitySlot.startTime).toLocaleDateString("lt-LT", {
      year: "numeric", month: "long", day: "numeric",
    });
  }
  if (b.slot) {
    return new Date(b.slot.date).toLocaleDateString("lt-LT", {
      year: "numeric", month: "long", day: "numeric",
    });
  }
  return new Date(b.createdAt).toLocaleDateString("lt-LT", {
    year: "numeric", month: "long", day: "numeric",
  });
}

function getTimeLabel(b: PastBooking): string {
  if (b.availabilitySlot) {
    const s = new Date(b.availabilitySlot.startTime);
    const e = new Date(b.availabilitySlot.endTime);
    const fmt = (d: Date) => d.toLocaleTimeString("lt-LT", { hour: "2-digit", minute: "2-digit" });
    return `${fmt(s)} – ${fmt(e)}`;
  }
  if (b.slot) return `${b.slot.startTime} – ${b.slot.endTime}`;
  return "";
}

function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
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
            size={20}
            className={n <= (hovered || value) ? "text-yellow-400 fill-yellow-400" : "text-gray-300 fill-gray-300"}
          />
        </button>
      ))}
    </div>
  );
}

function StarDisplay({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} size={13} className={n <= rating ? "text-yellow-400 fill-yellow-400" : "text-gray-200 fill-gray-200"} />
      ))}
    </div>
  );
}

export default function PastSessions({ bookings }: { bookings: PastBooking[] }) {
  const [myReviews, setMyReviews] = useState<Record<string, MyReview>>({});
  const [reviewBookingId, setReviewBookingId] = useState<string | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/reviews/my")
      .then((r) => r.json())
      .then((data: MyReview[]) => {
        if (!Array.isArray(data)) return;
        const map: Record<string, MyReview> = {};
        data.forEach((r) => { map[r.trainerId] = r; });
        setMyReviews(map);
      })
      .catch(() => {});
  }, []);

  const handleSubmit = async (trainerId: string) => {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trainerId, rating: reviewRating, comment: reviewComment }),
      });
      if (res.status === 409) {
        setError("Jūs jau palikote atsiliepimą šiam treneriui.");
      } else if (!res.ok) {
        setError("Nepavyko išsaugoti. Bandykite vėliau.");
      } else {
        setMyReviews((prev) => ({
          ...prev,
          [trainerId]: { trainerId, rating: reviewRating, comment: reviewComment },
        }));
        setReviewBookingId(null);
        setReviewRating(5);
        setReviewComment("");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-3">
      {bookings.map((b) => {
        const trainer = b.availabilitySlot?.trainer;
        const alreadyReviewed = trainer ? myReviews[trainer.id] : null;
        const timeLabel = getTimeLabel(b);

        return (
          <div key={b.id} className="p-4 bg-gray-50 rounded-xl border border-gray-100">
            <div className="flex items-start gap-3">
              {/* Trainer avatar */}
              {trainer?.photoUrl ? (
                <img
                  src={trainer.photoUrl}
                  alt={trainer.displayName}
                  className="w-10 h-10 rounded-full object-cover shrink-0 border-2 border-white shadow"
                />
              ) : trainer ? (
                <div className="w-10 h-10 rounded-full bg-[#0B5C71] flex items-center justify-center font-800 text-white text-sm shrink-0 border-2 border-white shadow">
                  {trainer.displayName[0]}
                </div>
              ) : (
                <div className="w-10 h-10 rounded-xl bg-[#FF5733]/10 flex items-center justify-center shrink-0 text-lg">
                  🎾
                </div>
              )}

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between flex-wrap gap-2 mb-0.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-700 text-sm text-[#0B5C71]">
                      {getDateLabel(b)}{timeLabel && ` · ${timeLabel}`}
                    </p>
                    {(b.availabilitySlot?.maxParticipants ?? 0) > 0 && (
                      <span className="badge text-xs text-orange-600 bg-orange-50 border-orange-200">Grupinė</span>
                    )}
                  </div>
                  <span className={`badge ${bookingStatusColor(b.status)}`}>
                    {bookingStatusLabel(b.status)}
                  </span>
                </div>

                {trainer && (
                  <p className="text-sm font-600 text-[#0B5C71]">
                    <Link href={`/trainers/${trainer.id}`} className="hover:text-[#FF5733] transition-colors">
                      {trainer.displayName}
                    </Link>
                    {b.availabilitySlot?.arena?.name && (
                      <span className="text-gray-400 font-400"> · {b.availabilitySlot.arena.name}</span>
                    )}
                  </p>
                )}

                {b.sessionNote?.trainerNote && (
                  <div className="mt-2 p-2 bg-white rounded-lg border border-gray-100">
                    <p className="text-xs font-700 text-[#FF5733] mb-1">💬 Trenerio komentaras:</p>
                    <p className="text-sm text-gray-600">{b.sessionNote.trainerNote}</p>
                  </div>
                )}

                {/* Book again */}
                {trainer && (
                  <Link
                    href={`/booking?trainerId=${trainer.id}`}
                    className="inline-flex items-center gap-1 text-xs text-[#FF5733] font-600 mt-2 hover:underline"
                  >
                    Rezervuoti vėl <ArrowRight size={11} />
                  </Link>
                )}

                {/* Review */}
                {trainer && (
                  <div className="mt-2">
                    {alreadyReviewed ? (
                      <div className="p-2.5 bg-yellow-50 border border-yellow-100 rounded-xl">
                        <p className="text-xs font-700 text-yellow-600 mb-1">⭐ Jūsų atsiliepimas:</p>
                        <StarDisplay rating={alreadyReviewed.rating} />
                        {alreadyReviewed.comment && (
                          <p className="text-xs text-gray-600 mt-1">{alreadyReviewed.comment}</p>
                        )}
                      </div>
                    ) : reviewBookingId === b.id ? (
                      <div className="p-3 bg-white border border-gray-200 rounded-xl space-y-2">
                        <p className="text-xs font-700 text-[#0B5C71]">
                          Atsiliepimas apie {trainer.displayName}
                        </p>
                        <StarPicker value={reviewRating} onChange={setReviewRating} />
                        <textarea
                          value={reviewComment}
                          onChange={(e) => setReviewComment(e.target.value)}
                          placeholder="Komentaras (neprivaloma)..."
                          rows={2}
                          className="w-full border border-gray-200 rounded-lg p-2 text-sm resize-none focus:outline-none focus:border-[#FF5733] transition-colors"
                        />
                        {error && <p className="text-xs text-red-500">{error}</p>}
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleSubmit(trainer.id)}
                            disabled={submitting}
                            className="btn-primary text-xs py-1.5 px-3"
                          >
                            {submitting ? "Siunčiama..." : "Pateikti"}
                          </button>
                          <button
                            onClick={() => { setReviewBookingId(null); setError(null); }}
                            className="btn-secondary text-xs py-1.5 px-3"
                          >
                            Atšaukti
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setReviewBookingId(b.id);
                          setReviewRating(5);
                          setReviewComment("");
                          setError(null);
                        }}
                        className="flex items-center gap-1 text-xs text-gray-400 hover:text-yellow-500 transition-colors mt-0.5"
                      >
                        <Star size={12} />
                        Palikti atsiliepimą
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
