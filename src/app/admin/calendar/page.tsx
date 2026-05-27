"use client";

import { useState, useEffect } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  isSameMonth,
  isSameDay,
  isToday,
  addMonths,
  subMonths,
} from "date-fns";
import { lt } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { cn, bookingStatusColor, bookingStatusLabel } from "@/lib/utils";

interface BookingSlot {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  bookings: {
    id: string;
    status: string;
    user: { name?: string; email?: string };
  }[];
}

export default function AdminCalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [slots, setSlots] = useState<BookingSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  useEffect(() => {
    setLoading(true);
    const from = format(calStart, "yyyy-MM-dd");
    const to = format(calEnd, "yyyy-MM-dd");
    fetch(`/api/slots?from=${from}&to=${to}`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          // Also need booking info – fetch bookings separately
          fetch(`/api/bookings`)
            .then((r2) => r2.json())
            .then((bookings) => {
              if (!Array.isArray(bookings)) { setSlots(data); return; }
              const enriched = data.map((slot: any) => ({
                ...slot,
                bookings: bookings.filter((b: any) => b.slotId === slot.id),
              }));
              setSlots(enriched);
            });
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [currentDate]);

  // Build calendar grid
  const days: Date[] = [];
  let d = calStart;
  while (d <= calEnd) {
    days.push(d);
    d = addDays(d, 1);
  }

  const slotsForDay = (day: Date) =>
    slots.filter((s) => isSameDay(new Date(s.date), day));

  const selectedDaySlots = selectedDay ? slotsForDay(selectedDay) : [];

  const weekDays = ["Pr", "An", "Tr", "Kt", "Pn", "Št", "Sk"];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-[#16213e]">Kalendorius</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentDate((d) => subMonths(d, 1))}
            className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
          >
            <ChevronLeft size={18} />
          </button>
          <h2 className="font-black text-[#16213e] min-w-[160px] text-center">
            {format(currentDate, "LLLL yyyy", { locale: lt })}
          </h2>
          <button
            onClick={() => setCurrentDate((d) => addMonths(d, 1))}
            className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Calendar grid */}
        <div className="xl:col-span-2 card p-4">
          {loading && (
            <div className="flex items-center justify-center py-8 gap-2 text-gray-400">
              <Loader2 size={20} className="animate-spin" />
              Kraunama...
            </div>
          )}

          {/* Weekday headers */}
          <div className="grid grid-cols-7 mb-2">
            {weekDays.map((wd) => (
              <div key={wd} className="text-center text-xs font-bold text-gray-400 py-2 uppercase">
                {wd}
              </div>
            ))}
          </div>

          {/* Days grid */}
          <div className="grid grid-cols-7 gap-1">
            {days.map((day) => {
              const daySlots = slotsForDay(day);
              const hasBookings = daySlots.some((s) => s.bookings?.length > 0);
              const isSelected = selectedDay && isSameDay(day, selectedDay);
              const isCurrentMonth = isSameMonth(day, currentDate);

              return (
                <button
                  key={day.toISOString()}
                  onClick={() => setSelectedDay(day)}
                  className={cn(
                    "relative aspect-square rounded-xl flex flex-col items-center justify-start pt-2 text-sm transition-all",
                    !isCurrentMonth && "opacity-30",
                    isSelected
                      ? "bg-[#e94560] text-white"
                      : isToday(day)
                      ? "bg-[#e94560]/10 text-[#e94560] font-bold"
                      : "hover:bg-gray-50"
                  )}
                >
                  <span className="font-bold text-sm">{format(day, "d")}</span>
                  {daySlots.length > 0 && (
                    <div className="flex gap-0.5 mt-1 flex-wrap justify-center">
                      {daySlots.slice(0, 3).map((_, i) => (
                        <span
                          key={i}
                          className={cn(
                            "w-1.5 h-1.5 rounded-full",
                            isSelected ? "bg-white/70" : hasBookings ? "bg-[#e94560]" : "bg-gray-300"
                          )}
                        />
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Day detail */}
        <div className="card p-5">
          {selectedDay ? (
            <>
              <h3 className="font-black text-[#16213e] mb-4">
                {format(selectedDay, "d MMMM", { locale: lt })}
              </h3>
              {selectedDaySlots.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-8">
                  Šią dieną laikų nėra
                </p>
              ) : (
                <div className="space-y-3">
                  {selectedDaySlots.map((slot) => (
                    <div
                      key={slot.id}
                      className={cn(
                        "p-3 rounded-xl border",
                        slot.bookings?.length > 0
                          ? "border-[#e94560]/30 bg-[#e94560]/5"
                          : "border-gray-100 bg-gray-50"
                      )}
                    >
                      <p className="font-bold text-sm text-[#16213e]">
                        {slot.startTime} – {slot.endTime}
                      </p>
                      {slot.bookings?.length === 0 ? (
                        <p className="text-xs text-gray-400 mt-1">Laisva</p>
                      ) : (
                        <div className="mt-2 space-y-1">
                          {slot.bookings.map((b) => (
                            <div key={b.id} className="flex items-center justify-between">
                              <p className="text-xs font-semibold text-gray-700">
                                {b.user.name || b.user.email}
                              </p>
                              <span className={`badge text-[10px] ${bookingStatusColor(b.status)}`}>
                                {bookingStatusLabel(b.status)}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12 text-gray-400">
              <CalendarDaysIcon />
              <p className="mt-3 text-sm">Pasirinkite dieną kalendoriuje</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CalendarDaysIcon() {
  return (
    <svg className="w-12 h-12 mx-auto opacity-30" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
    </svg>
  );
}
