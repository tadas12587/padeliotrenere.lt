import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const userId = (session.user as any).id;
  const role = (session.user as any).role;

  const trainer = await prisma.trainerProfile.findUnique({ where: { id } });
  if (!trainer) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (trainer.userId !== userId && role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const { url } = body;

  if (!url || typeof url !== "string") {
    return NextResponse.json({ error: "Invalid url" }, { status: 400 });
  }

  const photo = await prisma.trainerPhoto.create({
    data: { trainerId: id, url },
  });

  return NextResponse.json(photo);
}
