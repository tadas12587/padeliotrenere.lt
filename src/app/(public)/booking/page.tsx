export const dynamic = "force-dynamic";

import { Metadata } from "next";
import MultiTrainerBooking from "@/components/booking/MultiTrainerBooking";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Rezervacija",
  description:
    "Rezervuokite treniruotę su sporto treneriu. Pasirinkite sporto šaką, miestą ir patogų laiką.",
};

interface Props {
  searchParams: Promise<{ trainerId?: string; arenaId?: string }>;
}

export default async function BookingPage({ searchParams }: Props) {
  const { trainerId, arenaId } = await searchParams;

  const [rawSports, rawCities] = await Promise.all([
    prisma.sport.findMany({
      where: { trainers: { some: { trainer: { status: "APPROVED" } } } },
      orderBy: { name: "asc" },
    }),
    prisma.trainerProfile.findMany({
      where: { status: "APPROVED", city: { not: "" } },
      select: { city: true },
      distinct: ["city"],
      orderBy: { city: "asc" },
    }),
  ]);

  const availableCities = rawCities
    .map((t) => t.city)
    .filter((c): c is string => !!c);

  return (
    <div className="min-h-screen bg-[#F4F4F4]">
      <div className="bg-[#0B5C71] text-white py-14">
        <div className="container-tight text-center">
          <span className="text-[#FF5733] font-700 uppercase tracking-widest text-sm">
            Rezervacija
          </span>
          <h1 className="text-4xl font-900 mt-2 mb-3">Rezervuokite treniruotę</h1>
          <p className="text-gray-400 max-w-lg mx-auto">
            Pasirinkite sporto šaką, miestą, dieną ir laiką – rezervuokite treniruotę su
            bet kuriuo mūsų treneriu.
          </p>
        </div>
      </div>
      <div className="container-tight py-12">
        <MultiTrainerBooking
          initialTrainerId={trainerId ?? ""}
          initialArenaId={arenaId ?? ""}
          availableSports={rawSports}
          availableCities={availableCities}
        />
      </div>
    </div>
  );
}
