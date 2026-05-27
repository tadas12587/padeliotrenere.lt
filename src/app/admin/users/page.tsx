import { prisma } from "@/lib/prisma";
import { formatDateLT } from "@/lib/utils";
import { Users } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    where: { role: "CLIENT" },
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { bookings: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-[#16213e]">Vartotojai</h1>
        <span className="badge bg-gray-100 text-gray-600 border-gray-200">
          {users.length} klientų
        </span>
      </div>

      {users.length === 0 ? (
        <div className="card p-12 text-center">
          <Users size={48} className="mx-auto mb-4 text-gray-300" />
          <p className="font-bold text-gray-500">Vartotojų dar nėra</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left font-bold text-gray-500 px-5 py-3 uppercase text-xs tracking-wide">
                    Vartotojas
                  </th>
                  <th className="text-left font-bold text-gray-500 px-5 py-3 uppercase text-xs tracking-wide">
                    Telefonas
                  </th>
                  <th className="text-left font-bold text-gray-500 px-5 py-3 uppercase text-xs tracking-wide">
                    Rezervacijos
                  </th>
                  <th className="text-left font-bold text-gray-500 px-5 py-3 uppercase text-xs tracking-wide">
                    Registracija
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#e94560]/10 flex items-center justify-center font-black text-[#e94560] text-sm shrink-0">
                          {(user.name || user.email || "?")[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-[#16213e]">{user.name || "—"}</p>
                          <p className="text-xs text-gray-400">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-gray-600">
                      {user.phone || <span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-5 py-4">
                      <span className="font-bold text-[#16213e]">
                        {user._count.bookings}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-gray-500 text-xs">
                      {formatDateLT(user.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
