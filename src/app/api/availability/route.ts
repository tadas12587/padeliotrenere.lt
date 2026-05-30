import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const SERVICE_SELECT = {
  id: true,
  name: true,
  durationMinutes: true,
  price: true,
  type: true,
  priceType: true,
  maxParticipants: true,
  description: true,
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const city = searchParams.get("city");
  const sport = searchParams.get("sport");
  const trainerId = searchParams.get("trainerId");
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const own = searchParams.get("own") === "1"; // trainer fetching their own slots (all statuses)

  // When a trainer requests their own slots (own=1), allow all statuses and skip date floor
  let statusFilter: any = { status: "AVAILABLE" };
  let trainerFilter: any = { status: "APPROVED" };
  if (own) {
    const session = await getServerSession(authOptions);
    const role = (session?.user as any)?.role;
    if (role === "TRAINER" || role === "ADMIN") {
      statusFilter = {}; // no status filter — return all
      trainerFilter = {}; // no approval check for own slots
    }
  }

  const slots = await prisma.availabilitySlot.findMany({
    where: {
      ...statusFilter,
      ...(trainerId ? { trainerId } : {}),
      ...(city ? { arena: { city: { contains: city } } } : {}),
      ...(!own && from ? { startTime: { gte: new Date(from) } } : !own ? { startTime: { gte: new Date() } } : {}),
      ...(from && own ? { startTime: { gte: new Date(from) } } : {}),
      ...(to ? { endTime: { lte: new Date(to) } } : {}),
      trainer: {
        ...trainerFilter,
        ...(sport ? { sports: { some: { sport: { slug: sport } } } } : {}),
      },
    },
    include: {
      trainer: { select: { id: true, displayName: true, photoUrl: true, services: { select: SERVICE_SELECT } } },
      arena: { select: { id: true, name: true, city: true, address: true } },
      services: { select: SERVICE_SELECT },
      _count: { select: { bookings: { where: { status: { in: ["PENDING", "CONFIRMED"] } } } } },
    },
    orderBy: { startTime: "asc" },
    take: 500,
  });

  const result = slots.map(({ _count, ...slot }: { _count: { bookings: number }; [key: string]: any }) => ({
    ...slot,
    currentBookings: _count.bookings,
  }));

  return NextResponse.json(result);
}

interface Recurrence {
  type: "none" | "daily" | "weekly";
  daysOfWeek?: number[];
  until?: string;
}

function generateDates(baseStart: Date, baseEnd: Date, recurrence: Recurrence): { start: Date; end: Date }[] {
  const startMs = baseStart.getTime();
  const endMs = baseEnd.getTime();
  const durationMs = endMs - startMs;

  const baseDateMidnight = new Date(
    Date.UTC(baseStart.getUTCFullYear(), baseStart.getUTCMonth(), baseStart.getUTCDate())
  );
  const startOffset = startMs - baseDateMidnight.getTime();
  const endOffset = startOffset + durationMs;

  const until = new Date(recurrence.until!);
  const untilMidnight = new Date(
    Date.UTC(until.getUTCFullYear(), until.getUTCMonth(), until.getUTCDate() + 1)
  );

  const results: { start: Date; end: Date }[] = [];
  const dayMs = 24 * 60 * 60 * 1000;
  let current = new Date(baseDateMidnight.getTime());

  while (current.getTime() < untilMidnight.getTime()) {
    const dayOfWeek = current.getUTCDay();
    let include = false;

    if (recurrence.type === "daily") {
      include = true;
    } else if (recurrence.type === "weekly") {
      const days = recurrence.daysOfWeek && recurrence.daysOfWeek.length > 0
        ? recurrence.daysOfWeek
        : [baseStart.getUTCDay()];
      include = days.includes(dayOfWeek);
    }

    if (include) {
      results.push({
        start: new Date(current.getTime() + startOffset),
        end: new Date(current.getTime() + endOffset),
      });
    }

    current = new Date(current.getTime() + dayMs);
  }

  return results;
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;
  if (!session?.user || (role !== "TRAINER" && role !== "ADMIN")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { arenaId, startTime, endTime, recurrence, serviceIds, maxParticipants } = body;

  let profile: any;
  if (role === "ADMIN") {
    // Admin must provide trainerId (TrainerProfile.id)
    if (!body.trainerId) return NextResponse.json({ error: "trainerId required for admin" }, { status: 400 });
    profile = await prisma.trainerProfile.findUnique({ where: { id: body.trainerId } });
    if (!profile) return NextResponse.json({ error: "Trainer not found" }, { status: 404 });
  } else {
    const userId = (session.user as any).id;
    profile = await prisma.trainerProfile.findUnique({ where: { userId } });
    if (!profile || profile.status !== "APPROVED") {
      return NextResponse.json({ error: "Trainer not approved" }, { status: 403 });
    }
  }

  if (!arenaId || !startTime || !endTime) {
    return NextResponse.json({ error: "arenaId, startTime, endTime required" }, { status: 400 });
  }

  // For non-admin trainers, check arena association; admin can create for any arena
  if (role !== "ADMIN") {
    const trainerArena = await prisma.trainerArena.findUnique({
      where: { trainerId_arenaId: { trainerId: profile.id, arenaId } },
    });
    if (!trainerArena) {
      return NextResponse.json({ error: "Trainer not associated with this arena" }, { status: 403 });
    }
  } else {
    // Admin: just verify the arena exists
    const arena = await prisma.arena.findUnique({ where: { id: arenaId } });
    if (!arena) {
      return NextResponse.json({ error: "Arena not found" }, { status: 404 });
    }
  }

  const baseStart = new Date(startTime);
  const baseEnd = new Date(endTime);
  const serviceConnect = Array.isArray(serviceIds) && serviceIds.length > 0
    ? { connect: serviceIds.map((id: string) => ({ id })) }
    : undefined;

  const maxParticipantsValue = maxParticipants ? Number(maxParticipants) : null;

  // Single slot
  if (!recurrence || recurrence.type === "none") {
    const slot = await prisma.availabilitySlot.create({
      data: {
        trainerId: profile.id,
        arenaId,
        startTime: baseStart,
        endTime: baseEnd,
        maxParticipants: maxParticipantsValue,
        ...(serviceConnect ? { services: serviceConnect } : {}),
      },
      include: { services: { select: SERVICE_SELECT } },
    });
    return NextResponse.json(slot, { status: 201 });
  }

  // Recurring
  if (!recurrence.until) {
    return NextResponse.json({ error: "until date required for recurrence" }, { status: 400 });
  }

  const dates = generateDates(baseStart, baseEnd, recurrence as Recurrence);

  if (dates.length > 365) {
    return NextResponse.json(
      { error: "Vienu kartu galima sukurti ne daugiau 365 laiko tarpų" },
      { status: 400 }
    );
  }

  if (dates.length === 0) {
    return NextResponse.json({ error: "Nerasta tinkamų datų" }, { status: 400 });
  }

  // Use individual creates in a transaction so we can attach services
  const slots = await prisma.$transaction(
    dates.map(({ start, end }) =>
      prisma.availabilitySlot.create({
        data: {
          trainerId: profile.id,
          arenaId,
          startTime: start,
          endTime: end,
          maxParticipants: maxParticipantsValue,
          ...(serviceConnect ? { services: serviceConnect } : {}),
        },
      })
    )
  );

  return NextResponse.json({ created: slots.length }, { status: 201 });
}
