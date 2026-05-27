import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateSlotSchema = z.object({
  isAvailable: z.boolean().optional(),
  maxClients: z.number().int().min(1).max(10).optional(),
  notes: z.string().optional(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any)?.role !== "ADMIN")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = updateSlotSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const slot = await prisma.timeSlot.update({ where: { id }, data: parsed.data });
  return NextResponse.json(slot);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any)?.role !== "ADMIN")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const bookingsCount = await prisma.booking.count({
    where: { slotId: id, status: { in: ["CONFIRMED", "PENDING"] } },
  });

  if (bookingsCount > 0)
    return NextResponse.json(
      { error: "Negalima ištrinti – yra aktyvių rezervacijų" },
      { status: 409 }
    );

  await prisma.timeSlot.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
