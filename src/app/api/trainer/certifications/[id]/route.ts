import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== "TRAINER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const userId = (session.user as any).id;

  const profile = await prisma.trainerProfile.findUnique({ where: { userId } });
  if (!profile) {
    return NextResponse.json({ error: "Trainer profile not found" }, { status: 404 });
  }

  const cert = await prisma.certification.findUnique({ where: { id } });
  if (!cert) {
    return NextResponse.json({ error: "Certification not found" }, { status: 404 });
  }

  if (cert.trainerId !== profile.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.certification.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
