import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import EditArenaForm from "./EditArenaForm";
import { ChevronLeft } from "lucide-react";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditArenaPage({ params }: Props) {
  const { id } = await params;

  const [arena, allSports] = await Promise.all([
    prisma.arena.findUnique({
      where: { id },
      include: {
        sports: { include: { sport: true } },
        photos: { orderBy: { order: "asc" } },
      },
    }),
    prisma.sport.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!arena) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/admin/arenas"
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-[#0B5C71] transition-colors"
        >
          <ChevronLeft size={16} />
          Atgal
        </Link>
        <div>
          <h1 className="text-2xl font-900 text-[#0B5C71]">
            Redaguoti areną
          </h1>
          <p className="text-gray-500 text-sm mt-1">{arena.name}</p>
        </div>
      </div>

      <EditArenaForm
        arena={{
          id: arena.id,
          name: arena.name,
          city: arena.city,
          address: arena.address,
          description: arena.description ?? "",
          photoUrl: arena.photoUrl ?? "",
          logoUrl: arena.logoUrl ?? "",
          bannerUrl: arena.bannerUrl ?? "",
          lat: arena.lat ?? null,
          lng: arena.lng ?? null,
          courtBookingUrl: arena.courtBookingUrl ?? "",
          status: arena.status,
          sportIds: arena.sports.map((as) => as.sportId),
          photos: arena.photos,
        }}
        allSports={allSports as any[]}
      />
    </div>
  );
}
