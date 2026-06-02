import { prisma } from "@/lib/prisma";
import SportsCRUD from "./SportsCRUD";

export const dynamic = "force-dynamic";

export default async function AdminSportsPage() {
  const sports = await prisma.sport.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: {
        select: { trainers: true, arenas: true },
      },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-900 text-[#0B5C71]">Sporto šakos</h1>
        <p className="text-gray-500 text-sm mt-1">
          Valdykite sporto šakų sąrašą — kurkite, redaguokite ir trinkite
        </p>
      </div>

      <SportsCRUD initialSports={sports as any[]} />
    </div>
  );
}
