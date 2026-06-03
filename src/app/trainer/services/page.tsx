import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ServicesManager from "@/components/ServicesManager";

export const dynamic = "force-dynamic";

export default async function TrainerServicesPage() {
  const session = await getServerSession(authOptions);
  const sessionUser = session!.user as any;

  const trainerProfile = await prisma.trainerProfile.findUnique({
    where: { userId: sessionUser.id },
    include: {
      sports: { include: { sport: true } },
      services: { include: { sport: true }, orderBy: { name: "asc" } },
    },
  });

  if (!trainerProfile) {
    return (
      <div className="card p-8 text-center text-gray-500">
        Trenerio profilis nerastas. Susisiekite su administratoriumi.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-900 text-[#0B5C71]">Paslaugos</h1>
        <p className="text-gray-500 text-sm mt-1">
          Valdykite savo teikiamas paslaugas
        </p>
      </div>
      <ServicesManager
        trainerId={trainerProfile.id}
        isAdmin={false}
        initialServices={trainerProfile.services.map((s) => ({
          ...s,
          price: s.price !== null ? String(s.price) : null,
        }))}
        sports={trainerProfile.sports.map((ts) => (ts as any).sport)}
      />
    </div>
  );
}
