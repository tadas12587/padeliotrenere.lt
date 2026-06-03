import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const authorId = (session.user as any).id;

  const reviews = await prisma.review.findMany({
    where: { authorId },
    select: {
      id: true,
      trainerId: true,
      rating: true,
      comment: true,
      createdAt: true,
    },
  });

  return NextResponse.json(reviews);
}
