import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const userId = (session.user as any).id;
  const role = (session.user as any).role;

  const slot = await prisma.availabilitySlot.findUnique({ where: { id } });
  if (!slot) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (slot.status === "BOOKED") {
    return NextResponse.json({ error: "Cannot delete booked slot" }, { status: 409 });
  }

  if (role !== "ADMIN") {
    const profile = await prisma.trainerProfile.findUnique({ where: { userId } });
    if (!profile || slot.trainerId !== profile.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  await prisma.availabilitySlot.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
