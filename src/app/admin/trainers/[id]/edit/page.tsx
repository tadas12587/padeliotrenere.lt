import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import EditTrainerForm from "./EditTrainerForm";
import { ChevronLeft } from "lucide-react";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditTrainerPage({ params }: Props) {
  const { id } = await params;

  const [trainer, allSports] = await Promise.all([
    prisma.trainerProfile.findUnique({
      where: { id },
      include: {
        sports: { include: { sport: true } },
        gallery: { orderBy: { order: "asc" } },
      },
    }),
    prisma.sport.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!trainer) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/admin/trainers"
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-[#0B5C71] transition-colors"
        >
          <ChevronLeft size={16} />
          Atgal
        </Link>
        <div>
          <h1 className="text-2xl font-900 text-[#0B5C71]">
            Redaguoti trenerį
          </h1>
          <p className="text-gray-500 text-sm mt-1">{trainer.displayName}</p>
        </div>
      </div>

      <EditTrainerForm
        trainer={{
          id: trainer.id,
          displayName: trainer.displayName,
          bio: trainer.bio ?? "",
          photoUrl: trainer.photoUrl ?? "",
          city: trainer.city,
          phone: trainer.phone ?? "",
          isFeatured: trainer.isFeatured,
          status: trainer.status,
          sportIds: trainer.sports.map((ts) => ts.sportId),
          gallery: trainer.gallery,
        }}
        allSports={allSports}
      />
    </div>
  );
}
