import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const arena = await prisma.arena.findUnique({
    where: { id },
    include: {
      trainers: {
        include: {
          trainer: {
            select: { id: true, displayName: true, photoUrl: true, city: true, services: true },
          },
        },
        where: { trainer: { status: "APPROVED" } },
      },
    },
  });

  if (!arena || arena.status !== "APPROVED") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(arena);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const userId = (session.user as any).id;
  const role = (session.user as any).role;

  const arena = await prisma.arena.findUnique({ where: { id } });
  if (!arena) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (arena.createdById !== userId && role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const { name, city, address, description, photoUrl, status } = body;

  const updated = await prisma.arena.update({
    where: { id },
    data: {
      ...(name !== undefined && { name }),
      ...(city !== undefined && { city }),
      ...(address !== undefined && { address }),
      ...(description !== undefined && { description }),
      ...(photoUrl !== undefined && { photoUrl }),
      ...(role === "ADMIN" && status !== undefined && { status }),
    },
  });

  return NextResponse.json(updated);
}
