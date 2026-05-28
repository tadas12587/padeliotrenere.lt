"use client";

import { useState, useEffect, useCallback } from "react";
import { CalendarDays, Plus, Trash2, Clock, MapPin } from "lucide-react";

interface Arena {
  id: string;
  name: string;
  city: string;
}

interface TrainerArenaItem {
  arenaId: string;
  arena: Arena;
}

interface AvailabilitySlot {
  id: string;
  startTime: string;
  endTime: string;
  status: string;
  arena: Arena;
}

export default function TrainerCalendarPage() {
  const [trainerArenas, setTrainerArenas] = useState<TrainerArenaItem[]>([]);
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [trainerId, setTrainerId] = useState<string | null>(null);

  // Form state
  const [arenaId, setArenaId] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [adding, setAdding] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchSlots = useCallback(async (tid: string) => {
    try {
      const res = await fetch(`/api/availability?trainerId=${tid}`);
      const data = await res.json();
      setSlots(Array.isArray(data) ? data : []);
    } catch {
      setSlots([]);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      try {
        const res = await fetch("/api/trainer/profile");
        if (res.ok) {
          const data = await res.json();
          setTrainerId(data.id);
          setTrainerArenas(data.arenas || []);
          if (data.arenas?.length > 0) {
            setArenaId(data.arenas[0].arenaId);
          }
          await fetchSlots(data.id);
        }
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [fetchSlots]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!arenaId || !date || !startTime || !endTime) {
      setMessage({ type: "error", text: "Užpildykite visus laukus" });
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

      const res = await fetch("/api/availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          arenaId,
          startTime: startDateTime.toISOString(),
          endTime: endDateTime.toISOString(),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Klaida");
      }

      setDate("");
      setStartTime("");
      setEndTime("");
      setMessage({ type: "success", text: "Laiko tarpas pridėtas!" });
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

  const formatDateTime = (dt: string) => {
    const d = new Date(dt);
    return d.toLocaleString("lt-LT", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-900 text-[#0B5C71]">Kalendorius</h1>
        <p className="text-gray-500 text-sm mt-1">
          Valdykite savo prieinamumo laiko tarpus
        </p>
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
          <form onSubmit={handleAdd} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-700 text-gray-700 mb-1.5">
                Arena <span className="text-[#FF5733]">*</span>
              </label>
              <select
                value={arenaId}
                onChange={(e) => setArenaId(e.target.value)}
                required
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF5733]/20 focus:border-[#FF5733]"
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
              <label className="block text-sm font-700 text-gray-700 mb-1.5">
                Data <span className="text-[#FF5733]">*</span>
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                min={new Date().toISOString().split("T")[0]}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF5733]/20 focus:border-[#FF5733]"
              />
            </div>

            <div>
              <label className="block text-sm font-700 text-gray-700 mb-1.5">
                Pradžia <span className="text-[#FF5733]">*</span>
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF5733]/20 focus:border-[#FF5733]"
              />
            </div>

            <div>
              <label className="block text-sm font-700 text-gray-700 mb-1.5">
                Pabaiga <span className="text-[#FF5733]">*</span>
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF5733]/20 focus:border-[#FF5733]"
              />
            </div>

            <div className="sm:col-span-2 flex justify-end">
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
        <h2 className="font-800 text-[#0B5C71] mb-4">Artėjantys laiko tarpai</h2>

        {loading ? (
          <p className="text-sm text-gray-400">Kraunama...</p>
        ) : slots.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            <CalendarDays size={40} className="mx-auto mb-3 opacity-30" />
            <p className="font-600">Laiko tarpų nėra</p>
            <p className="text-sm mt-1">Pridėkite laiko tarpus aukščiau</p>
          </div>
        ) : (
          <div className="space-y-3">
            {slots.map((slot) => (
              <div
                key={slot.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center shrink-0">
                    <Clock size={18} className="text-green-500" />
                  </div>
                  <div>
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
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`badge text-xs ${
                      slot.status === "AVAILABLE"
                        ? "text-green-600 bg-green-50 border-green-200"
                        : "text-blue-600 bg-blue-50 border-blue-200"
                    }`}
                  >
                    {slot.status === "AVAILABLE" ? "Laisvas" : "Užimtas"}
                  </span>
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
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
