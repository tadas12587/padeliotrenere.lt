import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const city = searchParams.get("city");

  const arenas = await prisma.arena.findMany({
    where: {
      status: "APPROVED",
      ...(city ? { city: { contains: city } } : {}),
    },
    include: {
      trainers: {
        include: { trainer: { select: { id: true, displayName: true, photoUrl: true, city: true } } },
        where: { trainer: { status: "APPROVED" } },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(arenas);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;
  if (!session?.user || !["TRAINER", "ADMIN"].includes(role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as any).id;
  const body = await req.json();
  const { name, city, address, description, photoUrl } = body;

  if (!name || !city || !address) {
    return NextResponse.json({ error: "name, city, address required" }, { status: 400 });
  }

  const arena = await prisma.arena.create({
    data: {
      name, city, address, description, photoUrl,
      createdById: userId,
      status: role === "ADMIN" ? "APPROVED" : "PENDING",
    },
  });

  return NextResponse.json(arena, { status: 201 });
}
