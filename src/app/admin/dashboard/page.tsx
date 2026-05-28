import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Calendar, Users, TrendingUp, Clock, ArrowRight } from "lucide-react";
import { formatDateLT } from "@/lib/utils";
import { bookingStatusLabel, bookingStatusColor } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [
    todayBookings,
    upcomingBookings,
    totalUsers,
    pendingCount,
    recentBookings,
    weekSlots,
  ] = await Promise.all([
    prisma.booking.count({
      where: {
        slot: { date: { gte: today, lt: tomorrow } },
        status: { in: ["CONFIRMED", "PENDING"] },
      },
    }),
    prisma.booking.count({
      where: {
        slot: { date: { gte: today } },
        status: { in: ["CONFIRMED", "PENDING"] },
      },
    }),
    prisma.user.count({ where: { role: "CLIENT" } }),
    prisma.booking.count({ where: { status: "PENDING" } }),
    prisma.booking.findMany({
      take: 8,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true, email: true } },
        slot: { select: { date: true, startTime: true, endTime: true } },
      },
    }),
    prisma.timeSlot.count({
      where: {
        date: {
          gte: today,
          lt: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000),
        },
        isAvailable: true,
      },
    }),
  ]);

  const stats = [
    {
      label: "Šiandien",
      value: todayBookings,
      sub: "rezervacijos šiandien",
      icon: Calendar,
      color: "text-blue-500",
      bg: "bg-blue-50",
    },
    {
      label: "Artėjančios",
      value: upcomingBookings,
      sub: "patvirtintų rezervacijų",
      icon: TrendingUp,
      color: "text-green-500",
      bg: "bg-green-50",
    },
    {
      label: "Klientai",
      value: totalUsers,
      sub: "registruotų klientų",
      icon: Users,
      color: "text-purple-500",
      bg: "bg-purple-50",
    },
    {
      label: "Laukiama",
      value: pendingCount,
      sub: "patvirtinimo laukia",
      icon: Clock,
      color: "text-orange-500",
      bg: "bg-orange-50",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-900 text-[#16213e]">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">
          {new Date().toLocaleDateString("lt-LT", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, sub, icon: Icon, color, bg }) => (
          <div key={label} className="card p-5">
            <div className={`w-11 h-11 rounded-xl ${bg} flex items-center justify-center mb-3`}>
              <Icon size={22} className={color} />
            </div>
            <p className="text-3xl font-900 text-[#16213e]">{value}</p>
            <p className="text-sm font-700 text-gray-600 mt-0.5">{label}</p>
            <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
          </div>
        ))}
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { href: "/admin/slots", label: "Pridėti laiką", emoji: "➕" },
          { href: "/admin/calendar", label: "Kalendorius", emoji: "📅" },
          { href: "/admin/bookings", label: "Rezervacijos", emoji: "📋" },
          { href: "/admin/articles", label: "Naujas straipsnis", emoji: "✍️" },
        ].map(({ href, label, emoji }) => (
          <Link
            key={href}
            href={href}
            className="card p-4 flex items-center gap-3 hover:shadow-md transition-shadow group"
          >
            <span className="text-2xl">{emoji}</span>
            <span className="text-sm font-700 text-[#16213e] group-hover:text-[#e94560] transition-colors">
              {label}
            </span>
            <ArrowRight size={14} className="ml-auto text-gray-300 group-hover:text-[#e94560] transition-colors" />
          </Link>
        ))}
      </div>

      {/* Recent bookings */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-800 text-[#16213e]">Paskutinės rezervacijos</h2>
          <Link
            href="/admin/bookings"
            className="text-sm text-[#e94560] font-600 flex items-center gap-1"
          >
            Visos <ArrowRight size={14} />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left font-700 text-gray-500 py-2 pr-4">Klientas</th>
                <th className="text-left font-700 text-gray-500 py-2 pr-4">Data</th>
                <th className="text-left font-700 text-gray-500 py-2 pr-4">Laikas</th>
                <th className="text-left font-700 text-gray-500 py-2">Statusas</th>
              </tr>
            </thead>
            <tbody>
              {recentBookings.map((b) => (
                <tr key={b.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                  <td className="py-3 pr-4">
                    <p className="font-600 text-[#16213e]">{b.user.name || "—"}</p>
                    <p className="text-xs text-gray-400">{b.user.email}</p>
                  </td>
                  <td className="py-3 pr-4 text-gray-600">
                    {b.slot ? formatDateLT(b.slot.date) : "—"}
                  </td>
                  <td className="py-3 pr-4 text-gray-600">
                    {b.slot ? `${b.slot.startTime} – ${b.slot.endTime}` : "—"}
                  </td>
                  <td className="py-3">
                    <span className={`badge ${bookingStatusColor(b.status)}`}>
                      {bookingStatusLabel(b.status)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
