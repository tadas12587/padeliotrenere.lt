"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { CalendarDays, Plus, Trash2, Clock, MapPin, UserPlus, Tag, Users, X } from "lucide-react";
import BookForClientModal from "@/components/BookForClientModal";
import { formatServicePrice } from "@/lib/utils";

interface Arena {
  id: string;
  name: string;
  city: string;
}

interface TrainerArenaItem {
  arenaId: string;
  arena: Arena;
}

interface SlotService {
  id: string;
  name: string;
  durationMinutes: number;
  price: string | number | null;
  type: "INDIVIDUAL" | "GROUP";
  priceType: "TOTAL" | "PER_PERSON" | null;
}

interface TrainerService {
  id: string;
  name: string;
  durationMinutes: number;
  price: string | number | null;
  type: "INDIVIDUAL" | "GROUP";
  priceType: "TOTAL" | "PER_PERSON" | null;
  maxParticipants?: number | null;
}

interface AvailabilitySlot {
  id: string;
  startTime: string;
  endTime: string;
  status: string;
  maxParticipants: number | null;
  currentBookings?: number;
  arena: Arena;
  services: SlotService[];
}

interface SlotParticipant {
  id: string;
  status: string;
  user: { id: string; name: string | null; email: string | null; image?: string | null };
  service: { name: string } | null;
  createdAt: string;
}

type RecurrenceType = "none" | "weekly" | "daily";

export default function TrainerCalendarPage() {
  const [trainerArenas, setTrainerArenas] = useState<TrainerArenaItem[]>([]);
  const [trainerServices, setTrainerServices] = useState<TrainerService[]>([]);
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [trainerId, setTrainerId] = useState<string | null>(null);

  // Form state
  const [arenaId, setArenaId] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);
  const [maxParticipants, setMaxParticipants] = useState("");
  const [adding, setAdding] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Recurrence state
  const [recurrenceType, setRecurrenceType] = useState<RecurrenceType>("none");
  const [untilDate, setUntilDate] = useState("");
  const [selectedDays, setSelectedDays] = useState<number[]>([]);

  const [bookingSlot, setBookingSlot] = useState<AvailabilitySlot | null>(null);
  const [showPast, setShowPast] = useState(false);

  // Participants panel state
  const [participantSlot, setParticipantSlot] = useState<AvailabilitySlot | null>(null);
  const [participants, setParticipants] = useState<SlotParticipant[]>([]);
  const [loadingParticipants, setLoadingParticipants] = useState(false);

  const fetchSlots = useCallback(async (tid: string) => {
    try {
      const res = await fetch(`/api/availability?trainerId=${tid}&own=1`);
      const data = await res.json();
      if (!Array.isArray(data)) { setSlots([]); return; }
      const now = Date.now();
      setSlots(
        data
          .map((s: any) => ({ ...s, currentBookings: s.currentBookings ?? 0 }))
          .sort((a: AvailabilitySlot, b: AvailabilitySlot) => {
            const aMs = new Date(a.startTime).getTime();
            const bMs = new Date(b.startTime).getTime();
            const aFuture = aMs >= now;
            const bFuture = bMs >= now;
            if (aFuture && !bFuture) return -1;
            if (!aFuture && bFuture) return 1;
            // Both future: nearest first; both past: most recent first
            return aFuture ? aMs - bMs : bMs - aMs;
          })
      );
    } catch {
      setSlots([]);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      try {
        const [profileRes, servicesRes] = await Promise.all([
          fetch("/api/trainer/profile"),
          fetch("/api/trainer/services"),
        ]);
        if (profileRes.ok) {
          const data = await profileRes.json();
          setTrainerId(data.id);
          setTrainerArenas(data.arenas || []);
          if (data.arenas?.length > 0) setArenaId(data.arenas[0].arenaId);
          await fetchSlots(data.id);
        }
        if (servicesRes.ok) {
          const svcs = await servicesRes.json();
          setTrainerServices(Array.isArray(svcs) ? svcs : []);
        }
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [fetchSlots]);

  useEffect(() => {
    if (recurrenceType === "weekly" && date) {
      const d = new Date(date + "T00:00:00");
      setSelectedDays([d.getDay()]);
    }
  }, [date, recurrenceType]);

  const toggleDay = (day: number) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const toggleService = (id: string) => {
    setSelectedServiceIds((prev) => {
      const next = prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id];
      // Auto-fill maxParticipants from a GROUP service when field is empty
      if (!prev.includes(id)) {
        const svc = trainerServices.find((s) => s.id === id);
        if (svc?.type === "GROUP" && svc.maxParticipants && !maxParticipants) {
          setMaxParticipants(String(svc.maxParticipants));
        }
      }
      return next;
    });
  };

  const previewCount = useMemo(() => {
    if (recurrenceType === "none" || !date || !untilDate) return 1;
    const baseDate = new Date(date + "T00:00:00");
    const until = new Date(untilDate + "T23:59:59");
    if (until < baseDate) return 0;
    let count = 0;
    const current = new Date(baseDate);
    const dayMs = 24 * 60 * 60 * 1000;
    while (current <= until) {
      if (recurrenceType === "daily") {
        count++;
      } else if (recurrenceType === "weekly") {
        const days = selectedDays.length > 0 ? selectedDays : [baseDate.getDay()];
        if (days.includes(current.getDay())) count++;
      }
      current.setTime(current.getTime() + dayMs);
    }
    return Math.min(count, 365);
  }, [recurrenceType, date, untilDate, selectedDays]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!arenaId || !date || !startTime || !endTime) {
      setMessage({ type: "error", text: "Užpildykite visus laukus" });
      return;
    }
    if (recurrenceType !== "none" && !untilDate) {
      setMessage({ type: "error", text: "Pasirinkite pabaigos datą" });
      return;
    }

    setAdding(true);
    setMessage(null);

    try {
      const startDateTime = new Date(`${date}T${startTime}:00`);
      const endDateTime = new Date(`${date}T${endTime}:00`);

      if (endDateTime <= startDateTime) {
        throw new Error("Pabaigos laikas turi būti vėliau nei pradžios");
      }

      const recurrence =
        recurrenceType === "none"
          ? { type: "none" }
          : recurrenceType === "daily"
          ? { type: "daily", until: untilDate }
          : {
              type: "weekly",
              daysOfWeek: selectedDays.length > 0 ? selectedDays : [startDateTime.getUTCDay()],
              until: untilDate,
            };

      const res = await fetch("/api/availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          arenaId,
          startTime: startDateTime.toISOString(),
          endTime: endDateTime.toISOString(),
          recurrence,
          serviceIds: selectedServiceIds,
          ...(maxParticipants ? { maxParticipants: Number(maxParticipants) } : {}),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Klaida");
      }

      const result = await res.json();
      const created = result.created ?? 1;

      setDate("");
      setStartTime("");
      setEndTime("");
      setUntilDate("");
      setSelectedDays([]);
      setRecurrenceType("none");
      setSelectedServiceIds([]);
      setMaxParticipants("");
      setMessage({
        type: "success",
        text:
          created === 1
            ? "Laiko tarpas pridėtas!"
            : `Sukurta ${created} laiko tarp${
                created % 10 === 1 && created % 100 !== 11
                  ? "as"
                  : created % 10 >= 2 && created % 10 <= 9 && (created % 100 < 10 || created % 100 >= 20)
                  ? "ai"
                  : "ų"
              }!`,
      });
      if (trainerId) await fetchSlots(trainerId);
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Nepavyko pridėti laiko tarpo" });
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Ar tikrai norite ištrinti šį laiko tarpą?")) return;
    try {
      const res = await fetch(`/api/availability/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Klaida");
      }
      setSlots((prev) => prev.filter((s) => s.id !== id));
      setMessage({ type: "success", text: "Laiko tarpas ištrintas." });
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Nepavyko ištrinti." });
    }
  };

  const openParticipants = async (slot: AvailabilitySlot) => {
    setParticipantSlot(slot);
    setParticipants([]);
    setLoadingParticipants(true);
    try {
      const res = await fetch(`/api/availability/${slot.id}/bookings`);
      const data = await res.json();
      setParticipants(Array.isArray(data) ? data : []);
    } catch {
      setParticipants([]);
    } finally {
      setLoadingParticipants(false);
    }
  };

  const removeParticipant = async (slotId: string, bookingId: string) => {
    if (!confirm("Ar tikrai norite pašalinti šį dalyvį?")) return;
    try {
      const res = await fetch(`/api/availability/${slotId}/bookings`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Klaida");
      }
      // Refresh participants list
      const updated = await fetch(`/api/availability/${slotId}/bookings`);
      const data = await updated.json();
      setParticipants(Array.isArray(data) ? data : []);
      // Refresh slots
      if (trainerId) await fetchSlots(trainerId);
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Nepavyko pašalinti dalyvio." });
    }
  };

  const formatDateTime = (dt: string) =>
    new Date(dt).toLocaleString("lt-LT", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });

  const inputCls =
    "w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF5733]/20 focus:border-[#FF5733]";
  const labelCls = "block text-sm font-700 text-gray-700 mb-1.5";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-900 text-[#0B5C71]">Kalendorius</h1>
        <p className="text-gray-500 text-sm mt-1">Valdykite savo prieinamumo laiko tarpus</p>
      </div>

      {message && (
        <div
          className={`p-4 rounded-xl text-sm font-600 ${
            message.type === "success"
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Add form */}
      <div className="card p-6">
        <h2 className="font-800 text-[#0B5C71] mb-4 flex items-center gap-2">
          <Plus size={18} />
          Pridėti laiko tarpą
        </h2>

        {!loading && trainerArenas.length === 0 ? (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-sm text-yellow-700">
            Norint pridėti laiko tarpus, pirmiausia pridėkite arenas savo{" "}
            <a href="/trainer/profile" className="font-700 underline">
              profilyje
            </a>
            .
          </div>
        ) : (
          <form onSubmit={handleAdd} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>
                  Arena <span className="text-[#FF5733]">*</span>
                </label>
                <select
                  value={arenaId}
                  onChange={(e) => setArenaId(e.target.value)}
                  required
                  className={inputCls}
                >
                  <option value="">Pasirinkite areną</option>
                  {trainerArenas.map((ta) => (
                    <option key={ta.arenaId} value={ta.arenaId}>
                      {ta.arena.name} — {ta.arena.city}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelCls}>
                  Data <span className="text-[#FF5733]">*</span>
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  min={new Date().toISOString().split("T")[0]}
                  className={inputCls}
                />
              </div>

              <div>
                <label className={labelCls}>
                  Pradžia <span className="text-[#FF5733]">*</span>
                </label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  required
                  className={inputCls}
                />
              </div>

              <div>
                <label className={labelCls}>
                  Pabaiga <span className="text-[#FF5733]">*</span>
                </label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  required
                  className={inputCls}
                />
              </div>
            </div>

            {/* Service picker */}
            {trainerServices.length > 0 && (
              <div className="pt-2 border-t border-gray-100">
                <label className={labelCls}>
                  Paslaugos šiam laikui{" "}
                  <span className="text-gray-400 font-400">(neprivaloma — pasirinkus, bookinge bus siūlomos tik jos)</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {trainerServices.map((svc) => {
                    const checked = selectedServiceIds.includes(svc.id);
                    return (
                      <button
                        key={svc.id}
                        type="button"
                        onClick={() => toggleService(svc.id)}
                        className={`text-left p-3 rounded-xl border-2 transition-all flex items-start gap-3 ${
                          checked
                            ? "border-[#0B5C71] bg-[#0B5C71]/5"
                            : "border-gray-200 bg-white hover:border-[#0B5C71]/40"
                        }`}
                      >
                        <div
                          className={`w-4 h-4 mt-0.5 rounded border-2 shrink-0 flex items-center justify-center transition-colors ${
                            checked
                              ? "bg-[#0B5C71] border-[#0B5C71]"
                              : "border-gray-300"
                          }`}
                        >
                          {checked && (
                            <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 10 10" fill="none">
                              <path d="M1.5 5L4 7.5L8.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-700 text-[#0B5C71] leading-tight">{svc.name}</p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {svc.durationMinutes} min · {formatServicePrice(svc.price, svc.type, svc.priceType)}
                            {svc.type === "GROUP" ? ` · Grupinė${svc.maxParticipants ? ` (iki ${svc.maxParticipants} asm.)` : ""}` : ""}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
                {selectedServiceIds.length > 0 && (
                  <p className="text-xs text-[#0B5C71] font-600 mt-2">
                    Pasirinkta: {selectedServiceIds.length} paslaug{selectedServiceIds.length === 1 ? "a" : "os"}
                  </p>
                )}
              </div>
            )}

            {/* Group training capacity */}
            <div className="pt-2 border-t border-gray-100">
              <label className={labelCls}>
                Maks. dalyvių{" "}
                <span className="text-gray-400 font-400">(grupinei treniruotei — palikite tuščią individualiai)</span>
              </label>
              <input
                type="number"
                value={maxParticipants}
                onChange={(e) => setMaxParticipants(e.target.value)}
                min={2}
                placeholder="Neribota (individuali)"
                className={`max-w-xs ${inputCls}`}
              />
            </div>

            {/* Recurrence */}
            <div className="space-y-3 pt-2 border-t border-gray-100">
              <label className={labelCls}>Pasikartojimas</label>
              <div className="flex flex-wrap gap-3">
                {(
                  [
                    { value: "none", label: "Vienkartinis" },
                    { value: "weekly", label: "Kas savaitę" },
                    { value: "daily", label: "Kasdien" },
                  ] as { value: RecurrenceType; label: string }[]
                ).map((opt) => (
                  <label
                    key={opt.value}
                    className="flex items-center gap-2 cursor-pointer text-sm font-600 text-gray-700"
                  >
                    <input
                      type="radio"
                      name="recurrenceType"
                      value={opt.value}
                      checked={recurrenceType === opt.value}
                      onChange={() => {
                        setRecurrenceType(opt.value);
                        if (opt.value === "none") {
                          setUntilDate("");
                          setSelectedDays([]);
                        }
                      }}
                      className="accent-[#FF5733]"
                    />
                    {opt.label}
                  </label>
                ))}
              </div>

              {recurrenceType !== "none" && (
                <div className="space-y-3">
                  <div className="max-w-xs">
                    <label className={labelCls}>
                      Iki <span className="text-[#FF5733]">*</span>
                    </label>
                    <input
                      type="date"
                      value={untilDate}
                      onChange={(e) => setUntilDate(e.target.value)}
                      required
                      min={date || new Date().toISOString().split("T")[0]}
                      className={inputCls}
                    />
                  </div>

                  {recurrenceType === "weekly" && (
                    <div>
                      <label className={labelCls}>Savaitės dienos</label>
                      <div className="flex gap-2 flex-wrap">
                        {[
                          { day: 1, label: "P" },
                          { day: 2, label: "A" },
                          { day: 3, label: "T" },
                          { day: 4, label: "K" },
                          { day: 5, label: "P" },
                          { day: 6, label: "Š" },
                          { day: 0, label: "S" },
                        ].map(({ day, label }) => {
                          const checked = selectedDays.includes(day);
                          return (
                            <button
                              key={day}
                              type="button"
                              onClick={() => toggleDay(day)}
                              className={`w-9 h-9 rounded-lg text-sm font-700 border transition-colors ${
                                checked
                                  ? "bg-[#FF5733] text-white border-[#FF5733]"
                                  : "bg-white text-gray-500 border-gray-200 hover:border-[#FF5733]/50"
                              }`}
                            >
                              {label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <p className="text-sm text-[#0B5C71] font-600">
                    Sukurs {previewCount} laiko tarp
                    {previewCount === 1
                      ? "ą"
                      : previewCount % 10 >= 2 &&
                        previewCount % 10 <= 9 &&
                        (previewCount % 100 < 10 || previewCount % 100 >= 20)
                      ? "us"
                      : "ų"}
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={adding}
                className="btn-primary flex items-center gap-2 disabled:opacity-60"
              >
                <Plus size={16} />
                {adding ? "Pridedama..." : "Pridėti laiko tarpą"}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Slots list */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-800 text-[#0B5C71]">Visi laiko tarpai</h2>
          <div className="flex gap-2 text-xs font-600">
            <span className="flex items-center gap-1 text-green-600"><span className="w-2 h-2 rounded-full bg-green-400 inline-block" />Laisvas</span>
            <span className="flex items-center gap-1 text-orange-600"><span className="w-2 h-2 rounded-full bg-orange-400 inline-block" />Grupinė (pilna)</span>
            <span className="flex items-center gap-1 text-blue-600"><span className="w-2 h-2 rounded-full bg-blue-400 inline-block" />Užimtas</span>
          </div>
        </div>

        {loading ? (
          <p className="text-sm text-gray-400">Kraunama...</p>
        ) : slots.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            <CalendarDays size={40} className="mx-auto mb-3 opacity-30" />
            <p className="font-600">Laiko tarpų nėra</p>
            <p className="text-sm mt-1">Pridėkite laiko tarpus aukščiau</p>
          </div>
        ) : (() => {
          const now = new Date();
          const upcomingSlots = slots.filter((s) => new Date(s.startTime) >= now);
          const pastSlots = slots.filter((s) => new Date(s.startTime) < now);

          const renderSlot = (slot: AvailabilitySlot) => {
            const isGroup = slot.maxParticipants && slot.maxParticipants > 0;
            const isFull = isGroup && (slot.currentBookings ?? 0) >= slot.maxParticipants!;
            const cardBg = slot.status === "AVAILABLE"
              ? isGroup
                ? isFull ? "bg-orange-50 border-orange-200" : "bg-green-50 border-green-200"
                : "bg-gray-50 border-gray-100"
              : "bg-blue-50 border-blue-200";
            const iconBg = slot.status === "AVAILABLE"
              ? isGroup ? isFull ? "bg-orange-100" : "bg-green-100" : "bg-green-50"
              : "bg-blue-100";
            const iconColor = slot.status === "AVAILABLE"
              ? isGroup ? isFull ? "text-orange-500" : "text-green-500" : "text-green-500"
              : "text-blue-500";
            return (
              <div
                key={slot.id}
                className={`flex items-start justify-between p-4 rounded-xl border ${cardBg}`}
              >
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center shrink-0 mt-0.5`}>
                    <Clock size={18} className={iconColor} />
                  </div>
                  <div className="min-w-0">
                    <p className="font-700 text-[#0B5C71] text-sm">
                      {formatDateTime(slot.startTime)}{" "}
                      <span className="text-gray-400">–</span>{" "}
                      {new Date(slot.endTime).toLocaleTimeString("lt-LT", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                      <MapPin size={10} />
                      {slot.arena.name}, {slot.arena.city}
                    </p>
                    {slot.services && slot.services.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {slot.services.map((svc) => (
                          <span
                            key={svc.id}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#0B5C71]/10 text-[#0B5C71] text-xs font-600"
                          >
                            <Tag size={9} />
                            {svc.name}
                          </span>
                        ))}
                      </div>
                    )}
                    {isGroup && (
                      <span className={`badge text-xs mt-1.5 ${
                        isFull
                          ? "text-orange-700 bg-orange-100 border-orange-300"
                          : "text-green-700 bg-green-100 border-green-300"
                      }`}>
                        Grupinė · {slot.currentBookings ?? 0}/{slot.maxParticipants} dalyvių
                        {isFull ? " · Pilna" : ` · Laisva ${slot.maxParticipants! - (slot.currentBookings ?? 0)}`}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-3 shrink-0">
                  <span
                    className={`badge text-xs ${
                      slot.status === "AVAILABLE"
                        ? "text-green-600 bg-green-50 border-green-200"
                        : "text-blue-600 bg-blue-50 border-blue-200"
                    }`}
                  >
                    {slot.status === "AVAILABLE" ? "Laisvas" : "Užimtas"}
                  </span>
                  {isGroup && (
                    <button
                      onClick={() => openParticipants(slot)}
                      className="p-2 text-gray-400 hover:text-[#0B5C71] hover:bg-[#0B5C71]/10 rounded-lg transition-colors"
                      title="Dalyviai"
                    >
                      <Users size={16} />
                    </button>
                  )}
                  {slot.status === "AVAILABLE" && trainerId && (
                    <button
                      onClick={() => setBookingSlot(slot)}
                      className="p-2 text-gray-400 hover:text-[#0B5C71] hover:bg-[#0B5C71]/10 rounded-lg transition-colors"
                      title="Užsisakyti klientui"
                    >
                      <UserPlus size={16} />
                    </button>
                  )}
                  {slot.status === "AVAILABLE" && (
                    <button
                      onClick={() => handleDelete(slot.id)}
                      className="p-2 text-gray-400 hover:text-[#FF5733] hover:bg-[#FF5733]/10 rounded-lg transition-colors"
                      title="Ištrinti"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
            );
          };

          return (
            <div className="space-y-6">
              {/* Upcoming slots */}
              <div>
                <h3 className="text-sm font-700 text-[#0B5C71] mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-400 inline-block" />
                  Artimiausi laikai
                  <span className="text-gray-400 font-400">({upcomingSlots.length})</span>
                </h3>
                {upcomingSlots.length === 0 ? (
                  <p className="text-sm text-gray-400 py-4 text-center">Nėra artimesnių laiko tarpų</p>
                ) : (
                  <div className="space-y-3">{upcomingSlots.map(renderSlot)}</div>
                )}
              </div>

              {/* Past slots */}
              {pastSlots.length > 0 && (
                <div>
                  <button
                    onClick={() => setShowPast((v) => !v)}
                    className="flex items-center gap-2 text-sm font-700 text-gray-500 hover:text-[#0B5C71] transition-colors mb-3"
                  >
                    <span className="w-2 h-2 rounded-full bg-gray-300 inline-block" />
                    {showPast ? "Slėpti praėjusius" : `Rodyti praėjusius (${pastSlots.length})`}
                    <span className={`transition-transform ${showPast ? "rotate-180" : ""}`}>▾</span>
                  </button>
                  {showPast && (
                    <div className="space-y-3 opacity-60">
                      {pastSlots.map(renderSlot)}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })()}
      </div>

      {bookingSlot && trainerId && (
        <BookForClientModal
          slot={bookingSlot}
          trainerId={trainerId}
          slotServices={bookingSlot.services}
          onClose={() => setBookingSlot(null)}
          onBooked={async () => {
            setBookingSlot(null);
            if (trainerId) await fetchSlots(trainerId);
            setMessage({ type: "success", text: "Rezervacija sukurta!" });
          }}
        />
      )}

      {/* Participants panel/drawer */}
      {participantSlot && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="flex-1 bg-black/40"
            onClick={() => setParticipantSlot(null)}
          />
          {/* Drawer */}
          <div className="w-full max-w-md bg-white h-full overflow-y-auto shadow-2xl flex flex-col">
            <div className="p-5 border-b border-gray-100 flex items-start justify-between">
              <div>
                <h2 className="font-800 text-[#0B5C71] text-lg">Dalyviai</h2>
                <p className="text-sm text-gray-500 mt-0.5">
                  {formatDateTime(participantSlot.startTime)} –{" "}
                  {new Date(participantSlot.endTime).toLocaleTimeString("lt-LT", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {participantSlot.arena.name}, {participantSlot.arena.city}
                </p>
                <span className="badge text-xs text-orange-600 bg-orange-50 border-orange-200 mt-2 inline-block">
                  {participants.length}/{participantSlot.maxParticipants} dalyvių
                </span>
              </div>
              <button
                onClick={() => setParticipantSlot(null)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 p-5">
              {loadingParticipants ? (
                <div className="flex items-center justify-center py-12 text-gray-400 gap-2">
                  <div className="w-5 h-5 border-2 border-gray-300 border-t-[#0B5C71] rounded-full animate-spin" />
                  Kraunama...
                </div>
              ) : participants.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <Users size={36} className="mx-auto mb-3 opacity-30" />
                  <p className="font-600">Dalyvių nėra</p>
                  <p className="text-sm mt-1">Niekas dar neužsiregistravo</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {participants.map((p) => (
                    <div
                      key={p.id}
                      className="flex items-start justify-between p-4 bg-gray-50 rounded-xl border border-gray-100"
                    >
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className="w-9 h-9 rounded-full overflow-hidden shrink-0">
                          {p.user.image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={p.user.image} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-[#0B5C71] flex items-center justify-center text-white font-800 text-sm">
                              {(p.user.name || p.user.email || "?")[0].toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                        <p className="font-700 text-[#0B5C71] text-sm">
                          {p.user.name || "—"}
                        </p>
                        {p.user.email && (
                          <p className="text-xs text-gray-500 mt-0.5">{p.user.email}</p>
                        )}
                        {p.service && (
                          <p className="text-xs text-gray-400 mt-0.5">{p.service.name}</p>
                        )}
                        <span
                          className={`badge text-xs mt-1 inline-block ${
                            p.status === "CONFIRMED"
                              ? "text-green-600 bg-green-50 border-green-200"
                              : "text-yellow-600 bg-yellow-50 border-yellow-200"
                          }`}
                        >
                          {p.status === "CONFIRMED" ? "Patvirtinta" : "Laukiama"}
                        </span>
                        </div>
                      </div>
                      <button
                        onClick={() => removeParticipant(participantSlot.id, p.id)}
                        className="ml-3 px-3 py-1.5 rounded-lg bg-red-50 text-red-600 text-xs font-700 hover:bg-red-100 transition-colors border border-red-200 shrink-0"
                      >
                        Pašalinti
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
