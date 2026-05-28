import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const trainerId = searchParams.get("trainerId");
  if (!trainerId) return NextResponse.json({ error: "trainerId required" }, { status: 400 });

  const reviews = await prisma.review.findMany({
    where: { trainerId },
    include: { author: { select: { name: true, image: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(reviews);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const authorId = (session.user as any).id;
  const body = await req.json();
  const { trainerId, rating, comment } = body;

  if (!trainerId || !rating || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "trainerId and rating (1-5) required" }, { status: 400 });
  }

  const existing = await prisma.review.findFirst({ where: { trainerId, authorId } });
  if (existing) return NextResponse.json({ error: "Already reviewed" }, { status: 409 });

  const review = await prisma.review.create({
    data: { trainerId, authorId, rating, comment },
    include: { author: { select: { name: true, image: true } } },
  });

  return NextResponse.json(review, { status: 201 });
}
