import { prisma } from "@/lib/prisma";
import CreateTrainerForm from "./CreateTrainerForm";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function NewTrainerPage() {
  const sports = await prisma.sport.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/admin/trainers"
          className="text-sm text-gray-500 hover:text-[#0B5C71] transition-colors"
        >
          ← Atgal į trenerius
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-900 text-[#0B5C71]">Naujas treneris</h1>
        <p className="text-gray-500 text-sm mt-1">
          Sukurkite naują trenerio profilį — jis bus iš karto patvirtintas
        </p>
      </div>

      <CreateTrainerForm sports={sports} />
    </div>
  );
}
