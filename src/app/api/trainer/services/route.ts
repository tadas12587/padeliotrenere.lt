import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== "TRAINER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as any).id;
  const profile = await prisma.trainerProfile.findUnique({ where: { userId } });
  if (!profile) {
    return NextResponse.json({ error: "Trainer profile not found" }, { status: 404 });
  }

  const services = await prisma.service.findMany({
    where: { trainerId: profile.id },
    orderBy: { name: "asc" },
  });

  return NextResponse.json(services);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== "TRAINER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as any).id;
  const profile = await prisma.trainerProfile.findUnique({ where: { userId } });
  if (!profile) {
    return NextResponse.json({ error: "Trainer profile not found" }, { status: 404 });
  }

  const body = await req.json();
  const { name, description, durationMinutes, price, templateId, type, maxParticipants, priceType } = body;

  if (!name || !durationMinutes) {
    return NextResponse.json({ error: "name and durationMinutes are required" }, { status: 400 });
  }

  const durationNum = Number(durationMinutes);
  if (!Number.isInteger(durationNum) || durationNum < 15) {
    return NextResponse.json({ error: "durationMinutes must be an integer >= 15" }, { status: 400 });
  }

  const serviceType = type === "GROUP" ? "GROUP" : "INDIVIDUAL";

  const service = await prisma.service.create({
    data: {
      trainerId: profile.id,
      templateId: templateId || null,
      name,
      description: description ?? null,
      durationMinutes: durationNum,
      price: price != null && price !== "" ? price : null,
      type: serviceType,
      maxParticipants: serviceType === "GROUP" && maxParticipants ? Number(maxParticipants) : null,
      priceType: serviceType === "GROUP" ? (priceType === "PER_PERSON" ? "PER_PERSON" : "TOTAL") : null,
    },
  });

  return NextResponse.json(service, { status: 201 });
}
