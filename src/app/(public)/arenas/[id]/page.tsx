import Link from "next/link";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { MapPin } from "lucide-react";
import { prisma } from "@/lib/prisma";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const arena = await prisma.arena.findUnique({
    where: { id },
    select: { name: true, city: true },
  });
  if (!arena) return { title: "Arena nerasta" };
  return {
    title: `${arena.name} – Padelio arena`,
    description: `${arena.name} padelio arena, ${arena.city}`,
  };
}

function InitialsAvatar({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return (
    <div className="w-12 h-12 rounded-full bg-[#e94560]/20 border-2 border-[#e94560]/40 flex items-center justify-center font-900 text-white text-sm shrink-0">
      {initials}
    </div>
  );
}

export default async function ArenaDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const arena = await prisma.arena.findUnique({
    where: { id },
    include: {
      trainers: {
        include: {
          trainer: {
            include: {
              user: { select: { name: true } },
            },
          },
        },
      },
    },
  });

  if (!arena || arena.status !== "APPROVED") {
    notFound();
  }

  const approvedTrainers = arena.trainers.filter(
    (ta) => ta.trainer.status === "APPROVED"
  );

  return (
    <div className="min-h-screen bg-[#f8f9fa]">
      {/* Header */}
      <section className="bg-[#16213e] text-white py-12">
        <div className="container-tight">
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6">
            {/* Photo / Placeholder */}
            <div className="shrink-0 w-full lg:w-48 h-40 lg:h-32 rounded-2xl overflow-hidden bg-gradient-to-br from-[#0f3460] to-[#16213e] flex items-center justify-center">
              {arena.photoUrl ? (
                <img
                  src={arena.photoUrl}
                  alt={arena.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-5xl">🏟️</span>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h1 className="text-3xl lg:text-4xl font-900 mb-2">
                {arena.name}
              </h1>
              <div className="flex items-center gap-1.5 text-gray-400 text-sm mb-3">
                <MapPin size={15} className="text-[#e94560]" />
                <span>
                  {arena.city}
                  {arena.address ? `, ${arena.address}` : ""}
                </span>
              </div>
              <span className="bg-green-500/20 text-green-400 border border-green-500/30 text-xs font-700 px-3 py-1 rounded-full uppercase tracking-wider">
                Patvirtinta
              </span>
            </div>

            {/* CTA */}
            <div className="shrink-0">
              <Link
                href={`/booking?arenaId=${arena.id}`}
                className="btn-primary py-3 px-7"
              >
                Rezervuoti
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="container-tight py-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left / main column */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          {/* Description */}
          {arena.description && (
            <div className="card p-7">
              <h2 className="text-xl font-800 text-[#16213e] mb-4">
                Apie areną
              </h2>
              <p className="text-gray-600 leading-relaxed">
                {arena.description}
              </p>
            </div>
          )}

          {/* Trainers */}
          <div className="card p-7">
            <h2 className="text-xl font-800 text-[#16213e] mb-4">
              Treneriai šioje arenoje
              {approvedTrainers.length > 0 && (
                <span className="text-gray-400 font-600 text-base ml-2">
                  ({approvedTrainers.length})
                </span>
              )}
            </h2>

            {approvedTrainers.length === 0 ? (
              <p className="text-gray-400 text-sm">
                Šioje arenoje trenerių kol kas nėra.
              </p>
            ) : (
              <div className="flex flex-col gap-4">
                {approvedTrainers.map(({ trainer }) => {
                  return (
                    <Link
                      key={trainer.id}
                      href={`/trainers/${trainer.id}`}
                      className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:border-[#e94560]/30 hover:bg-[#e94560]/5 transition-all group"
                    >
                      {/* Photo / Avatar */}
                      {trainer.photoUrl ? (
                        <img
                          src={trainer.photoUrl}
                          alt={trainer.displayName}
                          className="w-12 h-12 rounded-full object-cover border-2 border-[#e94560]/30 shrink-0"
                        />
                      ) : (
                        <InitialsAvatar name={trainer.displayName} />
                      )}

                      <div className="flex-1 min-w-0">
                        <p className="font-700 text-[#16213e] group-hover:text-[#e94560] transition-colors">
                          {trainer.displayName}
                        </p>
                        <div className="flex items-center gap-1 text-gray-400 text-sm mt-0.5">
                          <MapPin size={12} />
                          <span>{trainer.city}</span>
                        </div>
                      </div>

                      <span className="text-[#e94560] text-sm font-700 shrink-0 group-hover:underline">
                        Žiūrėti profilį →
                      </span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right sidebar */}
        <div className="flex flex-col gap-6">
          {/* Location card */}
          <div className="card p-6">
            <h2 className="text-lg font-800 text-[#16213e] mb-4">
              Vieta
            </h2>
            <div className="flex flex-col gap-2 text-sm text-gray-600">
              <div className="flex items-start gap-2">
                <MapPin size={15} className="text-[#e94560] shrink-0 mt-0.5" />
                <div>
                  <p className="font-700 text-[#16213e]">{arena.name}</p>
                  {arena.address && <p>{arena.address}</p>}
                  <p>{arena.city}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Booking CTA card */}
          <div className="card p-6 bg-gradient-to-br from-[#16213e] to-[#0f3460] text-white">
            <h2 className="text-lg font-800 mb-2">Rezervuokite kortą</h2>
            <p className="text-gray-400 text-sm mb-5 leading-relaxed">
              Pasirinkite trenerį ir rezervuokite laiką šioje arenoje.
            </p>
            <Link
              href={`/booking?arenaId=${arena.id}`}
              className="btn-primary w-full text-center py-3"
            >
              Rezervuoti
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
