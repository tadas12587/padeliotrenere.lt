"use client";

import { useState, useEffect, useCallback } from "react";
import { format, addDays, startOfWeek, isSameDay, isToday, isPast, parseISO } from "date-fns";
import { lt } from "date-fns/locale";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  Loader2,
  X,
  CheckCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Sport {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
}

interface Service {
  id: string;
  name: string;
  durationMinutes: number;
  price: string | null;
  description: string | null;
}

interface AvailabilitySlot {
  id: string;
  startTime: string;
  endTime: string;
  maxParticipants?: number | null;
  trainer: {
    id: string;
    displayName: string;
    photoUrl: string | null;
    services: Service[];
  };
  arena: {
    id: string;
    name: string;
    city: string;
    address: string;
  };
  services: Service[];
}

function formatPrice(price: string | null) {
  if (!price) return "Susitarti";
  const n = parseFloat(price);
  if (isNaN(n)) return "Susitarti";
  return `${n} €`;
}

function formatTime(isoStr: string) {
  return format(parseISO(isoStr), "HH:mm");
}

interface Props {
  initialTrainerId?: string;
  initialArenaId?: string;
  availableSports?: Sport[];
  availableCities?: string[];
}

export default function MultiTrainerBooking({
  initialTrainerId = "",
  initialArenaId = "",
  availableSports = [],
  availableCities = [],
}: Props) {
  const [sport, setSport] = useState("");
  const [city, setCity] = useState("");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<AvailabilitySlot | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [booking, setBooking] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const toggleSport = (s: string) => {
    setSport((prev) => (prev === s ? "" : s));
    setSelectedDate(null);
  };

  const toggleCity = (c: string) => {
    setCity((prev) => (prev === c ? "" : c));
    setSelectedDate(null);
  };

  const fetchSlots = useCallback(
    (date: Date) => {
      setLoading(true);
      setSlots([]);
      setSelectedSlot(null);
      setSelectedService(null);

      const dayStart = new Date(date);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(date);
      dayEnd.setHours(23, 59, 59, 999);

      const params = new URLSearchParams();
      params.set("from", dayStart.toISOString());
      params.set("to", dayEnd.toISOString());
      if (sport.trim()) params.set("sport", sport.trim());
      if (city.trim()) params.set("city", city.trim());
      if (initialTrainerId) params.set("trainerId", initialTrainerId);

      fetch(`/api/availability?${params}`)
        .then((r) => r.json())
        .then((data) => setSlots(Array.isArray(data) ? data : []))
        .catch(console.error)
        .finally(() => setLoading(false));
    },
    [sport, city, initialTrainerId]
  );

  useEffect(() => {
    if (selectedDate) fetchSlots(selectedDate);
  }, [selectedDate, fetchSlots]);

  const handleBook = async () => {
    if (!selectedSlot) return;
    setBooking(true);
    setError("");

    const res = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        availabilitySlotId: selectedSlot.id,
        trainerId: selectedSlot.trainer.id,
        arenaId: selectedSlot.arena.id,
        ...(selectedService ? { serviceId: selectedService.id } : {}),
      }),
    });

    setBooking(false);

    if (res.ok) {
      setSuccess(true);
    } else {
      const data = await res.json().catch(() => ({}));
      if (res.status === 401) {
        window.location.href = `/auth/login?callbackUrl=${encodeURIComponent(window.location.pathname)}`;
        return;
      }
      setError(data.error || "Klaida rezervuojant. Bandykite dar kartą.");
    }
  };

  if (success) {
    return (
      <div className="max-w-lg mx-auto text-center py-16">
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
          <CheckCircle size={40} className="text-green-600" />
        </div>
        <h2 className="text-3xl font-900 text-[#0B5C71] mb-3">Rezervacija patvirtinta!</h2>
        <p className="text-gray-500 mb-2">Patvirtinimas išsiųstas el. paštu.</p>
        {selectedSlot && (
          <div className="mt-4 bg-gray-50 rounded-2xl p-5 text-left">
            <p className="font-700 text-[#0B5C71]">{selectedSlot.trainer.displayName}</p>
            <p className="text-sm text-gray-500 mt-1">
              {selectedDate && format(selectedDate, "d MMMM yyyy", { locale: lt })},{" "}
              {formatTime(selectedSlot.startTime)} – {formatTime(selectedSlot.endTime)}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              📍 {selectedSlot.arena.name}, {selectedSlot.arena.city}
            </p>
          </div>
        )}
        <div className="flex gap-3 justify-center mt-8">
          <a href="/client/bookings" className="btn-primary">Mano rezervacijos</a>
          <button
            onClick={() => { setSuccess(false); setSelectedSlot(null); setSelectedDate(null); }}
            className="btn-secondary"
          >
            Rezervuoti dar
          </button>
        </div>
      </div>
    );
  }

  const hasFilter = sport || city;

  return (
    <div className="max-w-3xl mx-auto">
      {/* Step indicator */}
      <div className="flex items-center gap-3 mb-8 overflow-x-auto pb-1">
        {[
          { n: 1, label: "Filtrai", done: !!(sport || city) },
          { n: 2, label: "Diena", done: !!selectedDate },
          { n: 3, label: "Laikas", done: !!selectedSlot },
          { n: 4, label: "Patvirtinimas", done: false },
        ].map(({ n, label, done }, i, arr) => (
          <div key={n} className="flex items-center gap-3 shrink-0">
            <div className={cn("flex items-center gap-2 text-sm font-700 whitespace-nowrap", done ? "text-[#FF5733]" : "text-gray-400")}>
              <span className={cn("w-7 h-7 rounded-full flex items-center justify-center text-xs font-800", done ? "bg-[#FF5733] text-white" : "bg-gray-200 text-gray-500")}>
                {n}
              </span>
              {label}
            </div>
            {i < arr.length - 1 && <div className="flex-1 h-0.5 bg-gray-200 min-w-[16px]" />}
          </div>
        ))}
      </div>

      {/* Filters */}
      {(availableSports.length > 0 || availableCities.length > 0) && (
        <div className="card p-5 mb-5">
          <div className="flex flex-col gap-4">
            {availableSports.length > 0 && (
              <div>
                <p className="text-xs font-600 text-gray-400 uppercase tracking-wider mb-2">Sporto šaka</p>
                <div className="flex flex-wrap gap-2">
                  {availableSports.map((sp) => (
                    <button
                      key={sp.id}
                      type="button"
                      onClick={() => toggleSport(sp.slug)}
                      className={`px-3.5 py-1.5 rounded-full text-sm font-600 border transition-all ${
                        sport === sp.slug
                          ? "bg-[#0B5C71] text-white border-[#0B5C71]"
                          : "bg-white text-gray-600 border-gray-200 hover:border-[#0B5C71] hover:text-[#0B5C71]"
                      }`}
                    >
                      {sp.icon ? `${sp.icon} ` : ""}{sp.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {availableCities.length > 0 && (
              <div>
                <p className="text-xs font-600 text-gray-400 uppercase tracking-wider mb-2">Miestas</p>
                <div className="flex flex-wrap gap-2">
                  {availableCities.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => toggleCity(c)}
                      className={`px-3.5 py-1.5 rounded-full text-sm font-600 border transition-all ${
                        city === c
                          ? "bg-[#0B5C71] text-white border-[#0B5C71]"
                          : "bg-white text-gray-600 border-gray-200 hover:border-[#0B5C71] hover:text-[#0B5C71]"
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {hasFilter && (
              <button
                type="button"
                onClick={() => { setSport(""); setCity(""); setSelectedDate(null); }}
                className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-[#FF5733] transition-colors w-fit"
              >
                <X size={14} />
                Išvalyti filtrus
              </button>
            )}
          </div>
        </div>
      )}

      {/* Calendar */}
      <div className="card p-6 mb-5">
        <div className="flex items-center justify-between mb-5">
          <button
            onClick={() => setCurrentDate((d) => addDays(d, -7))}
            className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
          >
            <ChevronLeft size={18} />
          </button>
          <h3 className="font-800 text-[#0B5C71]">
            {format(weekStart, "MMMM yyyy", { locale: lt })}
          </h3>
          <button
            onClick={() => setCurrentDate((d) => addDays(d, 7))}
            className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
          >
            <ChevronRight size={18} />
          </button>
        </div>

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
                    ? "border-[#FF5733] bg-[#FF5733] text-white"
                    : isToday(day)
                    ? "border-[#FF5733]/40 bg-[#FF5733]/5 text-[#FF5733] hover:border-[#FF5733]"
                    : "border-gray-100 hover:border-[#FF5733]/50 hover:bg-gray-50"
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
        <div className="card p-6 mb-5">
          <h3 className="font-800 text-[#0B5C71] mb-4">
            Laisvi laikai:{" "}
            <span className="text-[#FF5733]">
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
            <div className="flex flex-col gap-3">
              {slots.map((slot) => {
                const isSelected = selectedSlot?.id === slot.id;
                return (
                  <button
                    key={slot.id}
                    onClick={() => { setSelectedSlot(slot); setSelectedService(null); }}
                    className={cn(
                      "w-full text-left p-4 rounded-xl border-2 transition-all",
                      isSelected
                        ? "border-[#FF5733] bg-[#FF5733]/5"
                        : "border-gray-200 hover:border-[#FF5733]/50 hover:bg-gray-50"
                    )}
                  >
                    <div className="flex items-start gap-4">
                      <div className="shrink-0 text-center min-w-[60px]">
                        <p className="font-800 text-lg text-[#0B5C71]">
                          {formatTime(slot.startTime)}
                        </p>
                        <p className="text-xs text-gray-400">
                          – {formatTime(slot.endTime)}
                        </p>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {slot.trainer.photoUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={slot.trainer.photoUrl}
                              alt={slot.trainer.displayName}
                              className="w-7 h-7 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-7 h-7 rounded-full bg-[#FF5733]/10 flex items-center justify-center text-xs font-800 text-[#FF5733]">
                              {slot.trainer.displayName[0]}
                            </div>
                          )}
                          <span className="font-700 text-sm text-[#0B5C71]">
                            {slot.trainer.displayName}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                          <MapPin size={11} />
                          {slot.arena.name}, {slot.arena.city}
                        </p>
                        {slot.maxParticipants && (
                          <span className="badge text-xs text-orange-600 bg-orange-50 border-orange-200 mt-1">
                            Grupinė · ≤{slot.maxParticipants} dalyvių
                          </span>
                        )}
                      </div>

                      {isSelected && (
                        <CheckCircle size={20} className="text-[#FF5733] shrink-0" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Service selection + confirm */}
      {selectedSlot && (
        <div className="card p-6">
          {(() => {
            const slotSvcs =
              selectedSlot.services?.length > 0
                ? selectedSlot.services
                : selectedSlot.trainer.services;
            const isSlotSpecific = (selectedSlot.services?.length ?? 0) > 0;
            return (
              <>
                <h3 className="font-800 text-[#0B5C71] mb-1">Pasirinkite paslaugą</h3>
                <p className="text-xs text-gray-400 mb-4">
                  {isSlotSpecific
                    ? "Rodomos tik šiam laikui priskirtos paslaugos"
                    : "Neprivaloma"}
                </p>

                {slotSvcs.length > 0 ? (
                  <div className="flex flex-col gap-2 mb-5">
                    <button
                      onClick={() => setSelectedService(null)}
                      className={cn(
                        "w-full text-left p-3 rounded-xl border-2 transition-all",
                        !selectedService
                          ? "border-[#FF5733] bg-[#FF5733]/5"
                          : "border-gray-200 hover:border-gray-300"
                      )}
                    >
                      <p className="font-600 text-sm text-gray-700">Be konkretios paslaugos</p>
                    </button>
                    {slotSvcs.map((svc) => (
                      <button
                        key={svc.id}
                        onClick={() => setSelectedService(svc)}
                        className={cn(
                          "w-full text-left p-3 rounded-xl border-2 transition-all",
                          selectedService?.id === svc.id
                            ? "border-[#FF5733] bg-[#FF5733]/5"
                            : "border-gray-200 hover:border-gray-300"
                        )}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-700 text-sm text-[#0B5C71]">{svc.name}</p>
                            {svc.description && (
                              <p className="text-xs text-gray-500 mt-0.5">{svc.description}</p>
                            )}
                            <p className="text-xs text-gray-400 mt-0.5">
                              <Clock size={10} className="inline mr-0.5" />
                              {svc.durationMinutes} min
                            </p>
                          </div>
                          <span className="font-700 text-sm text-[#FF5733] shrink-0 ml-3">
                            {formatPrice(svc.price)}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 mb-5">
                    Treneris šiuo metu neturi nustatytų paslaugų.
                  </p>
                )}
              </>
            );
          })()}

          {/* Summary */}
          <div className="bg-gray-50 rounded-xl p-4 mb-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-[#0B5C71]/10 flex items-center justify-center text-xl">
                🏅
              </div>
              <div>
                <p className="font-700 text-[#0B5C71]">
                  {selectedSlot.trainer.displayName}
                </p>
                <p className="text-xs text-gray-500">
                  {selectedDate && format(selectedDate, "d MMMM yyyy", { locale: lt })},{" "}
                  {formatTime(selectedSlot.startTime)} – {formatTime(selectedSlot.endTime)}
                </p>
              </div>
            </div>
            <p className="text-sm text-gray-600 flex items-center gap-1">
              <MapPin size={13} />
              {selectedSlot.arena.name}, {selectedSlot.arena.address}
            </p>
            {selectedService && (
              <p className="text-sm text-[#FF5733] font-600 mt-2">
                {selectedService.name} – {formatPrice(selectedService.price)}
              </p>
            )}
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
              <><Loader2 size={18} className="animate-spin" />Rezervuojama...</>
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
