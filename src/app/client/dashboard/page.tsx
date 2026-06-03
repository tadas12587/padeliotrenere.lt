import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Calendar, Clock, MapPin, ArrowRight, CheckCircle } from "lucide-react";
import { formatDateLT } from "@/lib/utils";
import { bookingStatusLabel, bookingStatusColor } from "@/lib/utils";

export const dynamic = "force-dynamic";

function getBookingDate(b: any): Date {
  if (b.availabilitySlot) return new Date(b.availabilitySlot.startTime);
  if (b.slot) return new Date(b.slot.date);
  return new Date(b.createdAt);
}

function getDateLabel(b: any): string {
  if (b.availabilitySlot) {
    return new Date(b.availabilitySlot.startTime).toLocaleDateString("lt-LT", {
      year: "numeric", month: "long", day: "numeric",
    });
  }
  if (b.slot) return formatDateLT(b.slot.date);
  return formatDateLT(b.createdAt);
}

function getTimeLabel(b: any): string {
  if (b.availabilitySlot) {
    const s = new Date(b.availabilitySlot.startTime);
    const e = new Date(b.availabilitySlot.endTime);
    const fmt = (d: Date) => d.toLocaleTimeString("lt-LT", { hour: "2-digit", minute: "2-digit" });
    return `${fmt(s)} – ${fmt(e)}`;
  }
  if (b.slot) return `${b.slot.startTime} – ${b.slot.endTime}`;
  return "";
}

const BOOKING_INCLUDE = {
  slot: true,
  availabilitySlot: {
    include: {
      arena: { select: { name: true, city: true } },
      trainer: { select: { displayName: true } },
    },
  },
  service: { select: { name: true } },
  sessionNote: true,
} as const;

export default async function ClientDashboardPage() {
  const session = await getServerSession(authOptions);
  const user = session!.user as any;
  const now = new Date();

  // Upcoming: either legacy slot in future OR availabilitySlot in future
  const upcomingRaw = await prisma.booking.findMany({
    where: {
      userId: user.id,
      status: { in: ["PENDING", "CONFIRMED"] },
      OR: [
        { slot: { date: { gte: now } } },
        { availabilitySlot: { startTime: { gte: now } } },
      ],
    },
    include: BOOKING_INCLUDE,
    orderBy: { createdAt: "asc" },
  });
  // Sort by actual booking date and take 3
  const upcoming = upcomingRaw
    .sort((a, b) => getBookingDate(a).getTime() - getBookingDate(b).getTime())
    .slice(0, 3);

  // Past: completed/cancelled OR past date
  const pastRaw = await prisma.booking.findMany({
    where: {
      userId: user.id,
      OR: [
        { status: { in: ["COMPLETED", "CANCELLED"] } },
        { slot: { date: { lt: now } } },
        { availabilitySlot: { startTime: { lt: now } } },
      ],
    },
    include: BOOKING_INCLUDE,
    orderBy: { createdAt: "desc" },
  });
  const past = pastRaw.slice(0, 3);

  const totalBookings = await prisma.booking.count({ where: { userId: user.id } });
  const completedCount = await prisma.booking.count({
    where: { userId: user.id, status: "COMPLETED" },
  });

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="card p-6 bg-gradient-to-br from-[#0B5C71] to-[#083d4e] text-white">
        <h1 className="text-2xl font-900">
          Sveiki, {user.name?.split(" ")[0] || "sportininke"}! 🎾
        </h1>
        <p className="text-gray-400 mt-1 text-sm">
          Jūsų asmeninė padelio treniruočių zona
        </p>
        <div className="flex gap-6 mt-5 pt-5 border-t border-white/10">
          <div>
            <p className="text-2xl font-900 text-[#FF5733]">{totalBookings}</p>
            <p className="text-xs text-gray-400">Iš viso rezervacijų</p>
          </div>
          <div>
            <p className="text-2xl font-900 text-[#FF5733]">{completedCount}</p>
            <p className="text-xs text-gray-400">Treniruočių įvykdyta</p>
          </div>
        </div>
      </div>

      {/* Upcoming */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-800 text-[#0B5C71]">Artėjančios treniruotės</h2>
          <Link
            href="/client/bookings"
            className="text-sm text-[#FF5733] font-600 flex items-center gap-1 hover:underline"
          >
            Visos <ArrowRight size={14} />
          </Link>
        </div>

        {upcoming.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            <Calendar size={40} className="mx-auto mb-3 opacity-30" />
            <p className="font-600">Nėra artėjančių treniruočių</p>
            <Link href="/booking" className="btn-primary mt-4 inline-flex text-sm py-2 px-5">
              Rezervuoti dabar
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {upcoming.map((b) => (
              <div
                key={b.id}
                className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100"
              >
                <div className="w-12 h-12 rounded-xl bg-[#FF5733]/10 flex items-center justify-center shrink-0 text-2xl">
                  🎾
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-700 text-[#0B5C71] text-sm">{getDateLabel(b)}</p>
                    {(b.availabilitySlot as any)?.maxParticipants > 0 && (
                      <span className="badge text-xs text-orange-600 bg-orange-50 border-orange-200">Grupinė</span>
                    )}
                    <span className={`badge ${bookingStatusColor(b.status)}`}>
                      {bookingStatusLabel(b.status)}
                    </span>
                  </div>
                  <p className="text-gray-500 text-xs flex items-center gap-1 mt-0.5">
                    <Clock size={12} />
                    {getTimeLabel(b)}
                  </p>
                  {b.availabilitySlot && (
                    <>
                      <p className="text-gray-500 text-xs flex items-center gap-1 mt-0.5">
                        <MapPin size={12} />
                        {(b.availabilitySlot as any).arena.name}, {(b.availabilitySlot as any).arena.city}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Treneris: {(b.availabilitySlot as any).trainer.displayName}
                      </p>
                    </>
                  )}
                  {b.service && (
                    <p className="text-xs text-[#FF5733] font-600 mt-0.5">{(b.service as any).name}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Past sessions */}
      {past.length > 0 && (
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-800 text-[#0B5C71]">Praėjusios treniruotės</h2>
            <Link
              href="/client/bookings?tab=past"
              className="text-sm text-[#FF5733] font-600 flex items-center gap-1 hover:underline"
            >
              Visos <ArrowRight size={14} />
            </Link>
          </div>

          <div className="space-y-3">
            {past.map((b) => (
              <div key={b.id} className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                <div className="flex items-center justify-between flex-wrap gap-2 mb-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-700 text-sm text-[#0B5C71]">
                      {getDateLabel(b)}
                      {getTimeLabel(b) && ` · ${getTimeLabel(b)}`}
                    </p>
                    {(b.availabilitySlot as any)?.maxParticipants > 0 && (
                      <span className="badge text-xs text-orange-600 bg-orange-50 border-orange-200">Grupinė</span>
                    )}
                  </div>
                  <span className={`badge ${bookingStatusColor(b.status)}`}>
                    {bookingStatusLabel(b.status)}
                  </span>
                </div>
                {b.availabilitySlot && (
                  <p className="text-xs text-gray-400 mb-1">
                    {(b.availabilitySlot as any).trainer.displayName} · {(b.availabilitySlot as any).arena.name}
                  </p>
                )}
                {(b.sessionNote as any)?.trainerNote && (
                  <div className="mt-2 p-3 bg-white rounded-lg border border-gray-100">
                    <p className="text-xs font-700 text-[#FF5733] mb-1">💬 Trenerio komentaras:</p>
                    <p className="text-sm text-gray-600">{(b.sessionNote as any).trainerNote}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link href="/booking" className="card p-5 flex items-center gap-4 hover:shadow-lg transition-shadow group">
          <div className="w-12 h-12 rounded-xl bg-[#FF5733]/10 flex items-center justify-center shrink-0 group-hover:bg-[#FF5733] transition-colors">
            <Calendar size={22} className="text-[#FF5733] group-hover:text-white transition-colors" />
          </div>
          <div>
            <p className="font-700 text-[#0B5C71]">Nauja rezervacija</p>
            <p className="text-sm text-gray-500">Rezervuokite naują treniruotę</p>
          </div>
          <ArrowRight size={18} className="ml-auto text-gray-300 group-hover:text-[#FF5733] transition-colors" />
        </Link>

        <Link href="/client/bookings" className="card p-5 flex items-center gap-4 hover:shadow-lg transition-shadow group">
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center shrink-0 group-hover:bg-blue-500 transition-colors">
            <CheckCircle size={22} className="text-blue-500 group-hover:text-white transition-colors" />
          </div>
          <div>
            <p className="font-700 text-[#0B5C71]">Mano rezervacijos</p>
            <p className="text-sm text-gray-500">Peržiūrėti visas rezervacijas</p>
          </div>
          <ArrowRight size={18} className="ml-auto text-gray-300 group-hover:text-blue-500 transition-colors" />
        </Link>
      </div>
    </div>
  );
}
