import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/availability/[id]/bookings
// Returns all CONFIRMED/PENDING bookings for a slot (trainer/admin only)
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = session.user as any;
  const { id } = await params;

  // Only trainers and admins may access
  if (user.role !== "TRAINER" && user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Trainers may only see bookings for their own slots
  if (user.role === "TRAINER") {
    const profile = await prisma.trainerProfile.findUnique({ where: { userId: user.id } });
    if (!profile) return NextResponse.json({ error: "Trainer profile not found" }, { status: 404 });
    const slot = await prisma.availabilitySlot.findUnique({ where: { id } });
    if (!slot) return NextResponse.json({ error: "Slot not found" }, { status: 404 });
    if (slot.trainerId !== profile.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  const bookings = await prisma.booking.findMany({
    where: {
      availabilitySlotId: id,
      status: { in: ["PENDING", "CONFIRMED"] },
    },
    select: {
      id: true,
      status: true,
      createdAt: true,
      user: { select: { id: true, name: true, email: true } },
      service: { select: { name: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(bookings);
}

// DELETE /api/availability/[id]/bookings  body: { bookingId }
// Cancel a specific booking and revert slot status if needed (trainer/admin only)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = session.user as any;
  const { id } = await params;

  if (user.role !== "TRAINER" && user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const { bookingId } = body;
  if (!bookingId) {
    return NextResponse.json({ error: "bookingId required" }, { status: 400 });
  }

  // Trainers may only manage their own slots
  if (user.role === "TRAINER") {
    const profile = await prisma.trainerProfile.findUnique({ where: { userId: user.id } });
    if (!profile) return NextResponse.json({ error: "Trainer profile not found" }, { status: 404 });
    const slot = await prisma.availabilitySlot.findUnique({ where: { id } });
    if (!slot) return NextResponse.json({ error: "Slot not found" }, { status: 404 });
    if (slot.trainerId !== profile.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { availabilitySlot: true },
  });

  if (!booking) return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  if (booking.availabilitySlotId !== id) {
    return NextResponse.json({ error: "Booking does not belong to this slot" }, { status: 400 });
  }

  // Cancel the booking
  await prisma.booking.update({
    where: { id: bookingId },
    data: { status: "CANCELLED" },
  });

  // Revert slot status if needed
  if (booking.availabilitySlot) {
    const avSlot = booking.availabilitySlot;
    if (avSlot.maxParticipants && avSlot.maxParticipants > 0) {
      // GROUP slot: re-count remaining active bookings
      const remaining = await prisma.booking.count({
        where: {
          availabilitySlotId: avSlot.id,
          status: { in: ["PENDING", "CONFIRMED"] },
        },
      });
      if (remaining < avSlot.maxParticipants) {
        await prisma.availabilitySlot.update({
          where: { id: avSlot.id },
          data: { status: "AVAILABLE" },
        });
      }
    } else {
      // INDIVIDUAL slot: revert to AVAILABLE and clear bookingId
      await prisma.availabilitySlot.update({
        where: { id: avSlot.id },
        data: { status: "AVAILABLE", bookingId: null },
      });
    }
  }

  return NextResponse.json({ success: true });
}
