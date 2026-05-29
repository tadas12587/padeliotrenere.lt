import { prisma } from "@/lib/prisma";
import ServiceCatalogCRUD from "./ServiceCatalogCRUD";

export const dynamic = "force-dynamic";

export default async function AdminServiceCatalogPage() {
  const templates = await prisma.serviceTemplate.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-900 text-[#0B5C71]">Paslaugų katalogas</h1>
        <p className="text-gray-500 text-sm mt-1">
          Valdykite paslaugų šablonus — treneriai renkasi iš katalogo arba kuria savo paslaugas
        </p>
      </div>

      <ServiceCatalogCRUD
        initialTemplates={templates.map((t) => ({
          ...t,
          createdAt: t.createdAt.toISOString(),
        }))}
      />
    </div>
  );
}
