import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// GET /api/slots – public: fetch available slots for a date range
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const where: any = { isAvailable: true };
  if (from) where.date = { gte: new Date(from), ...(to ? { lte: new Date(to) } : {}) };

  const slots = await prisma.timeSlot.findMany({
    where,
    orderBy: [{ date: "asc" }, { startTime: "asc" }],
    include: {
      _count: { select: { bookings: { where: { status: { in: ["PENDING", "CONFIRMED"] } } } } },
    },
  });

  return NextResponse.json(slots);
}

// POST /api/slots – admin only: create a new slot
const createSlotSchema = z.object({
  date: z.string(),
  startTime: z.string(),
  endTime: z.string(),
  maxClients: z.number().int().min(1).max(10).default(1),
  notes: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any)?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = createSlotSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { date, startTime, endTime, maxClients, notes } = parsed.data;

  try {
    const slot = await prisma.timeSlot.create({
      data: {
        date: new Date(date),
        startTime,
        endTime,
        maxClients,
        notes,
      },
    });
    return NextResponse.json(slot, { status: 201 });
  } catch (err: any) {
    if (err.code === "P2002") {
      return NextResponse.json(
        { error: "Šiuo laiku jau yra sukurtas laikas" },
        { status: 409 }
      );
    }
    throw err;
  }
}
