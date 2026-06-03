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
  ChevronRight as ArrowRight,
  Users,
} from "lucide-react";
import { cn, formatServicePrice } from "@/lib/utils";
import FilterBar, { FilterGroup } from "@/components/FilterBar";

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
  type?: "INDIVIDUAL" | "GROUP" | null;
  priceType?: "TOTAL" | "PER_PERSON" | null;
}

interface AvailabilitySlot {
  id: string;
  startTime: string;
  endTime: string;
  maxParticipants?: number | null;
  currentBookings?: number;
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

interface TimeGroup {
  key: string;
  startTime: string;
  endTime: string;
  slots: AvailabilitySlot[];
}

function formatTime(isoStr: string) {
  return format(parseISO(isoStr), "HH:mm");
}

function TrainerAvatar({ slot, size = "md" }: { slot: AvailabilitySlot; size?: "sm" | "md" }) {
  const sz = size === "sm" ? "w-7 h-7 text-xs" : "w-9 h-9 text-sm";
  if (slot.trainer.photoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={slot.trainer.photoUrl}
        alt={slot.trainer.displayName}
        className={cn(sz, "rounded-full object-cover border-2 border-white")}
      />
    );
  }
  return (
    <div className={cn(sz, "rounded-full bg-[#0B5C71] flex items-center justify-center font-800 text-white border-2 border-white")}>
      {slot.trainer.displayName[0]}
    </div>
  );
}

// ── Modal (bottom sheet on mobile, centered popup on desktop) ────────────────

function Modal({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex flex-col justify-end sm:items-center sm:justify-center transition-opacity duration-300",
        open ? "opacity-100" : "opacity-0 pointer-events-none"
      )}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Panel — bottom sheet on mobile, centered card on desktop */}
      <div
        className={cn(
          "relative bg-white flex flex-col shadow-2xl max-h-[88vh]",
          "rounded-t-3xl sm:rounded-3xl sm:w-full sm:max-w-lg sm:max-h-[85vh]",
          "transition-transform duration-300 ease-out",
          open ? "translate-y-0" : "translate-y-full sm:translate-y-0"
        )}
      >
        {/* Drag handle — mobile only */}
        <div className="sm:hidden flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-10 h-1 rounded-full bg-gray-300" />
        </div>
        <div className="overflow-y-auto flex-1 pb-8">
          {children}
        </div>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

interface Props {
  initialTrainerId?: string;
  initialArenaId?: string;
  initialTrainerName?: string;
  initialArenaName?: string;
  availableSports?: Sport[];
  availableCities?: string[];
}

export default function MultiTrainerBooking({
  initialTrainerId = "",
  initialArenaId = "",
  initialTrainerName = "",
  initialArenaName = "",
  availableSports = [],
  availableCities = [],
}: Props) {
  const isContextMode = !!(initialTrainerId || initialArenaId);
  const [sport, setSport] = useState("");
  const [city, setCity] = useState("");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [loading, setLoading] = useState(false);

  // Sheet state
  const [activeGroup, setActiveGroup] = useState<TimeGroup | null>(null); // Sheet 1
  const [activeSlot, setActiveSlot] = useState<AvailabilitySlot | null>(null); // Sheet 2
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  // Booking state
  const [booking, setBooking] = useState(false);
  const [success, setSuccess] = useState(false);
  const [bookedSlot, setBookedSlot] = useState<AvailabilitySlot | null>(null);
  const [bookedService, setBookedService] = useState<Service | null>(null);
  const [error, setError] = useState("");

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  // Group slots by start+end time
  const timeGroups: TimeGroup[] = (() => {
    const map = new Map<string, AvailabilitySlot[]>();
    for (const slot of slots) {
      const key = `${slot.startTime}|${slot.endTime}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(slot);
    }
    return Array.from(map.entries())
      .map(([key, s]) => ({ key, startTime: s[0].startTime, endTime: s[0].endTime, slots: s }))
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  })();

  const fetchSlots = useCallback(
    (date: Date) => {
      setLoading(true);
      setSlots([]);
      const dayStart = new Date(date); dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(date); dayEnd.setHours(23, 59, 59, 999);
      const params = new URLSearchParams();
      params.set("from", dayStart.toISOString());
      params.set("to", dayEnd.toISOString());
      if (initialTrainerId) params.set("trainerId", initialTrainerId);
      else if (initialArenaId) params.set("arenaId", initialArenaId);
      else {
        if (sport.trim()) params.set("sport", sport.trim());
        if (city.trim()) params.set("city", city.trim());
      }
      fetch(`/api/availability?${params}`)
        .then((r) => r.json())
        .then((data) => setSlots(Array.isArray(data) ? data : []))
        .catch(console.error)
        .finally(() => setLoading(false));
    },
    [sport, city, initialTrainerId, initialArenaId]
  );

  useEffect(() => { if (selectedDate) fetchSlots(selectedDate); }, [selectedDate, fetchSlots]);

  const openGroup = (group: TimeGroup) => {
    setActiveGroup(group);
    setActiveSlot(null);
    setSelectedService(null);
    setError("");
  };

  const openSlot = (slot: AvailabilitySlot) => {
    setActiveSlot(slot);
    setSelectedService(null);
    setError("");
  };

  const closeAll = () => {
    setActiveGroup(null);
    setActiveSlot(null);
    setSelectedService(null);
    setError("");
  };

  const handleBook = async () => {
    if (!activeSlot || !selectedService) return;
    setBooking(true);
    setError("");
    const res = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        availabilitySlotId: activeSlot.id,
        trainerId: activeSlot.trainer.id,
        arenaId: activeSlot.arena.id,
        serviceId: selectedService.id,
      }),
    });
    setBooking(false);
    if (res.ok) {
      setBookedSlot(activeSlot);
      setBookedService(selectedService);
      closeAll();
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
        {bookedSlot && (
          <div className="mt-4 bg-gray-50 rounded-2xl p-5 text-left space-y-1">
            <p className="font-700 text-[#0B5C71]">{bookedSlot.trainer.displayName}</p>
            <p className="text-sm text-gray-500">
              {selectedDate && format(selectedDate, "d MMMM yyyy", { locale: lt })},{" "}
              {formatTime(bookedSlot.startTime)} – {formatTime(bookedSlot.endTime)}
            </p>
            <p className="text-sm text-gray-500 flex items-center gap-1">
              <MapPin size={13} /> {bookedSlot.arena.name}, {bookedSlot.arena.city}
            </p>
            {bookedService && (
              <p className="text-sm text-[#FF5733] font-600">
                {bookedService.name} · {formatServicePrice(bookedService.price, bookedService.type, bookedService.priceType)}
              </p>
            )}
          </div>
        )}
        <div className="flex gap-3 justify-center mt-8">
          <a href="/client/bookings" className="btn-primary">Mano rezervacijos</a>
          <button
            onClick={() => { setSuccess(false); setBookedSlot(null); setSelectedDate(null); }}
            className="btn-secondary"
          >
            Rezervuoti dar
          </button>
        </div>
      </div>
    );
  }

  const filterGroups: FilterGroup[] = isContextMode ? [] : [
    ...(availableSports.length > 0 ? [{
      key: "sport",
      label: "Sportas",
      allLabel: "Visi sportai",
      options: availableSports.map((s) => ({ value: s.slug, label: s.name, icon: s.icon ?? undefined })),
      value: sport,
      onChange: (v: string) => { setSport(v); setSelectedDate(null); },
    }] : []),
    ...(availableCities.length > 0 ? [{
      key: "city",
      label: "Miestas",
      allLabel: "Visi miestai",
      options: availableCities.map((c) => ({ value: c, label: c })),
      value: city,
      onChange: (v: string) => { setCity(v); setSelectedDate(null); },
    }] : []),
  ];

  return (
    <div className="max-w-3xl mx-auto">
      {/* Context banner — when arriving from trainer/arena page */}
      {isContextMode ? (
        <div className="flex items-center gap-3 px-4 py-3 bg-[#0B5C71]/5 border border-[#0B5C71]/15 rounded-2xl mb-5">
          <div className="w-2 h-2 rounded-full bg-[#0B5C71] shrink-0" />
          <p className="text-sm font-600 text-[#0B5C71] flex-1 min-w-0 truncate">
            {initialTrainerName
              ? `Rodomi laikai: ${initialTrainerName}`
              : `Rodoma arena: ${initialArenaName}`}
          </p>
          <a
            href="/booking"
            className="flex items-center gap-1 text-xs text-gray-400 hover:text-[#FF5733] transition-colors shrink-0 font-600"
          >
            <X size={13} /> Visi laikai
          </a>
        </div>
      ) : filterGroups.length > 0 && (
        <div className="mb-5">
          <FilterBar
            groups={filterGroups}
            onClear={() => { setSport(""); setCity(""); setSelectedDate(null); }}
          />
        </div>
      )}

      {/* Calendar */}
      <div className="card p-6 mb-5">
        <div className="flex items-center justify-between mb-5">
          <button onClick={() => setCurrentDate((d) => addDays(d, -7))}
            className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors">
            <ChevronLeft size={18} />
          </button>
          <h3 className="font-800 text-[#0B5C71]">{format(weekStart, "MMMM yyyy", { locale: lt })}</h3>
          <button onClick={() => setCurrentDate((d) => addDays(d, 7))}
            className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors">
            <ChevronRight size={18} />
          </button>
        </div>
        <div className="grid grid-cols-7 gap-2">
          {days.map((day) => {
            const past = isPast(day) && !isToday(day);
            const selected = selectedDate && isSameDay(day, selectedDate);
            return (
              <button key={day.toISOString()} onClick={() => !past && setSelectedDate(day)} disabled={past}
                className={cn(
                  "flex flex-col items-center py-3 px-1 rounded-xl border-2 transition-all text-center",
                  past ? "opacity-30 cursor-not-allowed border-transparent"
                    : selected ? "border-[#FF5733] bg-[#FF5733] text-white"
                    : isToday(day) ? "border-[#FF5733]/40 bg-[#FF5733]/5 text-[#FF5733] hover:border-[#FF5733]"
                    : "border-gray-100 hover:border-[#FF5733]/50 hover:bg-gray-50"
                )}
              >
                <span className="text-xs font-600 uppercase opacity-70">{format(day, "EEE", { locale: lt }).slice(0, 2)}</span>
                <span className="font-800 text-lg mt-0.5">{format(day, "d")}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Time slots */}
      {selectedDate && (
        <div className="card p-6">
          <h3 className="font-800 text-[#0B5C71] mb-4">
            Laisvi laikai:{" "}
            <span className="text-[#FF5733]">{format(selectedDate, "d MMMM", { locale: lt })}</span>
          </h3>

          {loading ? (
            <div className="flex items-center justify-center py-12 gap-3 text-gray-400">
              <Loader2 size={22} className="animate-spin" /><span>Kraunama...</span>
            </div>
          ) : timeGroups.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              <p className="text-4xl mb-3">😔</p>
              <p className="font-600">Šią dieną laisvų laikų nėra</p>
              <p className="text-sm mt-1">Pasirinkite kitą dieną</p>
            </div>
          ) : (
            <div className="flex flex-col sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
              {timeGroups.map((group) => {
                const count = group.slots.length;
                const visibleAvatars = group.slots.slice(0, 3);
                const extra = count - 3;
                const hasGroup = group.slots.some(s => s.maxParticipants && s.maxParticipants > 0);
                return (
                  <button
                    key={group.key}
                    onClick={() => openGroup(group)}
                    className="relative text-left rounded-2xl border-2 border-gray-100 bg-white hover:border-[#FF5733]/60 hover:shadow-md transition-all group active:scale-[0.98]"
                  >
                    {/* Mobile: horizontal row layout */}
                    <div className="flex items-center gap-3 px-4 py-3 sm:hidden">
                      <div className="shrink-0 w-16">
                        <p className="font-900 text-xl text-[#0B5C71] leading-none">{formatTime(group.startTime)}</p>
                        <p className="text-xs text-gray-400 font-500">– {formatTime(group.endTime)}</p>
                      </div>
                      <div className="flex-1 flex items-center gap-2 min-w-0">
                        <div className="flex -space-x-2 shrink-0">
                          {visibleAvatars.map((slot) => (
                            <TrainerAvatar key={slot.id} slot={slot} size="sm" />
                          ))}
                          {extra > 0 && (
                            <div className="w-7 h-7 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-xs font-700 text-gray-500">
                              +{extra}
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-600 text-gray-600">
                            {count === 1 ? "1 treneris" : `${count} treneriai`}
                          </p>
                          {hasGroup && (
                            <span className="text-xs text-orange-600 font-600">
                              <Users size={9} className="inline mr-0.5" />grupinė
                            </span>
                          )}
                        </div>
                      </div>
                      <ArrowRight size={14} className="text-gray-300 group-hover:text-[#FF5733] transition-colors shrink-0" />
                    </div>

                    {/* Desktop: vertical card layout */}
                    <div className="hidden sm:block p-4">
                      <p className="font-900 text-2xl text-[#0B5C71] leading-none">{formatTime(group.startTime)}</p>
                      <p className="text-xs text-gray-400 font-500 mt-0.5 mb-3">– {formatTime(group.endTime)}</p>
                      <div className="flex -space-x-2 mb-2">
                        {visibleAvatars.map((slot) => (
                          <TrainerAvatar key={slot.id} slot={slot} size="sm" />
                        ))}
                        {extra > 0 && (
                          <div className="w-7 h-7 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-xs font-700 text-gray-500">
                            +{extra}
                          </div>
                        )}
                      </div>
                      <p className="text-xs font-600 text-gray-500">
                        {count === 1 ? "1 treneris" : `${count} treneriai`}
                      </p>
                      {hasGroup && (
                        <span className="absolute top-3 right-3 text-xs px-1.5 py-0.5 rounded-md bg-orange-100 text-orange-600 font-600">
                          <Users size={10} className="inline mr-0.5" />grupinė
                        </span>
                      )}
                      <div className="absolute bottom-3 right-3 text-gray-300 group-hover:text-[#FF5733] transition-colors">
                        <ArrowRight size={14} />
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── Sheet 1: Trainer selection ─────────────────────────────────────── */}
      <Modal open={!!activeGroup && !activeSlot} onClose={closeAll}>
        {activeGroup && (
          <div className="px-4 pt-2">
            {/* Header */}
            <div className="flex items-start justify-between mb-5">
              <div>
                <p className="text-xs font-600 text-gray-400 uppercase tracking-wider mb-0.5">
                  {selectedDate && format(selectedDate, "d MMMM yyyy", { locale: lt })}
                </p>
                <p className="font-900 text-3xl text-[#0B5C71]">
                  {formatTime(activeGroup.startTime)}
                  <span className="text-gray-400 font-400 text-xl ml-2">– {formatTime(activeGroup.endTime)}</span>
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {activeGroup.slots.length === 1
                    ? "1 treneris prieinamas"
                    : `${activeGroup.slots.length} treneriai prieinami`}
                </p>
              </div>
              <button onClick={closeAll}
                className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors mt-1">
                <X size={16} />
              </button>
            </div>

            {/* Trainer cards */}
            <div className="flex flex-col gap-3 pb-2">
              {activeGroup.slots.map((slot) => {
                const isGroup = slot.maxParticipants && slot.maxParticipants > 0;
                const isFull = isGroup && (slot.currentBookings ?? 0) >= slot.maxParticipants!;
                const spotsLeft = isGroup ? slot.maxParticipants! - (slot.currentBookings ?? 0) : null;
                return (
                  <button
                    key={slot.id}
                    onClick={() => !isFull && openSlot(slot)}
                    disabled={!!isFull}
                    className={cn(
                      "w-full text-left p-4 rounded-2xl border-2 transition-all",
                      isFull
                        ? "border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed"
                        : "border-gray-100 hover:border-[#FF5733] hover:shadow-md active:scale-[0.99]"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      {/* Avatar */}
                      <div className="shrink-0">
                        <TrainerAvatar slot={slot} />
                      </div>
                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="font-700 text-[#0B5C71] text-sm">{slot.trainer.displayName}</p>
                        <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                          <MapPin size={10} /> {slot.arena.name}, {slot.arena.city}
                        </p>
                        {isGroup && (
                          <p className={cn(
                            "text-xs font-600 mt-1",
                            isFull ? "text-red-500" : spotsLeft && spotsLeft <= 2 ? "text-orange-500" : "text-green-600"
                          )}>
                            {isFull
                              ? "Vietos užimtos"
                              : `${slot.currentBookings ?? 0}/${slot.maxParticipants} dalyvių · Laisva ${spotsLeft}`}
                          </p>
                        )}
                        {/* Service hint */}
                        {slot.services.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {slot.services.slice(0, 2).map((svc) => (
                              <span key={svc.id} className="text-xs px-1.5 py-0.5 bg-[#0B5C71]/10 text-[#0B5C71] rounded font-600">
                                {svc.name}
                              </span>
                            ))}
                            {slot.services.length > 2 && (
                              <span className="text-xs text-gray-400">+{slot.services.length - 2}</span>
                            )}
                          </div>
                        )}
                      </div>
                      {!isFull && (
                        <ArrowRight size={16} className="text-gray-300 shrink-0" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </Modal>

      {/* ── Sheet 2: Service selection + Book ─────────────────────────────── */}
      <Modal open={!!activeSlot} onClose={() => { setActiveSlot(null); setError(""); }}>
        {activeSlot && (() => {
          const slotSvcs = activeSlot.services?.length > 0
            ? activeSlot.services
            : activeSlot.trainer.services;
          const isGroup = activeSlot.maxParticipants && activeSlot.maxParticipants > 0;
          return (
            <div className="px-4 pt-2">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <button
                  onClick={() => { setActiveSlot(null); setError(""); }}
                  className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#0B5C71] transition-colors"
                >
                  <ChevronLeft size={16} /> Atgal
                </button>
                <button onClick={closeAll}
                  className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors">
                  <X size={16} />
                </button>
              </div>

              {/* Trainer summary */}
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl mb-5">
                <TrainerAvatar slot={activeSlot} />
                <div className="flex-1 min-w-0">
                  <p className="font-700 text-[#0B5C71]">{activeSlot.trainer.displayName}</p>
                  <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                    <MapPin size={10} /> {activeSlot.arena.name}, {activeSlot.arena.city}
                  </p>
                  <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                    <Clock size={10} />
                    {selectedDate && format(selectedDate, "d MMMM yyyy", { locale: lt })},{" "}
                    {formatTime(activeSlot.startTime)} – {formatTime(activeSlot.endTime)}
                  </p>
                </div>
                {isGroup && (
                  <div className="shrink-0 text-right">
                    <p className="text-xs font-700 text-orange-600">Grupinė</p>
                    <p className="text-xs text-gray-400">
                      {activeSlot.currentBookings ?? 0}/{activeSlot.maxParticipants}
                    </p>
                  </div>
                )}
              </div>

              {/* Service selection */}
              <div className="mb-5">
                <p className="font-700 text-[#0B5C71] mb-1">
                  Paslauga <span className="text-[#FF5733]">*</span>
                </p>
                <p className="text-xs text-gray-400 mb-3">
                  {(activeSlot.services?.length ?? 0) > 0
                    ? "Šiam laikui priskirtos paslaugos"
                    : "Paslauga privaloma"}
                </p>

                {slotSvcs.length > 0 ? (
                  <div className="flex flex-col gap-2">
                    {slotSvcs.map((svc) => {
                      const active = selectedService?.id === svc.id;
                      return (
                        <button
                          key={svc.id}
                          onClick={() => setSelectedService(svc)}
                          className={cn(
                            "w-full text-left p-3.5 rounded-xl border-2 transition-all",
                            active
                              ? "border-[#FF5733] bg-[#FF5733]/5"
                              : "border-gray-100 hover:border-[#FF5733]/40"
                          )}
                        >
                          <div className="flex justify-between items-start gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <div className={cn(
                                  "w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors",
                                  active ? "border-[#FF5733] bg-[#FF5733]" : "border-gray-300"
                                )}>
                                  {active && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                                </div>
                                <p className="font-700 text-sm text-[#0B5C71]">{svc.name}</p>
                              </div>
                              {(svc as any).sport && (
                                <span className="text-xs text-gray-400 ml-6">
                                  {(svc as any).sport.icon} {(svc as any).sport.name}
                                </span>
                              )}
                              {svc.description && (
                                <p className="text-xs text-gray-500 mt-1 ml-6">{svc.description}</p>
                              )}
                              <p className="text-xs text-gray-400 mt-0.5 ml-6 flex items-center gap-1">
                                <Clock size={10} /> {svc.durationMinutes} min
                              </p>
                            </div>
                            <span className={cn(
                              "font-800 text-base shrink-0",
                              active ? "text-[#FF5733]" : "text-[#0B5C71]"
                            )}>
                              {formatServicePrice(svc.price, svc.type, svc.priceType)}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 p-4 bg-gray-50 rounded-xl">
                    Treneris šiuo metu neturi nustatytų paslaugų.
                  </p>
                )}
              </div>

              {error && (
                <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4">
                  {error}
                </p>
              )}

              {/* Book button */}
              <button
                onClick={handleBook}
                disabled={booking || !selectedService}
                className="btn-primary w-full justify-center text-base py-4 disabled:opacity-60 disabled:cursor-not-allowed rounded-2xl"
              >
                {booking ? (
                  <><Loader2 size={18} className="animate-spin mr-2" />Rezervuojama...</>
                ) : (
                  <>
                    ✅ Rezervuoti
                    {selectedService && (
                      <span className="ml-2 font-400 text-sm opacity-80">
                        · {formatServicePrice(selectedService.price, selectedService.type, selectedService.priceType)}
                      </span>
                    )}
                  </>
                )}
              </button>
              <p className="text-xs text-gray-400 text-center mt-3">
                Reikalinga paskyra. Patvirtinimas el. paštu.
              </p>
            </div>
          );
        })()}
      </Modal>
    </div>
  );
}
