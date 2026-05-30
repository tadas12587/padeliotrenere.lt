import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Calendar, User, Award, ArrowRight, Clock, MapPin, BarChart2, Users } from "lucide-react";
import { formatDateLT } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function TrainerDashboardPage() {
  const session = await getServerSession(authOptions);
  const sessionUser = session!.user as any;

  const trainerProfile = await prisma.trainerProfile.findUnique({
    where: { userId: sessionUser.id },
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingBookings = trainerProfile
    ? await prisma.booking.findMany({
        where: {
          trainerId: trainerProfile.id,
          status: { in: ["CONFIRMED", "PENDING"] },
          OR: [
            { slot: { date: { gte: today } } },
            { availabilitySlot: { startTime: { gte: today } } },
          ],
        },
        orderBy: { createdAt: "asc" },
        take: 10,
        include: {
          user: { select: { name: true, email: true } },
          slot: { select: { date: true, startTime: true, endTime: true } },
          availabilitySlot: {
            select: {
              startTime: true,
              endTime: true,
              maxParticipants: true,
              arena: { select: { name: true, city: true } },
            },
          },
          arena: { select: { name: true, city: true } },
          service: { select: { name: true } },
        },
      })
    : [];

  const clientBookings = trainerProfile
    ? await prisma.booking.findMany({
        where: {
          trainerId: trainerProfile.id,
          status: { in: ["CONFIRMED", "PENDING"] },
        },
        include: {
          user: { select: { id: true, name: true, email: true } },
          availabilitySlot: { select: { startTime: true } },
          slot: { select: { date: true } },
        },
        orderBy: { createdAt: "desc" },
      })
    : [];

  const clientMap = new Map<string, { name: string; email: string; count: number; lastDate: Date | null }>();
  for (const b of clientBookings) {
    const uid = b.user.id;
    const date = b.availabilitySlot?.startTime
      ? new Date(b.availabilitySlot.startTime)
      : b.slot?.date
      ? new Date(b.slot.date)
      : null;
    if (!clientMap.has(uid)) {
      clientMap.set(uid, { name: b.user.name || "—", email: b.user.email || "—", count: 1, lastDate: date });
    } else {
      const entry = clientMap.get(uid)!;
      entry.count++;
      if (date && (!entry.lastDate || date > entry.lastDate)) entry.lastDate = date;
    }
  }
  const clients = Array.from(clientMap.values()).sort(
    (a, b) => (b.lastDate?.getTime() ?? 0) - (a.lastDate?.getTime() ?? 0)
  );

  const name =
    trainerProfile?.displayName ||
    sessionUser.name?.split(" ")[0] ||
    "Treneri";

  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <div className="card p-6 bg-gradient-to-br from-[#0B5C71] to-[#083d4e] text-white">
        <h1 className="text-2xl font-900">Sveiki, {name}! 🎾</h1>
        <p className="text-gray-400 mt-1 text-sm">
          Jūsų trenerio valdymo zona
        </p>
        <div className="flex gap-6 mt-5 pt-5 border-t border-white/10">
          <div>
            <p className="text-2xl font-900 text-[#FF5733]">
              {upcomingBookings.length}
            </p>
            <p className="text-xs text-gray-400">Artėjančios rezervacijos</p>
          </div>
        </div>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {[
          {
            href: "/trainer/profile",
            label: "Mano profilis",
            desc: "Redaguoti informaciją",
            icon: User,
            color: "bg-blue-50",
            iconColor: "text-blue-500",
          },
          {
            href: "/trainer/certifications",
            label: "Sertifikatai",
            desc: "Tvarkyti sertifikatus",
            icon: Award,
            color: "bg-purple-50",
            iconColor: "text-purple-500",
          },
          {
            href: "/trainer/calendar",
            label: "Kalendorius",
            desc: "Valdyti laiko tarpus",
            icon: Calendar,
            color: "bg-green-50",
            iconColor: "text-green-500",
          },
          {
            href: "/trainer/stats",
            label: "Statistika",
            desc: "Peržiūrėti statistiką",
            icon: BarChart2,
            color: "bg-orange-50",
            iconColor: "text-orange-500",
          },
        ].map(({ href, label, desc, icon: Icon, color, iconColor }) => (
          <Link
            key={href}
            href={href}
            className="card p-5 flex items-center gap-4 hover:shadow-lg transition-shadow group"
          >
            <div
              className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}
            >
              <Icon size={22} className={iconColor} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-700 text-[#0B5C71] text-sm">{label}</p>
              <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
            </div>
            <ArrowRight
              size={16}
              className="text-gray-300 group-hover:text-[#FF5733] transition-colors shrink-0"
            />
          </Link>
        ))}
      </div>

      {/* Upcoming bookings */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-800 text-[#0B5C71]">Artėjančios rezervacijos</h2>
        </div>

        {upcomingBookings.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            <Calendar size={40} className="mx-auto mb-3 opacity-30" />
            <p className="font-600">Nėra artėjančių rezervacijų</p>
            <p className="text-sm mt-1">
              Pridėkite laiko tarpus kalendoriuje, kad klientai galėtų
              rezervuoti
            </p>
            <Link
              href="/trainer/calendar"
              className="btn-primary mt-4 inline-flex text-sm py-2 px-5"
            >
              Atidaryti kalendorių
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left font-700 text-gray-500 py-2 pr-4">
                    Klientas
                  </th>
                  <th className="text-left font-700 text-gray-500 py-2 pr-4">
                    Data
                  </th>
                  <th className="text-left font-700 text-gray-500 py-2 pr-4">
                    Laikas
                  </th>
                  <th className="text-left font-700 text-gray-500 py-2 pr-4">
                    Arena
                  </th>
                  <th className="text-left font-700 text-gray-500 py-2">
                    Paslauga
                  </th>
                </tr>
              </thead>
              <tbody>
                {upcomingBookings.map((b) => {
                  const avSlot = b.availabilitySlot;
                  const dateLabel = avSlot
                    ? new Date(avSlot.startTime).toLocaleDateString("lt-LT", { year: "numeric", month: "2-digit", day: "2-digit" })
                    : b.slot ? formatDateLT(b.slot.date) : "—";
                  const timeLabel = avSlot
                    ? `${new Date(avSlot.startTime).toLocaleTimeString("lt-LT", { hour: "2-digit", minute: "2-digit" })} – ${new Date(avSlot.endTime).toLocaleTimeString("lt-LT", { hour: "2-digit", minute: "2-digit" })}`
                    : b.slot ? `${b.slot.startTime} – ${b.slot.endTime}` : "—";
                  const arenaLabel = avSlot?.arena
                    ? `${avSlot.arena.name}, ${avSlot.arena.city}`
                    : b.arena ? `${b.arena.name}, ${b.arena.city}` : "—";
                  const isGroup = avSlot && avSlot.maxParticipants && avSlot.maxParticipants > 0;
                  return (
                  <tr
                    key={b.id}
                    className="border-b border-gray-50 hover:bg-gray-50/50"
                  >
                    <td className="py-3 pr-4">
                      <p className="font-600 text-[#0B5C71]">
                        {b.user.name || "—"}
                      </p>
                      <p className="text-xs text-gray-400">{b.user.email}</p>
                    </td>
                    <td className="py-3 pr-4 text-gray-600">{dateLabel}</td>
                    <td className="py-3 pr-4 text-gray-600">
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        {timeLabel}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-gray-600">
                      <span className="flex items-center gap-1">
                        <MapPin size={12} />
                        {arenaLabel}
                      </span>
                    </td>
                    <td className="py-3 text-gray-600">
                      {isGroup && <span className="badge text-xs text-orange-600 bg-orange-50 border-orange-200 mr-1">Grupinė</span>}
                      {b.service?.name || "—"}
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Mano klientai */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-800 text-[#0B5C71] flex items-center gap-2">
            <Users size={18} />
            Mano klientai
          </h2>
          <span className="badge text-xs text-[#0B5C71] bg-[#0B5C71]/10 border-[#0B5C71]/20">
            {clients.length} klientų
          </span>
        </div>

        {clients.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            <Users size={40} className="mx-auto mb-3 opacity-30" />
            <p className="font-600">Klientų nėra</p>
            <p className="text-sm mt-1">Čia atsiras klientai, kai bus rezervacijų</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left font-700 text-gray-500 py-2 pr-4">Klientas</th>
                  <th className="text-left font-700 text-gray-500 py-2 pr-4">El. paštas</th>
                  <th className="text-left font-700 text-gray-500 py-2 pr-4">Sesijų</th>
                  <th className="text-left font-700 text-gray-500 py-2 pr-4">Paskutinė sesija</th>
                  <th className="text-left font-700 text-gray-500 py-2">Kontaktas</th>
                </tr>
              </thead>
              <tbody>
                {clients.map((c, i) => (
                  <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="py-3 pr-4">
                      <p className="font-600 text-[#0B5C71]">{c.name}</p>
                    </td>
                    <td className="py-3 pr-4 text-gray-500 text-xs">{c.email}</td>
                    <td className="py-3 pr-4">
                      <span className="badge text-xs text-[#0B5C71] bg-[#0B5C71]/10 border-[#0B5C71]/20">
                        {c.count}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-gray-600 text-xs">
                      {c.lastDate
                        ? c.lastDate.toLocaleDateString("lt-LT", { year: "numeric", month: "2-digit", day: "2-digit" })
                        : "—"}
                    </td>
                    <td className="py-3">
                      {c.email !== "—" && (
                        <a
                          href={`mailto:${c.email}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#0B5C71]/10 text-[#0B5C71] text-xs font-700 hover:bg-[#0B5C71]/20 transition-colors"
                        >
                          Rašyti
                        </a>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
