import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const noteSchema = z.object({
  trainerNote: z.string().max(2000).optional(),
  clientNote: z.string().max(1000).optional(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = session.user as any;
  const booking = await prisma.booking.findUnique({ where: { id } });

  if (!booking) return NextResponse.json({ error: "Rezervacija nerasta" }, { status: 404 });
  if (user.role !== "ADMIN" && booking.userId !== user.id)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const parsed = noteSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const data: any = {};
  if (user.role === "ADMIN" && parsed.data.trainerNote !== undefined) {
    data.trainerNote = parsed.data.trainerNote;
  }
  if (parsed.data.clientNote !== undefined) {
    data.clientNote = parsed.data.clientNote;
  }

  const note = await prisma.sessionNote.upsert({
    where: { bookingId: id },
    create: { bookingId: id, ...data },
    update: data,
  });

  return NextResponse.json(note);
}
