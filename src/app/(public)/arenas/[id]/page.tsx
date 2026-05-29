import Link from "next/link";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { MapPin, ExternalLink } from "lucide-react";
import { prisma } from "@/lib/prisma";
import ArenaHero from "./ArenaHero";

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
    title: `${arena.name} – Sporto arena`,
    description: `${arena.name} sporto arena, ${arena.city}`,
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
    <div className="w-12 h-12 rounded-full bg-[#FF5733]/20 border-2 border-[#FF5733]/40 flex items-center justify-center font-900 text-[#0B5C71] text-sm shrink-0">
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
      photos: { orderBy: { order: "asc" } },
    },
  });

  if (!arena || arena.status !== "APPROVED") {
    notFound();
  }

  const approvedTrainers = arena.trainers.filter(
    (ta) => ta.trainer.status === "APPROVED"
  );

  const mapsUrl =
    arena.lat && arena.lng
      ? `https://www.google.com/maps?q=${arena.lat},${arena.lng}`
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
          [arena.name, arena.address, arena.city].filter(Boolean).join(", ")
        )}`;

  return (
    <div className="min-h-screen bg-[#F4F4F4]">
      {/* Full-width hero with cycling background */}
      <ArenaHero
        name={arena.name}
        city={arena.city}
        address={arena.address}
        logoUrl={arena.logoUrl ?? null}
        bannerUrl={arena.bannerUrl ?? null}
        photos={arena.photos}
        mapsUrl={mapsUrl}
        arenaId={arena.id}
      />

      <div className="container-tight py-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left / main column */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          {/* Description */}
          {arena.description && (
            <div className="card p-7">
              <h2 className="text-xl font-800 text-[#0B5C71] mb-4">Apie areną</h2>
              <p className="text-gray-600 leading-relaxed">{arena.description}</p>
            </div>
          )}

          {/* Gallery */}
          {arena.photos.length > 0 && (
            <div className="card p-7">
              <h2 className="text-xl font-800 text-[#0B5C71] mb-5">Galerija</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {arena.photos.map((photo) => (
                  <a
                    key={photo.id}
                    href={photo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="aspect-square rounded-xl overflow-hidden block hover:opacity-90 transition-opacity"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={photo.url} alt="Galerija" className="w-full h-full object-cover" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Trainers */}
          <div className="card p-7">
            <h2 className="text-xl font-800 text-[#0B5C71] mb-4">
              Treneriai šioje arenoje
              {approvedTrainers.length > 0 && (
                <span className="text-gray-400 font-600 text-base ml-2">
                  ({approvedTrainers.length})
                </span>
              )}
            </h2>

            {approvedTrainers.length === 0 ? (
              <p className="text-gray-400 text-sm">Šioje arenoje trenerių kol kas nėra.</p>
            ) : (
              <div className="flex flex-col gap-4">
                {approvedTrainers.map(({ trainer }) => (
                  <Link
                    key={trainer.id}
                    href={`/trainers/${trainer.id}`}
                    className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:border-[#FF5733]/30 hover:bg-[#FF5733]/5 transition-all group"
                  >
                    {trainer.photoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={trainer.photoUrl}
                        alt={trainer.displayName}
                        className="w-12 h-12 rounded-full object-cover border-2 border-[#FF5733]/30 shrink-0"
                      />
                    ) : (
                      <InitialsAvatar name={trainer.displayName} />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-700 text-[#0B5C71] group-hover:text-[#FF5733] transition-colors">
                        {trainer.displayName}
                      </p>
                      <div className="flex items-center gap-1 text-gray-400 text-sm mt-0.5">
                        <MapPin size={12} />
                        <span>{trainer.city}</span>
                      </div>
                    </div>
                    <span className="text-[#FF5733] text-sm font-700 shrink-0 group-hover:underline">
                      Žiūrėti profilį →
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right sidebar */}
        <div className="flex flex-col gap-6">
          {/* Location card */}
          <div className="card p-6">
            <h2 className="text-lg font-800 text-[#0B5C71] mb-4">Vieta</h2>
            <div className="flex flex-col gap-3 text-sm text-gray-600">
              <div className="flex items-start gap-2">
                <MapPin size={15} className="text-[#FF5733] shrink-0 mt-0.5" />
                <div>
                  <p className="font-700 text-[#0B5C71]">{arena.name}</p>
                  {arena.address && <p>{arena.address}</p>}
                  <p>{arena.city}</p>
                </div>
              </div>
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-600 text-[#0B5C71] hover:bg-[#0B5C71] hover:text-white hover:border-[#0B5C71] transition-colors"
              >
                <ExternalLink size={14} />
                Atidaryti Google Maps
              </a>
            </div>
          </div>

          {/* Booking CTA */}
          <div className="card p-6 bg-gradient-to-br from-[#0B5C71] to-[#083d4e] text-white">
            <h2 className="text-lg font-800 mb-2">Rezervuokite kortą</h2>
            <p className="text-gray-400 text-sm mb-5 leading-relaxed">
              Pasirinkite trenerį ir rezervuokite laiką šioje arenoje.
            </p>
            <Link href={`/booking?arenaId=${arena.id}`} className="btn-primary w-full text-center py-3">
              Rezervuoti
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
