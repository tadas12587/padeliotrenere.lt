import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params; // id = TrainerProfile.id

  const services = await prisma.service.findMany({
    where: { trainerId: id },
    orderBy: { name: "asc" },
  });

  return NextResponse.json(services);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params; // id = TrainerProfile.id

  const trainerProfile = await prisma.trainerProfile.findUnique({ where: { id } });
  if (!trainerProfile) {
    return NextResponse.json({ error: "Trainer not found" }, { status: 404 });
  }

  const body = await req.json();
  const { name, description, durationMinutes, price } = body;

  if (!name || !durationMinutes) {
    return NextResponse.json({ error: "name and durationMinutes are required" }, { status: 400 });
  }

  const durationNum = Number(durationMinutes);
  if (!Number.isInteger(durationNum) || durationNum < 15) {
    return NextResponse.json({ error: "durationMinutes must be an integer >= 15" }, { status: 400 });
  }

  const service = await prisma.service.create({
    data: {
      trainerId: id,
      name,
      description: description ?? null,
      durationMinutes: durationNum,
      price: price != null && price !== "" ? price : null,
    },
  });

  return NextResponse.json(service, { status: 201 });
}
