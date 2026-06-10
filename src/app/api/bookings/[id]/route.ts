import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { sendBookingCancellation, sendCancellationNew } from "@/lib/email";
import { formatDateLT } from "@/lib/utils";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = session.user as any;
  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, name: true, email: true, phone: true } },
      slot: true,
      sessionNote: true,
    },
  });

  if (!booking) return NextResponse.json({ error: "Rezervacija nerasta" }, { status: 404 });
  if (user.role !== "ADMIN" && booking.userId !== user.id)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  return NextResponse.json(booking);
}

// Clients may only cancel; admins may set any status
const clientUpdateSchema = z.object({
  status: z.literal("CANCELLED").optional(),
  clientNotes: z.string().max(500).optional(),
});

const adminUpdateSchema = z.object({
  status: z.enum(["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED"]).optional(),
  clientNotes: z.string().max(500).optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = session.user as any;
  const isAdmin = user.role === "ADMIN";

  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      user: true,
      slot: true,
      availabilitySlot: {
        include: {
          trainer: { include: { user: { select: { email: true, name: true } } } },
          arena: { select: { name: true } },
        },
      },
    },
  });

  if (!booking) return NextResponse.json({ error: "Rezervacija nerasta" }, { status: 404 });
  if (!isAdmin && booking.userId !== user.id)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const schema = isAdmin ? adminUpdateSchema : clientUpdateSchema;
  const parsed = schema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  // Prevent double-cancel side effects
  const isNewCancellation =
    parsed.data.status === "CANCELLED" && booking.status !== "CANCELLED";

  const updated = await prisma.booking.update({
    where: { id },
    data: parsed.data,
    include: { slot: true, user: true, availabilitySlot: true },
  });

  if (isNewCancellation) {
    // ── Legacy TimeSlot flow ──────────────────────────────────────────────────
    if (updated.user.email && updated.slot) {
      sendBookingCancellation({
        to: updated.user.email,
        name: updated.user.name || "Klientas",
        date: formatDateLT(updated.slot.date),
        startTime: updated.slot.startTime,
      }).catch(console.error);
    }

    // ── AvailabilitySlot flow ─────────────────────────────────────────────────
    if (updated.availabilitySlotId && updated.availabilitySlot) {
      const avSlot = updated.availabilitySlot as any;
      const isGroup = avSlot.maxParticipants && avSlot.maxParticipants > 0;

      if (isGroup) {
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
        // INDIVIDUAL: only revert if this booking still owns the slot
        if (avSlot.bookingId === id) {
          await prisma.availabilitySlot.update({
            where: { id: avSlot.id },
            data: { status: "AVAILABLE", bookingId: null },
          });
        }
      }

      // Send cancellation emails to both client and trainer
      const trainerUser = avSlot.trainer?.user;
      if (updated.user.email && trainerUser?.email) {
        const cancelledBy = isAdmin ? "admin" : "client";
        sendCancellationNew({
          clientEmail: updated.user.email,
          clientName: updated.user.name || "Klientas",
          trainerEmail: trainerUser.email,
          trainerName: avSlot.trainer.displayName,
          arenaName: avSlot.arena?.name || "",
          startTime: avSlot.startTime,
          endTime: avSlot.endTime,
          cancelledBy,
        }).catch(console.error);
      }
    }
  }

  return NextResponse.json(updated);
}
