import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const trainer = await prisma.trainerProfile.findUnique({
    where: { id },
    include: {
      user: { select: { name: true } },
      services: true,
      certifications: true,
      arenas: { include: { arena: true } },
      reviews: { include: { author: { select: { name: true, image: true } } } },
      slots: {
        where: { status: "AVAILABLE", startTime: { gte: new Date() } },
        orderBy: { startTime: "asc" },
        take: 50,
        include: { arena: true },
      },
    },
  });

  if (!trainer || trainer.status !== "APPROVED") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(trainer);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const userId = (session.user as any).id;
  const role = (session.user as any).role;

  const trainer = await prisma.trainerProfile.findUnique({ where: { id } });
  if (!trainer) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (trainer.userId !== userId && role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const { displayName, bio, photoUrl, city, phone, isFeatured, arenaIds, sportIds,
    instagramUrl, facebookUrl, youtubeUrl, tiktokUrl, websiteUrl } = body;

  const updated = await prisma.trainerProfile.update({
    where: { id },
    data: {
      ...(displayName !== undefined && { displayName }),
      ...(bio !== undefined && { bio }),
      ...(photoUrl !== undefined && { photoUrl }),
      ...(city !== undefined && { city }),
      ...(phone !== undefined && { phone }),
      ...(role === "ADMIN" && isFeatured !== undefined && { isFeatured }),
      ...(instagramUrl !== undefined && { instagramUrl: instagramUrl || null }),
      ...(facebookUrl !== undefined && { facebookUrl: facebookUrl || null }),
      ...(youtubeUrl !== undefined && { youtubeUrl: youtubeUrl || null }),
      ...(tiktokUrl !== undefined && { tiktokUrl: tiktokUrl || null }),
      ...(websiteUrl !== undefined && { websiteUrl: websiteUrl || null }),
    },
  });

  if (arenaIds !== undefined) {
    await prisma.trainerArena.deleteMany({ where: { trainerId: id } });
    if (arenaIds.length > 0) {
      await prisma.trainerArena.createMany({
        data: arenaIds.map((arenaId: string) => ({ trainerId: id, arenaId })),
      });
    }
  }

  if (sportIds !== undefined) {
    await prisma.trainerSport.deleteMany({ where: { trainerId: id } });
    if (sportIds.length > 0) {
      await prisma.trainerSport.createMany({
        data: sportIds.map((sportId: string) => ({ trainerId: id, sportId })),
      });
    }
  }

  return NextResponse.json(updated);
}
