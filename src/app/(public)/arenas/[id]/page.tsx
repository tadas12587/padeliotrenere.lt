import Link from "next/link";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { MapPin, ExternalLink, Award, Calendar } from "lucide-react";
import { prisma } from "@/lib/prisma";
import ArenaHero from "./ArenaHero";
import GallerySection from "./GallerySection";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const arena = await prisma.arena.findUnique({
    where: { id },
    select: { name: true, city: true, photoUrl: true },
  });
  if (!arena) return { title: "Arena nerasta" };
  return {
    title: `${arena.name} – Sporto arena`,
    description: `${arena.name} sporto arena ${arena.city}. Padelio kortai ir treniruotės.`,
    openGraph: {
      title: `${arena.name} – Sporto arena`,
      description: `${arena.name} sporto arena ${arena.city}. Padelio kortai ir treniruotės.`,
      type: "website",
      images: arena.photoUrl
        ? [{ url: arena.photoUrl, width: 1200, height: 630 }]
        : [],
    },
    twitter: {
      card: "summary_large_image" as const,
      title: `${arena.name} – Sporto arena`,
    },
  };
}

function TrainerPlaceholder({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return (
    <div className="w-full h-full flex items-center justify-center bg-[#0B5C71]/10">
      <span className="text-4xl font-900 text-[#0B5C71]/40">{initials}</span>
    </div>
  );
}

export default async function ArenaDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const now = new Date();

  const arena = await prisma.arena.findUnique({
    where: { id },
    include: {
      trainers: {
        include: {
          trainer: {
            include: {
              user: { select: { name: true } },
              certifications: { select: { id: true, name: true } },
              slots: {
                where: { status: "AVAILABLE", startTime: { gt: now } },
                select: { id: true },
              },
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SportsActivityLocation",
            name: arena.name,
            description: arena.description || undefined,
            image: arena.photoUrl || undefined,
            address: {
              "@type": "PostalAddress",
              streetAddress: arena.address,
              addressLocality: arena.city,
              addressCountry: "LT",
            },
            url: `${
              process.env.NEXT_PUBLIC_APP_URL ||
              "https://padeliotrenere.lt"
            }/arenas/${arena.id}`,
          }),
        }}
      />
      <ArenaHero
        name={arena.name}
        city={arena.city}
        address={arena.address}
        logoUrl={arena.logoUrl ?? null}
        bannerUrl={arena.bannerUrl ?? null}
        photos={arena.photos}
        mapsUrl={mapsUrl}
        arenaId={arena.id}
        courtBookingUrl={arena.courtBookingUrl ?? null}
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

          {/* Trainers */}
          <div className="card p-7">
            <h2 className="text-xl font-800 text-[#0B5C71] mb-5">
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
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                {approvedTrainers.map(({ trainer }) => (
                  <Link
                    key={trainer.id}
                    href={`/trainers/${trainer.id}`}
                    className="group flex flex-col rounded-2xl border border-gray-100 overflow-hidden hover:border-[#FF5733]/30 hover:shadow-md transition-all bg-white"
                  >
                    {/* 3:4 portrait photo */}
                    <div className="aspect-[3/4] overflow-hidden bg-gray-100 relative">
                      {trainer.photoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={trainer.photoUrl}
                          alt={trainer.displayName}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <TrainerPlaceholder name={trainer.displayName} />
                      )}
                      {/* Available slots badge */}
                      {trainer.slots.length > 0 && (
                        <div className="absolute top-3 right-3 flex items-center gap-1 bg-green-500 text-white text-xs font-700 px-2.5 py-1 rounded-full shadow-sm">
                          <Calendar size={11} />
                          <span>{trainer.slots.length} laisv.</span>
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="p-4 flex flex-col gap-2">
                      <p className="font-800 text-[#0B5C71] text-base group-hover:text-[#FF5733] transition-colors leading-tight">
                        {trainer.displayName}
                      </p>
                      <div className="flex items-center gap-1 text-gray-400 text-xs">
                        <MapPin size={11} className="text-[#FF5733]" />
                        <span>{trainer.city}</span>
                      </div>

                      {/* Certifications */}
                      {trainer.certifications.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {trainer.certifications.slice(0, 2).map((cert) => (
                            <span
                              key={cert.id}
                              className="flex items-center gap-1 text-xs bg-[#0B5C71]/8 text-[#0B5C71] px-2 py-0.5 rounded-full"
                            >
                              <Award size={10} />
                              {cert.name}
                            </span>
                          ))}
                          {trainer.certifications.length > 2 && (
                            <span className="text-xs text-gray-400 px-1 py-0.5">
                              +{trainer.certifications.length - 2}
                            </span>
                          )}
                        </div>
                      )}

                      <span className="mt-1 text-[#FF5733] text-xs font-700 group-hover:underline">
                        Žiūrėti profilį →
                      </span>
                    </div>
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
          <div className="rounded-2xl shadow-sm p-6" style={{ background: "linear-gradient(135deg, #0B5C71 0%, #083d4e 100%)" }}>
            <h2 className="text-lg font-800 text-white mb-2">Rezervuokite</h2>
            <p className="text-white/65 text-sm mb-5 leading-relaxed">
              Pasirinkite trenerį arba rezervuokite kortą šioje arenoje.
            </p>
            <div className="flex flex-col gap-2">
              <Link
                href={`/booking?arenaId=${arena.id}`}
                className="btn-primary w-full text-center py-3"
              >
                Rezervuoti trenerį
              </Link>
              {arena.courtBookingUrl && (
                <a
                  href={arena.courtBookingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full text-center py-3 rounded-xl font-700 text-sm bg-white/15 hover:bg-white/25 border border-white/30 text-white transition-colors"
                >
                  Rezervuoti kortą
                </a>
              )}
            </div>
          </div>

          {/* Gallery */}
          {arena.photos.length > 0 && (
            <GallerySection photos={arena.photos} />
          )}
        </div>
      </div>
    </div>
  );
}
