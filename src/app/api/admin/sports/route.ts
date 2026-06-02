import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sports = await prisma.sport.findMany({
    orderBy: { name: "asc" },
  });

  return NextResponse.json(sports);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { name, slug, icon, iconUrl } = body;

  if (!name || !slug) {
    return NextResponse.json(
      { error: "Privalomi laukai: pavadinimas, slug" },
      { status: 400 }
    );
  }

  try {
    const sport = await prisma.sport.create({
      data: {
        name,
        slug,
        icon: icon ?? null,
        iconUrl: iconUrl ?? null,
      },
    });
    return NextResponse.json(sport, { status: 201 });
  } catch (err: any) {
    if (err?.code === "P2002") {
      return NextResponse.json(
        { error: "Toks sportas jau egzistuoja" },
        { status: 400 }
      );
    }
    throw err;
  }
}
