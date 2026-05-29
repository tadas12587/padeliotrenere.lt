import { prisma } from "@/lib/prisma";
import CreateArenaForm from "./CreateArenaForm";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function NewArenaPage() {
  const sports = await prisma.sport.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/admin/arenas"
          className="text-sm text-gray-500 hover:text-[#0B5C71] transition-colors"
        >
          ← Atgal į arenas
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-900 text-[#0B5C71]">Nauja arena</h1>
        <p className="text-gray-500 text-sm mt-1">
          Sukurkite naują areną — ji bus iš karto patvirtinta
        </p>
      </div>

      <CreateArenaForm sports={sports} />
    </div>
  );
}
