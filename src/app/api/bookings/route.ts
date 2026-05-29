import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { sendBookingConfirmation } from "@/lib/email";
import { formatDateLT } from "@/lib/utils";

// GET /api/bookings – auth required
// Admin: all bookings | Client: own bookings
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = session.user as any;
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");

  const where: any =
    user.role === "ADMIN"
      ? status ? { status } : {}
      : { userId: user.id };

  const bookings = await prisma.booking.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { id: true, name: true, email: true, phone: true } },
      slot: { select: { id: true, date: true, startTime: true, endTime: true } },
      sessionNote: true,
    },
  });

  return NextResponse.json(bookings);
}

// POST /api/bookings – auth required
const createBookingSchema = z.object({
  slotId: z.string().cuid().optional(),
  clientNotes: z.string().max(500).optional(),
  availabilitySlotId: z.string().cuid().optional(),
  trainerId: z.string().cuid().optional(),
  arenaId: z.string().cuid().optional(),
  serviceId: z.string().cuid().optional(),
  targetUserId: z.string().cuid().optional(),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = session.user as any;
  const body = await req.json();
  const parsed = createBookingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { slotId, clientNotes, availabilitySlotId, trainerId, arenaId, serviceId, targetUserId } = parsed.data;

  // Determine effective userId for the booking
  let effectiveUserId = user.id;
  if (targetUserId && (user.role === "ADMIN" || user.role === "TRAINER")) {
    effectiveUserId = targetUserId;
  }

  // ── AvailabilitySlot flow (multi-trainer) ──────────────────────────────────
  if (availabilitySlotId) {
    const availSlot = await prisma.availabilitySlot.findUnique({
      where: { id: availabilitySlotId },
      include: { arena: true, trainer: { include: { user: true } } },
    });

    if (!availSlot) {
      return NextResponse.json({ error: "Laikas nerastas" }, { status: 404 });
    }

    if (availSlot.status !== "AVAILABLE") {
      return NextResponse.json({ error: "Šis laikas jau užimtas" }, { status: 409 });
    }

    // Trainer can only book for others on their own slots
    if (targetUserId && user.role === "TRAINER") {
      const profile = await prisma.trainerProfile.findUnique({ where: { userId: user.id } });
      if (!profile || availSlot.trainerId !== profile.id) {
        return NextResponse.json({ error: "Galite rezervuoti tik savo laiko tarpus" }, { status: 403 });
      }
    }

    const booking = await prisma.$transaction(async (tx) => {
      const newBooking = await tx.booking.create({
        data: {
          userId: effectiveUserId,
          clientNotes,
          status: "CONFIRMED",
          trainerId: availSlot.trainerId,
          arenaId: availSlot.arenaId,
          serviceId: serviceId ?? null,
        },
        include: {
          user: true,
        },
      });

      await tx.availabilitySlot.update({
        where: { id: availabilitySlotId },
        data: { status: "BOOKED", bookingId: newBooking.id },
      });

      return newBooking;
    });

    return NextResponse.json(booking, { status: 201 });
  }

  // ── Legacy TimeSlot flow ───────────────────────────────────────────────────
  if (!slotId) {
    return NextResponse.json({ error: "slotId or availabilitySlotId required" }, { status: 400 });
  }

  // Check slot availability
  const slot = await prisma.timeSlot.findUnique({
    where: { id: slotId },
    include: {
      _count: {
        select: { bookings: { where: { status: { in: ["PENDING", "CONFIRMED"] } } } },
      },
    },
  });

  if (!slot) {
    return NextResponse.json({ error: "Laikas nerastas" }, { status: 404 });
  }

  if (!slot.isAvailable) {
    return NextResponse.json({ error: "Šis laikas nebeprieinamas" }, { status: 409 });
  }

  if (slot._count.bookings >= slot.maxClients) {
    return NextResponse.json({ error: "Šis laikas jau užimtas" }, { status: 409 });
  }

  // Check for duplicate booking
  const existing = await prisma.booking.findFirst({
    where: {
      userId: user.id,
      slotId,
      status: { in: ["PENDING", "CONFIRMED"] },
    },
  });

  if (existing) {
    return NextResponse.json(
      { error: "Jūs jau turite rezervaciją šiuo laiku" },
      { status: 409 }
    );
  }

  const booking = await prisma.booking.create({
    data: {
      userId: user.id,
      slotId,
      clientNotes,
      status: "CONFIRMED",
    },
    include: {
      slot: true,
      user: true,
    },
  });

  // Send confirmation email (async, non-blocking)
  if (booking.user.email && booking.slot) {
    sendBookingConfirmation({
      to: booking.user.email,
      name: booking.user.name || "Klientas",
      date: formatDateLT(booking.slot.date),
      startTime: booking.slot.startTime,
      endTime: booking.slot.endTime,
      bookingId: booking.id,
    }).catch(console.error);
  }

  return NextResponse.json(booking, { status: 201 });
}
