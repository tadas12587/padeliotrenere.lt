import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Prisijunkite pirmiau" }, { status: 401 });

  const userId = (session.user as any).id;
  const role = (session.user as any).role;

  if (role !== "CLIENT") {
    return NextResponse.json({ error: "Jau esate treneris arba administratorius" }, { status: 409 });
  }

  const body = await req.json();
  const { displayName, city, phone, bio, sportIds = [] }: { displayName: string; city: string; phone?: string; bio?: string; sportIds: string[] } = body;

  if (!displayName || !city) {
    return NextResponse.json({ error: "Vardas ir miestas privalomi" }, { status: 400 });
  }

  const existing = await prisma.trainerProfile.findUnique({ where: { userId } });
  if (existing) return NextResponse.json({ error: "Profilis jau egzistuoja" }, { status: 409 });

  const [, trainerProfile] = await prisma.$transaction([
    prisma.user.update({ where: { id: userId }, data: { role: "TRAINER" } }),
    prisma.trainerProfile.create({
      data: { userId, displayName, city, phone, bio, status: "PENDING" },
    }),
  ]);

  if (sportIds.length > 0) {
    await prisma.trainerSport.createMany({
      data: sportIds.map((sportId: string) => ({ trainerId: trainerProfile.id, sportId })),
    });
  }

  // Notify admin
  if (process.env.ADMIN_EMAIL && process.env.RESEND_API_KEY) {
    await resend.emails.send({
      from: process.env.EMAIL_FROM ?? "noreply@padeliotrenere.lt",
      to: process.env.ADMIN_EMAIL,
      subject: `Naujas treneris laukia patvirtinimo: ${displayName}`,
      html: `<p>Treneris <strong>${displayName}</strong> iš <strong>${city}</strong> užsiregistravo ir laukia patvirtinimo.</p><p><a href="${process.env.NEXTAUTH_URL}/admin/trainers">Peržiūrėti administravimo panelėje</a></p>`,
    }).catch(() => {});
  }

  return NextResponse.json({ success: true }, { status: 201 });
}
