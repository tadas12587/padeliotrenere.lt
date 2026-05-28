import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { sendBookingCancellation } from "@/lib/email";
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

const updateBookingSchema = z.object({
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
  const booking = await prisma.booking.findUnique({
    where: { id },
    include: { user: true, slot: true },
  });

  if (!booking) return NextResponse.json({ error: "Rezervacija nerasta" }, { status: 404 });

  if (user.role !== "ADMIN" && booking.userId !== user.id)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const parsed = updateBookingSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const updated = await prisma.booking.update({
    where: { id },
    data: parsed.data,
    include: { slot: true, user: true },
  });

  if (parsed.data.status === "CANCELLED" && updated.user.email && updated.slot) {
    sendBookingCancellation({
      to: updated.user.email,
      name: updated.user.name || "Klientas",
      date: formatDateLT(updated.slot.date),
      startTime: updated.slot.startTime,
    }).catch(console.error);
  }

  return NextResponse.json(updated);
}
