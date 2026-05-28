import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import TrainerProfileForm from "./TrainerProfileForm";

export const dynamic = "force-dynamic";

export default async function TrainerProfilePage() {
  const session = await getServerSession(authOptions);
  const sessionUser = session!.user as any;

  const trainerProfile = await prisma.trainerProfile.findUnique({
    where: { userId: sessionUser.id },
    include: {
      arenas: { include: { arena: true } },
    },
  });

  const allArenas = await prisma.arena.findMany({
    where: { status: "APPROVED" },
    orderBy: { name: "asc" },
  });

  const profileData = trainerProfile
    ? {
        id: trainerProfile.id,
        displayName: trainerProfile.displayName,
        bio: trainerProfile.bio ?? "",
        photoUrl: trainerProfile.photoUrl ?? "",
        city: trainerProfile.city,
        phone: trainerProfile.phone ?? "",
        arenaIds: trainerProfile.arenas.map((ta) => ta.arenaId),
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
      <TrainerProfileForm profile={profileData} arenas={allArenas} />
    </div>
  );
}
