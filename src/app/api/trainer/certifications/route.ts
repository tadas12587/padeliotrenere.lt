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

  const certifications = await prisma.certification.findMany({
    where: { trainerId: profile.id },
    orderBy: { year: "desc" },
  });

  return NextResponse.json(certifications);
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
  const { name, issuedBy, year } = body;

  if (!name || !issuedBy || !year) {
    return NextResponse.json(
      { error: "name, issuedBy, and year are required" },
      { status: 400 }
    );
  }

  const yearNum = Number(year);
  if (!Number.isInteger(yearNum) || yearNum < 1900 || yearNum > new Date().getFullYear() + 1) {
    return NextResponse.json({ error: "Invalid year" }, { status: 400 });
  }

  const cert = await prisma.certification.create({
    data: {
      trainerId: profile.id,
      name,
      issuedBy,
      year: yearNum,
    },
  });

  return NextResponse.json(cert, { status: 201 });
}
