import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { email, displayName, city, phone, bio, photoUrl, sportIds } = body;

  if (!email || !displayName || !city) {
    return NextResponse.json(
      { error: "Privalomi laukai: el. paštas, vardas, miestas" },
      { status: 400 }
    );
  }

  // Find or create user by email
  let user = await prisma.user.findUnique({ where: { email } });

  if (user) {
    // Check if already has a trainer profile
    const existingProfile = await prisma.trainerProfile.findUnique({
      where: { userId: user.id },
    });
    if (existingProfile) {
      return NextResponse.json(
        { error: "Šis vartotojas jau turi trenerio profilį" },
        { status: 400 }
      );
    }
    // Update role to TRAINER if not ADMIN
    if (user.role !== "ADMIN") {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { role: "TRAINER" },
      });
    }
  } else {
    user = await prisma.user.create({
      data: {
        email,
        role: "TRAINER",
      },
    });
  }

  const trainerProfile = await prisma.trainerProfile.create({
    data: {
      userId: user.id,
      displayName,
      city,
      phone: phone ?? null,
      bio: bio ?? null,
      photoUrl: photoUrl ?? null,
      status: "APPROVED",
    },
  });

  if (sportIds && sportIds.length > 0) {
    await prisma.trainerSport.createMany({
      data: (sportIds as string[]).map((sportId) => ({
        trainerId: trainerProfile.id,
        sportId,
      })),
    });
  }

  return NextResponse.json(trainerProfile, { status: 201 });
}
