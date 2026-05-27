"use client";

import { useState, useEffect } from "react";
import { format, addDays, startOfWeek, isSameDay, isToday, isPast } from "date-fns";
import { lt } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Clock, Users, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Slot {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  maxClients: number;
  _count: { bookings: number };
}

export default function BookingCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [booking, setBooking] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  // Build 7 days from current week start
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 }); // Monday
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  useEffect(() => {
    if (!selectedDate) return;
    setLoading(true);
    setSlots([]);
    setSelectedSlot(null);

    const from = format(selectedDate, "yyyy-MM-dd");
    fetch(`/api/slots?from=${from}&to=${from}`)
      .then((r) => r.json())
      .then((data) => setSlots(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [selectedDate]);

  const handleBook = async () => {
    if (!selectedSlot) return;
    setBooking(true);
    setError("");

    const res = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slotId: selectedSlot.id }),
    });

    setBooking(false);

    if (res.ok) {
      setSuccess(true);
    } else {
      const data = await res.json();
      if (res.status === 401) {
        // Redirect to login
        window.location.href = "/auth/login?callbackUrl=/booking";
        return;
      }
      setError(data.error || "Klaida rezervuojant. Bandykite dar kartą.");
    }
  };

  if (success) {
    return (
      <div className="max-w-lg mx-auto text-center py-16">
        <div className="text-7xl mb-6">🎾</div>
        <h2 className="text-3xl font-900 text-[#16213e] mb-3">
          Rezervacija patvirtinta!
        </h2>
        <p className="text-gray-500 mb-2">
          Patvirtinimas išsiųstas el. paštu.
        </p>
        {selectedSlot && (
          <p className="text-gray-600 font-600">
            {selectedDate && format(selectedDate, "d MMMM yyyy", { locale: lt })},{" "}
            {selectedSlot.startTime} – {selectedSlot.endTime}
          </p>
        )}
        <div className="flex gap-3 justify-center mt-8">
          <a href="/client/bookings" className="btn-primary">
            Mano rezervacijos
          </a>
          <button
            onClick={() => {
              setSuccess(false);
              setSelectedSlot(null);
              setSelectedDate(null);
            }}
            className="btn-secondary"
          >
            Rezervuoti dar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Step indicator */}
      <div className="flex items-center gap-4 mb-8">
        <div className={cn("flex items-center gap-2 text-sm font-700", selectedDate ? "text-[#e94560]" : "text-gray-400")}>
          <span className={cn("w-7 h-7 rounded-full flex items-center justify-center text-xs font-800", selectedDate ? "bg-[#e94560] text-white" : "bg-gray-200 text-gray-500")}>1</span>
          Pasirink dieną
        </div>
        <div className="flex-1 h-0.5 bg-gray-200" />
        <div className={cn("flex items-center gap-2 text-sm font-700", selectedSlot ? "text-[#e94560]" : "text-gray-400")}>
          <span className={cn("w-7 h-7 rounded-full flex items-center justify-center text-xs font-800", selectedSlot ? "bg-[#e94560] text-white" : "bg-gray-200 text-gray-500")}>2</span>
          Pasirink laiką
        </div>
        <div className="flex-1 h-0.5 bg-gray-200" />
        <div className="flex items-center gap-2 text-sm font-700 text-gray-400">
          <span className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-xs font-800 text-gray-500">3</span>
          Patvirtink
        </div>
      </div>

      {/* Calendar */}
      <div className="card p-6 mb-6">
        {/* Week navigation */}
        <div className="flex items-center justify-between mb-5">
          <button
            onClick={() => setCurrentDate((d) => addDays(d, -7))}
            className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
          >
            <ChevronLeft size={18} />
          </button>
          <h3 className="font-800 text-[#16213e]">
            {format(weekStart, "MMMM yyyy", { locale: lt })}
          </h3>
          <button
            onClick={() => setCurrentDate((d) => addDays(d, 7))}
            className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Day buttons */}
        <div className="grid grid-cols-7 gap-2">
          {days.map((day) => {
            const past = isPast(day) && !isToday(day);
            const selected = selectedDate && isSameDay(day, selectedDate);

            return (
              <button
                key={day.toISOString()}
                onClick={() => !past && setSelectedDate(day)}
                disabled={past}
                className={cn(
                  "flex flex-col items-center py-3 px-1 rounded-xl border-2 transition-all text-center",
                  past
                    ? "opacity-30 cursor-not-allowed border-transparent"
                    : selected
                    ? "border-[#e94560] bg-[#e94560] text-white"
                    : isToday(day)
                    ? "border-[#e94560]/40 bg-[#e94560]/5 text-[#e94560] hover:border-[#e94560]"
                    : "border-gray-100 hover:border-[#e94560]/50 hover:bg-gray-50"
                )}
              >
                <span className="text-xs font-600 uppercase opacity-70">
                  {format(day, "EEE", { locale: lt }).slice(0, 2)}
                </span>
                <span className="font-800 text-lg mt-0.5">{format(day, "d")}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Slots */}
      {selectedDate && (
        <div className="card p-6 mb-6">
          <h3 className="font-800 text-[#16213e] mb-4">
            Laisvi laikai:{" "}
            <span className="text-[#e94560]">
              {format(selectedDate, "d MMMM", { locale: lt })}
            </span>
          </h3>

          {loading ? (
            <div className="flex items-center justify-center py-12 gap-3 text-gray-400">
              <Loader2 size={22} className="animate-spin" />
              <span>Kraunama...</span>
            </div>
          ) : slots.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              <p className="text-4xl mb-3">😔</p>
              <p className="font-600">Šią dieną laisvų laikų nėra</p>
              <p className="text-sm mt-1">Pasirinkite kitą dieną</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {slots.map((slot) => {
                const isFull = slot._count.bookings >= slot.maxClients;
                const isSelected = selectedSlot?.id === slot.id;

                return (
                  <button
                    key={slot.id}
                    onClick={() => !isFull && setSelectedSlot(slot)}
                    disabled={isFull}
                    className={cn(
                      "flex flex-col items-center p-4 rounded-xl border-2 transition-all text-center",
                      isFull
                        ? "border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed"
                        : isSelected
                        ? "border-[#e94560] bg-[#e94560] text-white"
                        : "border-gray-200 hover:border-[#e94560]/50 hover:bg-gray-50"
                    )}
                  >
                    <div className="flex items-center gap-1.5 font-800 text-lg">
                      <Clock size={16} className={isSelected ? "opacity-80" : "text-[#e94560]"} />
                      {slot.startTime}
                    </div>
                    <p className={cn("text-xs mt-1", isSelected ? "opacity-80" : "text-gray-400")}>
                      iki {slot.endTime}
                    </p>
                    {isFull && (
                      <span className="text-xs font-700 text-red-500 mt-1">Užimta</span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Book button */}
      {selectedSlot && (
        <div className="card p-6">
          <h3 className="font-800 text-[#16213e] mb-3">Patvirtinkite rezervaciją</h3>
          <div className="bg-gray-50 rounded-xl p-4 mb-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#e94560]/10 flex items-center justify-center shrink-0">
              <span className="text-2xl">🎾</span>
            </div>
            <div>
              <p className="font-700 text-[#16213e]">
                {selectedDate && format(selectedDate, "d MMMM yyyy", { locale: lt })}
              </p>
              <p className="text-gray-500 text-sm">
                {selectedSlot.startTime} – {selectedSlot.endTime}
              </p>
            </div>
          </div>

          {error && (
            <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-4">
              {error}
            </p>
          )}

          <button
            onClick={handleBook}
            disabled={booking}
            className="btn-primary w-full justify-center text-base py-3.5 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {booking ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Rezervuojama...
              </>
            ) : (
              "✅ Rezervuoti treniruotę"
            )}
          </button>
          <p className="text-xs text-gray-400 text-center mt-3">
            Reikalinga paskyra. Patvirtinimas el. paštu.
          </p>
        </div>
      )}
    </div>
  );
}
