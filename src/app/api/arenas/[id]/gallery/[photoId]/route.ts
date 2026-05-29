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

  const arena = await prisma.arena.findUnique({ where: { id } });
  if (!arena) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (role !== "ADMIN" && arena.createdById !== userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.arenaPhoto.delete({ where: { id: photoId } });

  return NextResponse.json({ ok: true });
}
