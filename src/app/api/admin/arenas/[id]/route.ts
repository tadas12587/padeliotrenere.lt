import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const { status, name, city, address, description, photoUrl } = body;

  const arena = await prisma.arena.update({
    where: { id },
    data: {
      ...(status !== undefined && { status }),
      ...(name !== undefined && { name }),
      ...(city !== undefined && { city }),
      ...(address !== undefined && { address }),
      ...(description !== undefined && { description }),
      ...(photoUrl !== undefined && { photoUrl }),
    },
  });

  return NextResponse.json(arena);
}
