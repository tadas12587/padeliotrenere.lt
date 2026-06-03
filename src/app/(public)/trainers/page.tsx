export const dynamic = "force-dynamic";

import Link from "next/link";
import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { MapPin, Star, Award } from "lucide-react";
import { TrainerFilters } from "./TrainerFilters";

export const metadata: Metadata = {
  title: "Treneriai",
  description: "Rask sporto trenerį – padelis, tenisas, krepšinis ir daugiau.",
};

export default async function TrainersPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { city = "", serviceType = "", sport = "" } = await searchParams;

  const cityFilter = typeof city === "string" ? city.trim() : "";
  const serviceTypeFilter =
    typeof serviceType === "string" ? serviceType.trim() : "";
  const sportFilter = typeof sport === "string" ? sport.trim() : "";

  const [trainers, rawCities, rawServices, availableSports] = await Promise.all([
    prisma.trainerProfile.findMany({
      where: {
        status: "APPROVED",
        ...(cityFilter ? { city: { contains: cityFilter } } : {}),
      },
      include: {
        user: true,
        services: true,
        reviews: true,
        sports: { include: { sport: true } },
        certifications: { select: { id: true, name: true } },
      },
      orderBy: { isFeatured: "desc" },
    }),
    prisma.trainerProfile.findMany({
      where: { status: "APPROVED", city: { not: "" } },
      select: { city: true },
      distinct: ["city"],
      orderBy: { city: "asc" },
    }),
    prisma.service.findMany({
      where: { trainer: { status: "APPROVED" } },
      select: { name: true },
      distinct: ["name"],
      orderBy: { name: "asc" },
    }),
    prisma.sport.findMany({
      where: { trainers: { some: { trainer: { status: "APPROVED" } } } },
      orderBy: { name: "asc" },
    }),
  ]);

  const availableCities = rawCities
    .map((t) => t.city)
    .filter((c): c is string => !!c);
  const availableServiceTypes = rawServices.map((s) => s.name);

  const filtered = serviceTypeFilter
    ? trainers.filter((t) =>
        t.services.some((s) =>
          s.name.toLowerCase().includes(serviceTypeFilter.toLowerCase())
        )
      )
    : trainers;

  const withSport = sportFilter
    ? filtered.filter((t) => t.sports?.some((ts) => ts.sport.slug === sportFilter))
    : filtered;

  return (
    <div className="min-h-screen">
      {/* Page Header */}
      <section className="bg-[#0B5C71] text-white py-16">
        <div className="container-tight">
          <span className="text-[#FF5733] font-700 uppercase tracking-widest text-sm">
            Platforma
          </span>
          <h1 className="text-4xl lg:text-5xl font-900 mt-3 mb-4">
            Treneriai
          </h1>
          <p className="text-gray-400 text-lg max-w-xl">
            Rask sau tinkamiausią trenerį. Filtruok pagal sportą, miestą arba
            paslaugos tipą.
          </p>
        </div>
      </section>

      {/* Filters */}
      <section className="bg-white border-b border-gray-100 py-6 sticky top-0 z-10 shadow-sm">
        <div className="container-tight">
          <TrainerFilters
            initialCity={cityFilter}
            initialServiceType={serviceTypeFilter}
            initialSport={sportFilter}
            availableCities={availableCities}
            availableServiceTypes={availableServiceTypes}
            availableSports={availableSports}
          />
        </div>
      </section>

      {/* Trainer Grid */}
      <section className="py-12 bg-[#F4F4F4]">
        <div className="container-wide">
          {withSport.length === 0 ? (
            <div className="text-center py-24">
              <div className="text-6xl mb-4">🎾</div>
              <h2 className="text-2xl font-800 text-[#0B5C71] mb-2">
                Trenerių nerasta
              </h2>
              <p className="text-gray-500">
                Pabandykite pakeisti filtrus arba peržiūrėkite visus trenerius.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
              {withSport.map((trainer) => {
                const avgRating =
                  trainer.reviews.length > 0
                    ? trainer.reviews.reduce((s, r) => s + r.rating, 0) /
                      trainer.reviews.length
                    : null;

                const initials = trainer.displayName
                  .split(" ")
                  .map((w) => w[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase();

                return (
                  <div key={trainer.id} className="card p-0 overflow-hidden flex flex-col">
                    {/* 3:4 portrait photo */}
                    <div className="relative aspect-[3/4] bg-gradient-to-br from-[#0B5C71] to-[#083d4e] flex items-center justify-center overflow-hidden">
                      {trainer.photoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={trainer.photoUrl}
                          alt={trainer.displayName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-20 h-20 rounded-full bg-[#FF5733]/20 border-2 border-[#FF5733]/40 flex items-center justify-center">
                          <span className="text-2xl font-900 text-white">{initials}</span>
                        </div>
                      )}

                      {/* Featured badge */}
                      {trainer.isFeatured && (
                        <div className="absolute top-2.5 right-2.5 bg-[#FF5733] text-white text-xs font-700 px-2 py-0.5 rounded-full shadow-sm">
                          ⭐ Top
                        </div>
                      )}

                      {/* Sport labels — bottom of photo */}
                      {trainer.sports.length > 0 && (
                        <div
                          className="absolute bottom-0 left-0 right-0 px-2.5 pb-2.5 pt-6 flex flex-wrap gap-1"
                          style={{ background: "linear-gradient(to top, rgba(0,0,0,0.72) 0%, transparent 100%)" }}
                        >
                          {trainer.sports.slice(0, 2).map(({ sport }) => (
                            <span
                              key={sport.id}
                              className="inline-flex items-center gap-1 bg-white/95 text-[#0B5C71] text-xs font-800 px-2 py-0.5 rounded-full shadow-sm"
                            >
                              {sport.icon && <span className="leading-none">{sport.icon}</span>}
                              {sport.name}
                            </span>
                          ))}
                          {trainer.sports.length > 2 && (
                            <span className="inline-flex items-center bg-white/95 text-[#0B5C71] text-xs font-800 px-2 py-0.5 rounded-full shadow-sm">
                              +{trainer.sports.length - 2}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="p-3 sm:p-4 flex flex-col gap-2 flex-1">
                      <div>
                        <h2 className="font-800 text-sm sm:text-base text-[#0B5C71] leading-tight">
                          {trainer.displayName}
                        </h2>
                        <p className="text-gray-500 text-xs mt-0.5 flex items-center gap-1">
                          <MapPin size={10} className="text-[#FF5733] shrink-0" />
                          {trainer.city}
                        </p>
                      </div>

                      {/* Rating */}
                      {avgRating !== null && (
                        <div className="flex items-center gap-1">
                          <Star size={11} className="text-[#FF5733] fill-[#FF5733]" />
                          <span className="text-xs font-800 text-gray-700">{avgRating.toFixed(1)}</span>
                          <span className="text-xs text-gray-400">({trainer.reviews.length})</span>
                        </div>
                      )}

                      {/* Certifications */}
                      {trainer.certifications.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {trainer.certifications.slice(0, 2).map((cert) => (
                            <span
                              key={cert.id}
                              className="flex items-center gap-0.5 text-xs bg-[#0B5C71]/8 text-[#0B5C71] px-1.5 py-0.5 rounded-full leading-none"
                            >
                              <Award size={9} className="shrink-0" />
                              {cert.name}
                            </span>
                          ))}
                          {trainer.certifications.length > 2 && (
                            <span className="text-xs text-gray-400 self-center">
                              +{trainer.certifications.length - 2}
                            </span>
                          )}
                        </div>
                      )}

                      <div className="mt-auto pt-2 border-t border-gray-100">
                        <Link
                          href={`/trainers/${trainer.id}`}
                          className="btn-primary w-full text-center text-xs sm:text-sm py-2"
                        >
                          Žiūrėti profilį
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
