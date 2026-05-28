import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Calendar, User, Award, ArrowRight, Clock } from "lucide-react";
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
          slot: { date: { gte: today } },
        },
        orderBy: { slot: { date: "asc" } },
        take: 10,
        include: {
          user: { select: { name: true, email: true } },
          slot: { select: { date: true, startTime: true, endTime: true } },
          arena: { select: { name: true, city: true } },
          service: { select: { name: true } },
        },
      })
    : [];

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
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                {upcomingBookings.map((b) => (
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
                    <td className="py-3 pr-4 text-gray-600">
                      {b.slot ? formatDateLT(b.slot.date) : "—"}
                    </td>
                    <td className="py-3 pr-4 text-gray-600">
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        {b.slot ? `${b.slot.startTime} – ${b.slot.endTime}` : "—"}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-gray-600">
                      {b.arena ? `${b.arena.name}, ${b.arena.city}` : "—"}
                    </td>
                    <td className="py-3 text-gray-600">
                      {b.service?.name || "—"}
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
