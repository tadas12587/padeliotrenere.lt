export const dynamic = "force-dynamic";

import Link from "next/link";
import { Metadata } from "next";
import { MapPin, Users } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { ArenaFilters } from "./ArenaFilters";

export const metadata: Metadata = {
  title: "Arenos",
  description: "Peržiūrėkite visas padelio arenas ir kortus.",
};

export default async function ArenasPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { city = "", sport = "" } = await searchParams;
  const cityFilter = typeof city === "string" ? city.trim() : "";
  const sportFilter = typeof sport === "string" ? sport.trim() : "";

  const [arenas, rawCities, availableSports] = await Promise.all([
    prisma.arena.findMany({
      where: {
        status: "APPROVED",
        ...(cityFilter ? { city: { contains: cityFilter } } : {}),
      },
      include: {
        trainers: {
          include: { trainer: { select: { status: true } } },
        },
        sports: { include: { sport: true } },
      },
      orderBy: { name: "asc" },
    }),
    prisma.arena.findMany({
      where: { status: "APPROVED" },
      select: { city: true },
      distinct: ["city"],
      orderBy: { city: "asc" },
    }),
    prisma.sport.findMany({
      where: { arenas: { some: { arena: { status: "APPROVED" } } } },
      orderBy: { name: "asc" },
    }),
  ]);

  const availableCities = rawCities
    .map((a) => a.city)
    .filter((c): c is string => !!c);

  const filteredArenas = sportFilter
    ? arenas.filter((a) => a.sports?.some((as) => as.sport.slug === sportFilter))
    : arenas;

  return (
    <div className="min-h-screen">
      {/* Page Header */}
      <section className="bg-[#0B5C71] text-white py-16">
        <div className="container-tight">
          <span className="text-[#FF5733] font-700 uppercase tracking-widest text-sm">
            Platforma
          </span>
          <h1 className="text-4xl lg:text-5xl font-900 mt-3 mb-4">Arenos</h1>
          <p className="text-gray-400 text-lg max-w-xl">
            Rask sau artimiausiąją padelio areną. Filtruok pagal miestą.
          </p>
        </div>
      </section>

      {/* Filters */}
      <section className="bg-white border-b border-gray-100 py-6 sticky top-0 z-10 shadow-sm">
        <div className="container-tight">
          <ArenaFilters
            initialCity={cityFilter}
            initialSport={sportFilter}
            availableCities={availableCities}
            availableSports={availableSports}
          />
        </div>
      </section>

      {/* Arena Grid */}
      <section className="py-12 bg-[#F4F4F4]">
        <div className="container-wide">
          {filteredArenas.length === 0 ? (
            <div className="text-center py-24">
              <div className="text-6xl mb-4">🏟️</div>
              <h2 className="text-2xl font-800 text-[#0B5C71] mb-2">
                Arenų nerasta
              </h2>
              <p className="text-gray-500">
                Pabandykite pakeisti filtrus arba peržiūrėkite visas arenas.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredArenas.map((arena) => {
                const approvedTrainers = arena.trainers.filter(
                  (ta) => ta.trainer.status === "APPROVED"
                ).length;

                return (
                  <div
                    key={arena.id}
                    className="card p-0 overflow-hidden flex flex-col"
                  >
                    {/* Photo / Placeholder */}
                    <div className="relative h-44 bg-gradient-to-br from-[#0B5C71] to-[#083d4e] flex items-center justify-center">
                      {arena.photoUrl ? (
                        <img
                          src={arena.photoUrl}
                          alt={arena.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-6xl">🏟️</span>
                      )}
                    </div>

                    {/* Info */}
                    <div className="p-5 flex flex-col gap-3 flex-1">
                      <div>
                        <h2 className="font-800 text-lg text-[#0B5C71] leading-tight">
                          {arena.name}
                        </h2>
                        <div className="flex items-center gap-1.5 text-gray-500 text-sm mt-1">
                          <MapPin size={13} className="text-[#FF5733]" />
                          <span>
                            {arena.city}
                            {arena.address ? `, ${arena.address}` : ""}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 text-gray-400 text-sm">
                        <Users size={13} />
                        <span>
                          {approvedTrainers}{" "}
                          {approvedTrainers === 1 ? "treneris" : "treneriai"}
                        </span>
                      </div>

                      <div className="mt-auto pt-3 border-t border-gray-100">
                        <Link
                          href={`/arenas/${arena.id}`}
                          className="btn-primary w-full text-center text-sm py-2.5"
                        >
                          Žiūrėti
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
