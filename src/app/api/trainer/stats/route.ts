import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function getPeriodRange(period: string): { from: Date; to: Date } {
  const now = new Date();
  switch (period) {
    case "today":
      return {
        from: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
        to: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59),
      };
    case "week": {
      const day = now.getDay() === 0 ? 6 : now.getDay() - 1;
      const from = new Date(now);
      from.setDate(now.getDate() - day);
      from.setHours(0, 0, 0, 0);
      const to = new Date(from);
      to.setDate(from.getDate() + 6);
      to.setHours(23, 59, 59);
      return { from, to };
    }
    case "month":
      return {
        from: new Date(now.getFullYear(), now.getMonth(), 1),
        to: new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59),
      };
    case "lastmonth":
      return {
        from: new Date(now.getFullYear(), now.getMonth() - 1, 1),
        to: new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59),
      };
    case "year":
      return {
        from: new Date(now.getFullYear(), 0, 1),
        to: new Date(now.getFullYear(), 11, 31, 23, 59, 59),
      };
    default: // "all"
      return { from: new Date(0), to: new Date() };
  }
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;
  if (!session?.user || (role !== "TRAINER" && role !== "ADMIN")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as any).id;
  const profile = await prisma.trainerProfile.findUnique({ where: { userId } });
  if (!profile) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { searchParams } = new URL(req.url);
  const period = searchParams.get("period") ?? "month";
  const { from, to } = getPeriodRange(period);

  // Fetch all bookings for this trainer in the period (CONFIRMED + PENDING)
  const bookings = await prisma.booking.findMany({
    where: {
      trainerId: profile.id,
      status: { in: ["CONFIRMED", "PENDING"] },
      createdAt: { gte: from, lte: to },
    },
    include: {
      user: { select: { id: true } },
      service: { select: { name: true, price: true } },
      availabilitySlot: { select: { startTime: true, endTime: true } },
    },
  });

  // Fetch all slots in the period for this trainer
  const slots = await prisma.availabilitySlot.findMany({
    where: {
      trainerId: profile.id,
      startTime: { gte: from, lte: to },
    },
    include: {
      bookings: { select: { id: true } },
    },
  });

  // --- Slots stats ---
  const totalSlots = slots.length;
  const filledSlots = slots.filter((s) => s.bookings.length > 0).length;
  const fillRate = totalSlots > 0 ? Math.round((filledSlots / totalSlots) * 100) : 0;

  // --- Hours stats ---
  let plannedMinutes = 0;
  let workedMinutes = 0;
  for (const s of slots) {
    const duration =
      (new Date(s.endTime).getTime() - new Date(s.startTime).getTime()) / 60000;
    plannedMinutes += duration;
    if (s.bookings.length > 0) workedMinutes += duration;
  }
  const plannedHours = Math.round((plannedMinutes / 60) * 10) / 10;
  const workedHours = Math.round((workedMinutes / 60) * 10) / 10;

  // --- Revenue stats ---
  let totalRevenue = 0;
  for (const b of bookings) {
    if (b.service?.price != null) {
      const p = parseFloat(String(b.service.price));
      if (!isNaN(p)) totalRevenue += p;
    }
  }
  totalRevenue = Math.round(totalRevenue * 100) / 100;
  const perSession =
    bookings.length > 0
      ? Math.round((totalRevenue / bookings.length) * 10) / 10
      : 0;

  // --- Clients stats ---
  const uniqueClientIds = new Set(bookings.map((b) => b.user.id));
  const totalClients = uniqueClientIds.size;

  // New client: ALL bookings with this trainer are within this period
  // Fetch earliest booking per client
  let newClients = 0;
  let returningClients = 0;
  for (const clientId of uniqueClientIds) {
    const earliest = await prisma.booking.findFirst({
      where: {
        trainerId: profile.id,
        userId: clientId,
        status: { in: ["CONFIRMED", "PENDING"] },
      },
      orderBy: { createdAt: "asc" },
      select: { createdAt: true },
    });
    if (earliest && earliest.createdAt >= from) {
      newClients++;
    } else {
      returningClients++;
    }
  }

  // --- Top services ---
  const serviceCountMap = new Map<string, number>();
  for (const b of bookings) {
    if (b.service?.name) {
      const name = b.service.name;
      serviceCountMap.set(name, (serviceCountMap.get(name) ?? 0) + 1);
    }
  }
  const topServices = Array.from(serviceCountMap.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // --- Peak days ---
  const dayLabels = ["Sek", "Pirm", "Antr", "Treč", "Ketv", "Penkt", "Šešt"];
  const dayCounts: number[] = [0, 0, 0, 0, 0, 0, 0];
  for (const b of bookings) {
    if (b.availabilitySlot?.startTime) {
      const dow = new Date(b.availabilitySlot.startTime).getDay();
      dayCounts[dow]++;
    }
  }
  // Reorder Mon–Sun (1..6, 0)
  const peakDays = [1, 2, 3, 4, 5, 6, 0].map((d) => ({
    day: d,
    label: dayLabels[d],
    count: dayCounts[d],
  }));

  return NextResponse.json({
    slots: { total: totalSlots, filled: filledSlots, fillRate },
    hours: { planned: plannedHours, worked: workedHours },
    revenue: { total: totalRevenue, perSession },
    clients: { total: totalClients, new: newClients, returning: returningClients },
    topServices,
    peakDays,
  });
}
