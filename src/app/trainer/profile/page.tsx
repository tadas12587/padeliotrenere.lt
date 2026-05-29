import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import TrainerProfileForm from "./TrainerProfileForm";
import ServicesManager from "@/components/ServicesManager";

export const dynamic = "force-dynamic";

export default async function TrainerProfilePage() {
  const session = await getServerSession(authOptions);
  const sessionUser = session!.user as any;

  const [trainerProfile, allArenas, allSports] = await Promise.all([
    prisma.trainerProfile.findUnique({
      where: { userId: sessionUser.id },
      include: {
        arenas: { include: { arena: true } },
        sports: { include: { sport: true } },
        gallery: { orderBy: { order: "asc" } },
        services: { orderBy: { name: "asc" } },
      },
    }),
    prisma.arena.findMany({
      where: { status: "APPROVED" },
      orderBy: { name: "asc" },
    }),
    prisma.sport.findMany({
      orderBy: { name: "asc" },
    }),
  ]);

  const profileData = trainerProfile
    ? {
        id: trainerProfile.id,
        displayName: trainerProfile.displayName,
        bio: trainerProfile.bio ?? "",
        photoUrl: trainerProfile.photoUrl ?? "",
        city: trainerProfile.city,
        phone: trainerProfile.phone ?? "",
        arenaIds: trainerProfile.arenas.map((ta) => ta.arenaId),
        sportIds: trainerProfile.sports.map((ts) => ts.sportId),
      }
    : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-900 text-[#0B5C71]">Mano profilis</h1>
        <p className="text-gray-500 text-sm mt-1">
          Redaguokite savo viešą trenerio profilį
        </p>
      </div>
      <TrainerProfileForm
        profile={profileData}
        arenas={allArenas}
        sports={allSports}
        gallery={trainerProfile?.gallery ?? []}
      />
      {trainerProfile && (
        <ServicesManager
          trainerId={trainerProfile.id}
          isAdmin={false}
          initialServices={trainerProfile.services.map((s) => ({
            ...s,
            price: s.price !== null ? String(s.price) : null,
          }))}
        />
      )}
    </div>
  );
}
