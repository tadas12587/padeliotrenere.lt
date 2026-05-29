export const dynamic = "force-dynamic";

import Link from "next/link";
import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
                    {/* Photo / Avatar */}
                    <div className="relative h-48 bg-gradient-to-br from-[#0B5C71] to-[#083d4e] flex items-center justify-center">
                      {trainer.photoUrl ? (
                        <img
                          src={trainer.photoUrl}
                          alt={trainer.displayName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-24 h-24 rounded-full bg-[#FF5733]/20 border-2 border-[#FF5733]/40 flex items-center justify-center">
                          <span className="text-3xl font-900 text-white">
                            {initials}
                          </span>
                        </div>
                      )}
                      {trainer.isFeatured && (
                        <div className="absolute top-3 right-3 bg-[#FF5733] text-white text-xs font-700 px-2 py-1 rounded-full">
                          Rekomenduojamas
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="p-5 flex flex-col gap-3 flex-1">
                      <div>
                        <h2 className="font-800 text-lg text-[#0B5C71] leading-tight">
                          {trainer.displayName}
                        </h2>
                        <p className="text-gray-500 text-sm mt-0.5">
                          {trainer.city}
                        </p>
                      </div>

                      <div className="flex items-center gap-4 text-sm">
                        {avgRating !== null ? (
                          <div className="flex items-center gap-1 text-[#FF5733]">
                            <span className="font-800">{avgRating.toFixed(1)}</span>
                            <span className="text-yellow-400">★</span>
                            <span className="text-gray-400">
                              ({trainer.reviews.length})
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">Nėra atsiliepimų</span>
                        )}
                        <div className="text-gray-400">
                          {trainer.services.length} paslaugos
                        </div>
                      </div>

                      <div className="mt-auto pt-3 border-t border-gray-100">
                        <Link
                          href={`/trainers/${trainer.id}`}
                          className="btn-primary w-full text-center text-sm py-2.5"
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
