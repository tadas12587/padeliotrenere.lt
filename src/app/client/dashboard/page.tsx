import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Calendar, Clock, CheckCircle, ArrowRight } from "lucide-react";
import { formatDateLT } from "@/lib/utils";
import { bookingStatusLabel, bookingStatusColor } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ClientDashboardPage() {
  const session = await getServerSession(authOptions);
  const user = session!.user as any;

  // Fetch upcoming bookings
  const upcoming = await prisma.booking.findMany({
    where: {
      userId: user.id,
      status: { in: ["PENDING", "CONFIRMED"] },
      slot: { date: { gte: new Date() } },
    },
    take: 3,
    orderBy: { slot: { date: "asc" } },
    include: { slot: true },
  });

  // Fetch recent past bookings
  const past = await prisma.booking.findMany({
    where: {
      userId: user.id,
      status: { in: ["COMPLETED", "CANCELLED"] },
    },
    take: 3,
    orderBy: { createdAt: "desc" },
    include: { slot: true, sessionNote: true },
  });

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
                className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#FF5733]/10 flex items-center justify-center shrink-0">
                    <span className="text-2xl">🎾</span>
                  </div>
                  <div>
                    <p className="font-700 text-[#0B5C71] text-sm">
                      {b.slot ? formatDateLT(b.slot.date) : "—"}
                    </p>
                    <p className="text-gray-500 text-xs flex items-center gap-1 mt-0.5">
                      <Clock size={12} />
                      {b.slot ? `${b.slot.startTime} – ${b.slot.endTime}` : "—"}
                    </p>
                  </div>
                </div>
                <span className={`badge ${bookingStatusColor(b.status)}`}>
                  {bookingStatusLabel(b.status)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Past sessions with notes */}
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
                <div className="flex items-center justify-between mb-2">
                  <p className="font-700 text-sm text-[#0B5C71]">
                    {b.slot ? `${formatDateLT(b.slot.date)} · ${b.slot.startTime}` : "—"}
                  </p>
                  <span className={`badge ${bookingStatusColor(b.status)}`}>
                    {bookingStatusLabel(b.status)}
                  </span>
                </div>
                {b.sessionNote?.trainerNote && (
                  <div className="mt-2 p-3 bg-white rounded-lg border border-gray-100">
                    <p className="text-xs font-700 text-[#FF5733] mb-1">
                      💬 Trenerio komentaras:
                    </p>
                    <p className="text-sm text-gray-600">{b.sessionNote.trainerNote}</p>
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
