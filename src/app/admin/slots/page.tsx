"use client";

import { useState, useEffect } from "react";
import { format, addDays, startOfWeek } from "date-fns";
import { lt } from "date-fns/locale";
import { Plus, Trash2, Loader2, ChevronLeft, ChevronRight, CheckCircle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface Slot {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  maxClients: number;
  notes?: string;
  _count?: { bookings: number };
}

export default function AdminSlotsPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    date: format(new Date(), "yyyy-MM-dd"),
    startTime: "09:00",
    endTime: "10:00",
    maxClients: 1,
    notes: "",
  });
  const [error, setError] = useState("");

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekEnd = addDays(weekStart, 6);

  useEffect(() => {
    fetchSlots();
  }, [weekStart.toISOString()]);

  const fetchSlots = () => {
    setLoading(true);
    const from = format(weekStart, "yyyy-MM-dd");
    const to = format(weekEnd, "yyyy-MM-dd");
    fetch(`/api/slots?from=${from}&to=${to}`)
      .then((r) => r.json())
      .then((data) => setSlots(Array.isArray(data) ? data : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  const handleCreate = async () => {
    setSaving(true);
    setError("");
    const res = await fetch("/api/slots", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, maxClients: Number(form.maxClients) }),
    });
    if (res.ok) {
      setShowForm(false);
      setForm({ date: format(new Date(), "yyyy-MM-dd"), startTime: "09:00", endTime: "10:00", maxClients: 1, notes: "" });
      fetchSlots();
    } else {
      const data = await res.json();
      setError(data.error || "Klaida kuriant laiką");
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Ar tikrai norite ištrinti šį laiko tarpą?")) return;
    await fetch(`/api/slots/${id}`, { method: "DELETE" });
    setSlots((prev) => prev.filter((s) => s.id !== id));
  };

  const handleToggle = async (slot: Slot) => {
    const res = await fetch(`/api/slots/${slot.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isAvailable: !slot.isAvailable }),
    });
    if (res.ok) {
      setSlots((prev) =>
        prev.map((s) =>
          s.id === slot.id ? { ...s, isAvailable: !s.isAvailable } : s
        )
      );
    }
  };

  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const slotsByDay = (day: Date) =>
    slots.filter(
      (s) => format(new Date(s.date), "yyyy-MM-dd") === format(day, "yyyy-MM-dd")
    );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-900 text-[#0B5C71]">Laiko tarpai</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary text-sm py-2 px-4"
        >
          <Plus size={16} />
          Pridėti laiką
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <div className="card p-6">
          <h2 className="font-800 text-[#0B5C71] mb-4">Naujas laiko tarpas</h2>
          {error && (
            <p className="text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-4 text-sm">
              {error}
            </p>
          )}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-xs font-700 text-gray-500 mb-1.5 uppercase tracking-wide">
                Data
              </label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#FF5733] transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-700 text-gray-500 mb-1.5 uppercase tracking-wide">
                Pradžia
              </label>
              <input
                type="time"
                value={form.startTime}
                onChange={(e) => setForm((f) => ({ ...f, startTime: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#FF5733] transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-700 text-gray-500 mb-1.5 uppercase tracking-wide">
                Pabaiga
              </label>
              <input
                type="time"
                value={form.endTime}
                onChange={(e) => setForm((f) => ({ ...f, endTime: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#FF5733] transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-700 text-gray-500 mb-1.5 uppercase tracking-wide">
                Maks. klientų
              </label>
              <input
                type="number"
                min={1}
                max={10}
                value={form.maxClients}
                onChange={(e) => setForm((f) => ({ ...f, maxClients: Number(e.target.value) }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#FF5733] transition-colors"
              />
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-xs font-700 text-gray-500 mb-1.5 uppercase tracking-wide">
              Pastabos (nebūtina)
            </label>
            <input
              type="text"
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              placeholder="pvz. Kortas Nr. 2"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#FF5733] transition-colors"
            />
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleCreate}
              disabled={saving}
              className="btn-primary text-sm py-2 px-5"
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : null}
              {saving ? "Kuriama..." : "Sukurti"}
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="btn-secondary text-sm py-2 px-5"
            >
              Atšaukti
            </button>
          </div>
        </div>
      )}

      {/* Week navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setCurrentDate((d) => addDays(d, -7))}
          className="flex items-center gap-2 text-sm font-600 text-gray-500 hover:text-[#0B5C71] transition-colors px-3 py-2 rounded-lg hover:bg-gray-100"
        >
          <ChevronLeft size={18} />
          Ankstesnė savaitė
        </button>
        <h2 className="font-800 text-[#0B5C71]">
          {format(weekStart, "d MMM", { locale: lt })} –{" "}
          {format(weekEnd, "d MMM yyyy", { locale: lt })}
        </h2>
        <button
          onClick={() => setCurrentDate((d) => addDays(d, 7))}
          className="flex items-center gap-2 text-sm font-600 text-gray-500 hover:text-[#0B5C71] transition-colors px-3 py-2 rounded-lg hover:bg-gray-100"
        >
          Kita savaitė
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Week grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20 gap-3 text-gray-400">
          <Loader2 size={24} className="animate-spin" />
          Kraunama...
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-7 gap-3">
          {days.map((day) => {
            const daySlots = slotsByDay(day);
            return (
              <div key={day.toISOString()} className="card overflow-hidden">
                <div className="bg-[#0B5C71] text-white px-3 py-2.5 text-center">
                  <p className="text-xs uppercase font-700 opacity-60">
                    {format(day, "EEE", { locale: lt })}
                  </p>
                  <p className="font-900 text-lg">{format(day, "d")}</p>
                </div>
                <div className="p-2 min-h-[100px] space-y-1.5">
                  {daySlots.length === 0 ? (
                    <p className="text-xs text-gray-300 text-center py-4">—</p>
                  ) : (
                    daySlots.map((slot) => (
                      <div
                        key={slot.id}
                        className={cn(
                          "p-2 rounded-lg border text-xs",
                          slot.isAvailable
                            ? "border-green-200 bg-green-50"
                            : "border-gray-200 bg-gray-50 opacity-60"
                        )}
                      >
                        <p className="font-800 text-[#0B5C71]">
                          {slot.startTime} – {slot.endTime}
                        </p>
                        <div className="flex items-center justify-between mt-1">
                          <button
                            onClick={() => handleToggle(slot)}
                            className={cn(
                              "flex items-center gap-1",
                              slot.isAvailable ? "text-green-500" : "text-gray-400"
                            )}
                            title={slot.isAvailable ? "Paskelbta" : "Slėpta"}
                          >
                            {slot.isAvailable ? (
                              <CheckCircle size={12} />
                            ) : (
                              <XCircle size={12} />
                            )}
                          </button>
                          <button
                            onClick={() => handleDelete(slot.id)}
                            className="text-gray-300 hover:text-red-500 transition-colors"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
