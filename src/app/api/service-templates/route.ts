import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const sportIds = searchParams.get("sportIds");

  const where = sportIds
    ? { sportId: { in: sportIds.split(",").filter(Boolean) } }
    : {};

  const templates = await prisma.serviceTemplate.findMany({
    where,
    include: { sport: { select: { id: true, name: true, icon: true, iconUrl: true } } },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(templates);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name, description, sportId } = await req.json();
  if (!name?.trim()) {
    return NextResponse.json({ error: "name required" }, { status: 400 });
  }

  const template = await prisma.serviceTemplate.create({
    data: { name: name.trim(), description: description || null, sportId: sportId || null },
    include: { sport: { select: { id: true, name: true, icon: true, iconUrl: true } } },
  });

  return NextResponse.json(template, { status: 201 });
}
