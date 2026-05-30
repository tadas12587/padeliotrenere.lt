"use client";

import { useState, useEffect } from "react";
import { CalendarDays, Clock, TrendingUp, Users, BarChart2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsData {
  slots: { total: number; filled: number; empty: number; fillRate: number };
  hours: { totalPlanned: number; worked: number; upcomingBooked: number };
  revenue: { earned: number; planned: number; perSession: number };
  clients: { total: number; new: number; returning: number };
  topServices: { name: string; count: number }[];
  peakDays: { day: number; label: string; count: number }[];
}

const PERIODS = [
  { value: "today", label: "Šiandien" },
  { value: "week", label: "Ši savaitė" },
  { value: "month", label: "Šis mėnuo" },
  { value: "lastmonth", label: "Praėjęs mėn." },
  { value: "year", label: "Šie metai" },
  { value: "all", label: "Visas laikas" },
];

function SkeletonCard() {
  return (
    <div className="card p-5 animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-1/2 mb-3" />
      <div className="h-8 bg-gray-200 rounded w-1/3 mb-2" />
      <div className="h-3 bg-gray-100 rounded w-2/3" />
    </div>
  );
}

export default function TrainerStatsPage() {
  const [period, setPeriod] = useState("month");
  const [data, setData] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(`/api/trainer/stats?period=${period}`)
      .then((r) => {
        if (!r.ok) throw new Error("Klaida gaunant statistiką");
        return r.json();
      })
      .then((d) => { setData(d); setLoading(false); })
      .catch((e) => { setError(e.message || "Nepavyko įkelti statistikos"); setLoading(false); });
  }, [period]);

  const maxDay = data ? Math.max(...data.peakDays.map((d) => d.count), 1) : 1;
  const maxService = data ? Math.max(...data.topServices.map((s) => s.count), 1) : 1;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-900 text-[#0B5C71] flex items-center gap-2">
          <BarChart2 size={24} />
          Statistika
        </h1>
        <p className="text-gray-500 text-sm mt-1">Jūsų veiklos suvestinė</p>
      </div>

      {/* Period selector */}
      <div className="flex flex-wrap gap-2">
        {PERIODS.map((p) => (
          <button
            key={p.value}
            onClick={() => setPeriod(p.value)}
            className={cn(
              "px-4 py-2 rounded-xl text-sm font-700 border transition-all",
              period === p.value
                ? "bg-[#0B5C71] text-white border-[#0B5C71]"
                : "bg-white text-gray-600 border-gray-200 hover:border-[#0B5C71]/40 hover:text-[#0B5C71]"
            )}
          >
            {p.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 text-red-700 border border-red-200 text-sm font-600">
          {error}
        </div>
      )}

      {/* Metric cards */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <SkeletonCard /><SkeletonCard /><SkeletonCard /><SkeletonCard />
        </div>
      ) : data ? (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {/* Slots */}
            <div className="card p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                  <CalendarDays size={18} className="text-blue-500" />
                </div>
                <span className="text-xs font-700 text-gray-500 uppercase tracking-wide">Laiko tarpai</span>
              </div>
              <p className="text-2xl font-900 text-[#0B5C71]">{data.slots.total}</p>
              <div className="flex gap-2 mt-1 text-xs">
                <span className="text-green-600 font-600">{data.slots.filled} užimtų</span>
                {data.slots.empty > 0 && (
                  <span className="text-gray-400">{data.slots.empty} tuščių</span>
                )}
              </div>
              <div className="mt-3">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Užimtumas</span>
                  <span className="font-700 text-[#0B5C71]">{data.slots.fillRate}%</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-[#0B5C71] rounded-full transition-all"
                    style={{ width: `${data.slots.fillRate}%` }} />
                </div>
              </div>
            </div>

            {/* Hours */}
            <div className="card p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-9 h-9 rounded-xl bg-green-50 flex items-center justify-center shrink-0">
                  <Clock size={18} className="text-green-500" />
                </div>
                <span className="text-xs font-700 text-gray-500 uppercase tracking-wide">Valandos</span>
              </div>
              <p className="text-2xl font-900 text-[#0B5C71]">{data.hours.worked}h</p>
              <p className="text-xs text-gray-500 mt-0.5">išdirbta</p>
              {data.hours.upcomingBooked > 0 && (
                <p className="text-xs text-blue-500 font-600 mt-0.5">
                  + {data.hours.upcomingBooked}h rezervuota
                </p>
              )}
              <div className="mt-3">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Suplanuota iš viso: {data.hours.totalPlanned}h</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 rounded-full transition-all"
                    style={{
                      width: `${data.hours.totalPlanned > 0
                        ? Math.min(Math.round((data.hours.worked / data.hours.totalPlanned) * 100), 100)
                        : 0}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Revenue */}
            <div className="card p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-9 h-9 rounded-xl bg-orange-50 flex items-center justify-center shrink-0">
                  <TrendingUp size={18} className="text-[#FF5733]" />
                </div>
                <span className="text-xs font-700 text-gray-500 uppercase tracking-wide">Pajamos</span>
              </div>
              {/* Earned = sessions already happened */}
              <p className="text-2xl font-900 text-[#0B5C71]">{data.revenue.earned} €</p>
              <p className="text-xs text-gray-500 mt-0.5">uždirbta</p>
              {data.revenue.planned > 0 && (
                <p className="text-xs text-blue-500 font-600 mt-0.5">
                  + {data.revenue.planned} € planuojama
                </p>
              )}
              {data.revenue.perSession > 0 && (
                <p className="text-xs text-gray-400 mt-2">
                  vid. {data.revenue.perSession} € / sesija
                </p>
              )}
            </div>

            {/* Clients */}
            <div className="card p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-9 h-9 rounded-xl bg-purple-50 flex items-center justify-center shrink-0">
                  <Users size={18} className="text-purple-500" />
                </div>
                <span className="text-xs font-700 text-gray-500 uppercase tracking-wide">Klientai</span>
              </div>
              <p className="text-2xl font-900 text-[#0B5C71]">{data.clients.total}</p>
              <div className="flex gap-3 mt-1">
                <span className="text-xs text-green-600 font-600">+{data.clients.new} nauji</span>
                <span className="text-xs text-gray-500">{data.clients.returning} grįžtantys</span>
              </div>
            </div>
          </div>

          {/* Bottom section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Top services */}
            <div className="card p-5">
              <h3 className="font-800 text-[#0B5C71] mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#FF5733] inline-block" />
                Populiariausios paslaugos
              </h3>
              {data.topServices.length === 0 ? (
                <p className="text-sm text-gray-400 py-4 text-center">Duomenų nėra</p>
              ) : (
                <div className="space-y-3">
                  {data.topServices.map((s) => (
                    <div key={s.name}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-600 text-gray-700 truncate pr-2">{s.name}</span>
                        <span className="font-700 text-[#0B5C71] shrink-0">{s.count}</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-[#FF5733] rounded-full transition-all"
                          style={{ width: `${Math.round((s.count / maxService) * 100)}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Peak days */}
            <div className="card p-5">
              <h3 className="font-800 text-[#0B5C71] mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#0B5C71] inline-block" />
                Aktyviausios dienos
              </h3>
              {data.peakDays.every((d) => d.count === 0) ? (
                <p className="text-sm text-gray-400 py-4 text-center">Duomenų nėra</p>
              ) : (
                <div className="flex items-end gap-1 h-20">
                  {data.peakDays.map((d) => (
                    <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
                      <div className="w-full bg-[#0B5C71] rounded-t transition-all"
                        style={{
                          height: `${Math.round((d.count / maxDay) * 56)}px`,
                          minHeight: d.count > 0 ? "4px" : "0px",
                        }}
                      />
                      <span className="text-xs text-gray-500">{d.label}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
