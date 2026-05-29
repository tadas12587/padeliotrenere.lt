import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const { status, displayName, bio, city, phone, isFeatured, photoUrl, sportIds } = body;

  if (status !== undefined && !["APPROVED", "REJECTED", "PENDING"].includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const trainer = await prisma.trainerProfile.update({
    where: { id },
    data: {
      ...(status !== undefined && { status }),
      ...(displayName !== undefined && { displayName }),
      ...(bio !== undefined && { bio }),
      ...(city !== undefined && { city }),
      ...(phone !== undefined && { phone }),
      ...(isFeatured !== undefined && { isFeatured }),
      ...(photoUrl !== undefined && { photoUrl }),
    },
  });

  if (sportIds !== undefined) {
    await prisma.trainerSport.deleteMany({ where: { trainerId: id } });
    if (sportIds.length > 0) {
      await prisma.trainerSport.createMany({
        data: sportIds.map((sportId: string) => ({ trainerId: id, sportId })),
      });
    }
  }

  return NextResponse.json(trainer);
}
