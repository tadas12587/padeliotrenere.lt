import { prisma } from "@/lib/prisma";
import TrainerStatusActions from "./TrainerStatusActions";
import Link from "next/link";
import { formatDateLT } from "@/lib/utils";

export const dynamic = "force-dynamic";

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Laukiama",
  APPROVED: "Patvirtinta",
  REJECTED: "Atmesta",
};

const STATUS_COLORS: Record<string, string> = {
  PENDING: "text-yellow-600 bg-yellow-50 border-yellow-200",
  APPROVED: "text-green-600 bg-green-50 border-green-200",
  REJECTED: "text-red-600 bg-red-50 border-red-200",
};

interface Props {
  searchParams: Promise<{ status?: string }>;
}

export default async function AdminTrainersPage({ searchParams }: Props) {
  const { status } = await searchParams;

  const trainers = await prisma.trainerProfile.findMany({
    where: status ? { status: status as any } : undefined,
    include: {
      user: { select: { name: true, email: true } },
      _count: { select: { arenas: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-900 text-[#16213e]">Treneriai</h1>
        <p className="text-gray-500 text-sm mt-1">
          Valdykite trenerių profilius ir jų statusą
        </p>
      </div>

      {/* Status filter */}
      <div className="flex gap-2 flex-wrap">
        {[
          { label: "Visi", value: "" },
          { label: "Laukiama", value: "PENDING" },
          { label: "Patvirtinti", value: "APPROVED" },
          { label: "Atmesti", value: "REJECTED" },
        ].map(({ label, value }) => (
          <Link
            key={value}
            href={value ? `/admin/trainers?status=${value}` : "/admin/trainers"}
            className={`px-4 py-2 rounded-xl text-sm font-700 transition-colors ${
              (status ?? "") === value
                ? "bg-[#e94560] text-white"
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
                <th className="text-left font-700 text-gray-500 py-3 px-5">Treneris</th>
                <th className="text-left font-700 text-gray-500 py-3 px-4">Miestas</th>
                <th className="text-left font-700 text-gray-500 py-3 px-4">El. paštas</th>
                <th className="text-left font-700 text-gray-500 py-3 px-4">Statusas</th>
                <th className="text-left font-700 text-gray-500 py-3 px-4">Registruotas</th>
                <th className="text-left font-700 text-gray-500 py-3 px-4">Veiksmai</th>
              </tr>
            </thead>
            <tbody>
              {trainers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-400">
                    Trenerių nerasta
                  </td>
                </tr>
              ) : (
                trainers.map((trainer) => (
                  <tr
                    key={trainer.id}
                    className="border-b border-gray-50 hover:bg-gray-50/50"
                  >
                    <td className="py-3 px-5">
                      <div className="flex items-center gap-3">
                        {trainer.photoUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={trainer.photoUrl}
                            alt={trainer.displayName}
                            className="w-9 h-9 rounded-full object-cover shrink-0"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-[#e94560]/10 flex items-center justify-center shrink-0">
                            <span className="text-sm font-700 text-[#e94560]">
                              {trainer.displayName.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                        <div>
                          <p className="font-700 text-[#16213e]">{trainer.displayName}</p>
                          <p className="text-xs text-gray-400">{trainer.user.name || "—"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-600">{trainer.city}</td>
                    <td className="py-3 px-4 text-gray-600">{trainer.user.email}</td>
                    <td className="py-3 px-4">
                      <span className={`badge ${STATUS_COLORS[trainer.status] ?? ""}`}>
                        {STATUS_LABELS[trainer.status] ?? trainer.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-500">
                      {formatDateLT(trainer.createdAt)}
                    </td>
                    <td className="py-3 px-4">
                      <TrainerStatusActions
                        trainerId={trainer.id}
                        currentStatus={trainer.status}
                      />
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
