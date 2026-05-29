import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { name, city, address, description, photoUrl, sportIds } = body;

  if (!name || !city || !address) {
    return NextResponse.json(
      { error: "Privalomi laukai: pavadinimas, miestas, adresas" },
      { status: 400 }
    );
  }

  const createdById = (session!.user as any).id as string;

  const arena = await prisma.arena.create({
    data: {
      name,
      city,
      address,
      description: description ?? null,
      photoUrl: photoUrl ?? null,
      status: "APPROVED",
      createdById,
      ...(sportIds && sportIds.length > 0
        ? {
            sports: {
              create: (sportIds as string[]).map((sportId) => ({ sportId })),
            },
          }
        : {}),
    },
  });

  return NextResponse.json(arena, { status: 201 });
}
