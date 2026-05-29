"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { X, Search, User } from "lucide-react";

interface SlotArena {
  name: string;
}

interface Slot {
  id: string;
  startTime: string;
  endTime: string;
  arena: SlotArena;
}

interface UserResult {
  id: string;
  name: string | null;
  email: string | null;
}

interface Service {
  id: string;
  name: string;
  durationMinutes: number;
  price: string | number | null;
}

interface Props {
  slot: Slot;
  trainerId: string;
  onClose: () => void;
  onBooked: () => void;
}

const inputCls =
  "w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF5733]/20 focus:border-[#FF5733]";
const labelCls = "block text-sm font-700 text-gray-700 mb-1.5";

export default function BookForClientModal({ slot, trainerId, onClose, onBooked }: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<UserResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserResult | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);

  const [services, setServices] = useState<Service[]>([]);
  const [serviceId, setServiceId] = useState("");
  const [loadingServices, setLoadingServices] = useState(true);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fetch services for this trainer
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await fetch(`/api/trainer/services`);
        if (res.ok) {
          const data = await res.json();
          setServices(Array.isArray(data) ? data : []);
        }
      } catch {
        // ignore
      } finally {
        setLoadingServices(false);
      }
    };
    fetchServices();
  }, [trainerId]);

  // Debounced user search
  const handleQueryChange = useCallback((value: string) => {
    setQuery(value);
    setSelectedUser(null);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!value.trim()) {
      setResults([]);
      setShowDropdown(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(`/api/users/search?q=${encodeURIComponent(value.trim())}`);
        if (res.ok) {
          const data = await res.json();
          setResults(Array.isArray(data) ? data : []);
          setShowDropdown(true);
        }
      } catch {
        // ignore
      } finally {
        setSearching(false);
      }
    }, 300);
  }, []);

  const selectUser = (u: UserResult) => {
    setSelectedUser(u);
    setQuery(u.name || u.email || "");
    setShowDropdown(false);
    setResults([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) {
      setError("Pasirinkite klientą");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          availabilitySlotId: slot.id,
          targetUserId: selectedUser.id,
          serviceId: serviceId || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(
          typeof data.error === "string" ? data.error : "Nepavyko sukurti rezervacijos"
        );
      }

      onBooked();
    } catch (err: any) {
      setError(err.message || "Nepavyko sukurti rezervacijos");
    } finally {
      setSubmitting(false);
    }
  };

  const formatDT = (dt: string) =>
    new Date(dt).toLocaleString("lt-LT", {
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-800 text-[#0B5C71] text-lg">Rezervuoti klientui</h2>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Slot info */}
          <div className="p-3 bg-[#F4F4F4] rounded-xl text-sm">
            <p className="font-700 text-[#0B5C71]">{slot.arena.name}</p>
            <p className="text-gray-500 mt-0.5">
              {formatDT(slot.startTime)} –{" "}
              {new Date(slot.endTime).toLocaleTimeString("lt-LT", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-xl text-sm font-600 bg-red-50 text-red-700 border border-red-200">
              {error}
            </div>
          )}

          {/* User search */}
          <div className="relative">
            <label className={labelCls}>
              Klientas <span className="text-[#FF5733]">*</span>
            </label>
            <div className="relative">
              <Search
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                value={query}
                onChange={(e) => handleQueryChange(e.target.value)}
                placeholder="Ieškoti pagal vardą arba el. paštą..."
                autoComplete="off"
                className="w-full border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF5733]/20 focus:border-[#FF5733]"
              />
              {searching && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                  ...
                </span>
              )}
            </div>

            {showDropdown && results.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
                {results.map((u) => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => selectUser(u)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#F4F4F4] transition-colors text-left"
                  >
                    <div className="w-7 h-7 rounded-full bg-[#0B5C71]/10 flex items-center justify-center shrink-0">
                      <User size={14} className="text-[#0B5C71]" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-700 text-[#0B5C71] truncate">
                        {u.name || "—"}
                      </p>
                      <p className="text-xs text-gray-400 truncate">{u.email}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {showDropdown && !searching && results.length === 0 && query.trim() && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg px-4 py-3 text-sm text-gray-400">
                Nėra rezultatų
              </div>
            )}
          </div>

          {/* Selected user badge */}
          {selectedUser && (
            <div className="flex items-center gap-2 p-2.5 bg-green-50 border border-green-200 rounded-xl text-sm">
              <User size={14} className="text-green-600 shrink-0" />
              <span className="font-700 text-green-700">{selectedUser.name || selectedUser.email}</span>
              {selectedUser.name && selectedUser.email && (
                <span className="text-green-500 text-xs">{selectedUser.email}</span>
              )}
            </div>
          )}

          {/* Service selection */}
          <div>
            <label className={labelCls}>Paslauga (neprivaloma)</label>
            {loadingServices ? (
              <p className="text-sm text-gray-400">Kraunama...</p>
            ) : (
              <select
                value={serviceId}
                onChange={(e) => setServiceId(e.target.value)}
                className={inputCls}
              >
                <option value="">— Be paslaugos —</option>
                {services.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.durationMinutes} min
                    {s.price != null && s.price !== "" ? `, ${s.price} €` : ", nemokama"})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-1">
            <button
              type="submit"
              disabled={submitting || !selectedUser}
              className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {submitting ? "Rezervuojama..." : "Patvirtinti rezervaciją"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary px-5"
            >
              Atšaukti
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
