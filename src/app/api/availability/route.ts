import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const city = searchParams.get("city");
  const sport = searchParams.get("sport");
  const trainerId = searchParams.get("trainerId");
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const slots = await prisma.availabilitySlot.findMany({
    where: {
      status: "AVAILABLE",
      ...(trainerId ? { trainerId } : {}),
      ...(city ? { arena: { city: { contains: city } } } : {}),
      ...(from ? { startTime: { gte: new Date(from) } } : { startTime: { gte: new Date() } }),
      ...(to ? { endTime: { lte: new Date(to) } } : {}),
      trainer: {
        status: "APPROVED",
        ...(sport ? { sports: { some: { sport: { slug: sport } } } } : {}),
      },
    },
    include: {
      trainer: { select: { id: true, displayName: true, photoUrl: true, services: true } },
      arena: { select: { id: true, name: true, city: true, address: true } },
    },
    orderBy: { startTime: "asc" },
    take: 200,
  });

  return NextResponse.json(slots);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;
  if (!session?.user || role !== "TRAINER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as any).id;
  const profile = await prisma.trainerProfile.findUnique({ where: { userId } });
  if (!profile || profile.status !== "APPROVED") {
    return NextResponse.json({ error: "Trainer not approved" }, { status: 403 });
  }

  const body = await req.json();
  const { arenaId, startTime, endTime } = body;

  if (!arenaId || !startTime || !endTime) {
    return NextResponse.json({ error: "arenaId, startTime, endTime required" }, { status: 400 });
  }

  const trainerArena = await prisma.trainerArena.findUnique({
    where: { trainerId_arenaId: { trainerId: profile.id, arenaId } },
  });
  if (!trainerArena) {
    return NextResponse.json({ error: "Trainer not associated with this arena" }, { status: 403 });
  }

  const slot = await prisma.availabilitySlot.create({
    data: {
      trainerId: profile.id,
      arenaId,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
    },
  });

  return NextResponse.json(slot, { status: 201 });
}
