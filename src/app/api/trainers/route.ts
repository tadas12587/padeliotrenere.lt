import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const city = searchParams.get("city");
  const serviceType = searchParams.get("serviceType");

  const trainers = await prisma.trainerProfile.findMany({
    where: {
      status: "APPROVED",
      ...(city ? { city: { contains: city } } : {}),
      ...(serviceType ? { services: { some: { name: { contains: serviceType } } } } : {}),
    },
    include: {
      user: { select: { name: true, email: true } },
      services: true,
      certifications: true,
      arenas: { include: { arena: true } },
      reviews: { select: { rating: true } },
    },
    orderBy: [{ isFeatured: "desc" }, { createdAt: "asc" }],
  });

  return NextResponse.json(trainers);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== "TRAINER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as any).id;
  const existing = await prisma.trainerProfile.findUnique({ where: { userId } });
  if (existing) {
    return NextResponse.json({ error: "Profile already exists" }, { status: 409 });
  }

  const body = await req.json();
  const { displayName, bio, photoUrl, city, phone } = body;
  if (!displayName || !city) {
    return NextResponse.json({ error: "displayName and city are required" }, { status: 400 });
  }

  const profile = await prisma.trainerProfile.create({
    data: { userId, displayName, bio, photoUrl, city, phone },
  });

  return NextResponse.json(profile, { status: 201 });
}
