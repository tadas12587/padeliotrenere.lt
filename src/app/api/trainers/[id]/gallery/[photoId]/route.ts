import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; photoId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, photoId } = await params;
  const userId = (session.user as any).id;
  const role = (session.user as any).role;

  const trainer = await prisma.trainerProfile.findUnique({ where: { id } });
  if (!trainer) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (trainer.userId !== userId && role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Verify photo belongs to this trainer (IDOR protection)
  const photo = await prisma.trainerPhoto.findUnique({ where: { id: photoId } });
  if (!photo || photo.trainerId !== trainer.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.trainerPhoto.delete({ where: { id: photoId } });

  return NextResponse.json({ ok: true });
}
