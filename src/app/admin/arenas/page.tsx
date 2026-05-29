import { prisma } from "@/lib/prisma";
import ArenaStatusActions from "./ArenaStatusActions";
import Link from "next/link";
import { formatDateLT } from "@/lib/utils";
import { Pencil } from "lucide-react";

export const dynamic = "force-dynamic";

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Laukiama",
  APPROVED: "Patvirtinta",
};

const STATUS_COLORS: Record<string, string> = {
  PENDING: "text-yellow-600 bg-yellow-50 border-yellow-200",
  APPROVED: "text-green-600 bg-green-50 border-green-200",
};

interface Props {
  searchParams: Promise<{ status?: string }>;
}

export default async function AdminArenasPage({ searchParams }: Props) {
  const { status } = await searchParams;

  const arenas = await prisma.arena.findMany({
    where: status ? { status: status as any } : undefined,
    include: {
      createdBy: { select: { name: true, email: true } },
      _count: { select: { trainers: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-900 text-[#0B5C71]">Arenos</h1>
          <p className="text-gray-500 text-sm mt-1">
            Valdykite padelo arenas ir jų patvirtinimą
          </p>
        </div>
        <Link href="/admin/arenas/new" className="btn-primary text-sm py-2 px-4">
          + Kurti naują
        </Link>
      </div>

      {/* Status filter */}
      <div className="flex gap-2 flex-wrap">
        {[
          { label: "Visos", value: "" },
          { label: "Laukiama", value: "PENDING" },
          { label: "Patvirtintos", value: "APPROVED" },
        ].map(({ label, value }) => (
          <Link
            key={value}
            href={value ? `/admin/arenas?status=${value}` : "/admin/arenas"}
            className={`px-4 py-2 rounded-xl text-sm font-700 transition-colors ${
              (status ?? "") === value
                ? "bg-[#FF5733] text-white"
                : "bg-white text-gray-600 border border-gray-200 hover:border-gray-300"
            }`}
          >
            {label}
          </Link>
        ))}
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left font-700 text-gray-500 py-3 px-5">Arena</th>
                <th className="text-left font-700 text-gray-500 py-3 px-4">Miestas</th>
                <th className="text-left font-700 text-gray-500 py-3 px-4">Adresas</th>
                <th className="text-left font-700 text-gray-500 py-3 px-4">Statusas</th>
                <th className="text-left font-700 text-gray-500 py-3 px-4">Sukūrė</th>
                <th className="text-left font-700 text-gray-500 py-3 px-4">Treneriai</th>
                <th className="text-left font-700 text-gray-500 py-3 px-4">Veiksmai</th>
              </tr>
            </thead>
            <tbody>
              {arenas.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-400">
                    Arenų nerasta
                  </td>
                </tr>
              ) : (
                arenas.map((arena) => (
                  <tr
                    key={arena.id}
                    className="border-b border-gray-50 hover:bg-gray-50/50"
                  >
                    <td className="py-3 px-5">
                      <div className="flex items-center gap-3">
                        {arena.photoUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={arena.photoUrl}
                            alt={arena.name}
                            className="w-9 h-9 rounded-lg object-cover shrink-0"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-lg bg-[#0B5C71]/10 flex items-center justify-center shrink-0 text-lg">
                            🏟️
                          </div>
                        )}
                        <p className="font-700 text-[#0B5C71]">{arena.name}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-600">{arena.city}</td>
                    <td className="py-3 px-4 text-gray-500 max-w-[200px] truncate">
                      {arena.address}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`badge ${STATUS_COLORS[arena.status] ?? ""}`}>
                        {STATUS_LABELS[arena.status] ?? arena.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-gray-600">{arena.createdBy.name || "—"}</p>
                      <p className="text-xs text-gray-400">{arena.createdBy.email}</p>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="font-700 text-[#0B5C71]">
                        {arena._count.trainers}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Link
                          href={`/admin/arenas/${arena.id}/edit`}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-700 transition-colors"
                        >
                          <Pencil size={13} /> Redaguoti
                        </Link>
                        <ArenaStatusActions
                          arenaId={arena.id}
                          currentStatus={arena.status}
                        />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
