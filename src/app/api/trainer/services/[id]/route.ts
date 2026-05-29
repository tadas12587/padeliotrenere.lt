import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== "TRAINER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as any).id;
  const profile = await prisma.trainerProfile.findUnique({ where: { userId } });
  if (!profile) {
    return NextResponse.json({ error: "Trainer profile not found" }, { status: 404 });
  }

  const { id } = await params;
  const existing = await prisma.service.findUnique({ where: { id } });
  if (!existing || existing.trainerId !== profile.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await req.json();
  const { name, description, durationMinutes, price, templateId, type, maxParticipants, priceType } = body;

  const updateData: any = {};
  if (name !== undefined) updateData.name = name;
  if (description !== undefined) updateData.description = description ?? null;
  if (templateId !== undefined) updateData.templateId = templateId || null;
  if (durationMinutes !== undefined) {
    const durationNum = Number(durationMinutes);
    if (!Number.isInteger(durationNum) || durationNum < 15) {
      return NextResponse.json({ error: "durationMinutes must be an integer >= 15" }, { status: 400 });
    }
    updateData.durationMinutes = durationNum;
  }
  if (price !== undefined) updateData.price = price != null && price !== "" ? price : null;
  if (type !== undefined) {
    const serviceType = type === "GROUP" ? "GROUP" : "INDIVIDUAL";
    updateData.type = serviceType;
    updateData.maxParticipants = serviceType === "GROUP" && maxParticipants ? Number(maxParticipants) : null;
    updateData.priceType = serviceType === "GROUP" ? (priceType === "PER_PERSON" ? "PER_PERSON" : "TOTAL") : null;
  }

  const service = await prisma.service.update({
    where: { id },
    data: updateData,
  });

  return NextResponse.json(service);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== "TRAINER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as any).id;
  const profile = await prisma.trainerProfile.findUnique({ where: { userId } });
  if (!profile) {
    return NextResponse.json({ error: "Trainer profile not found" }, { status: 404 });
  }

  const { id } = await params;
  const existing = await prisma.service.findUnique({ where: { id } });
  if (!existing || existing.trainerId !== profile.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.service.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
