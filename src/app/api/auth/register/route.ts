import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const { name, email, password } = await req.json();

  if (!name || !email || !password) {
    return NextResponse.json({ error: "Visi laukai privalomi" }, { status: 400 });
  }

  if (password.length < 8) {
    return NextResponse.json(
      { error: "Slaptažodis turi būti bent 8 simbolių" },
      { status: 400 }
    );
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json(
      { error: "Vartotojas su šiuo el. paštu jau egzistuoja" },
      { status: 400 }
    );
  }

  const hashed = await bcrypt.hash(password, 12);

  await prisma.user.create({
    data: { name, email, password: hashed },
  });

  return NextResponse.json({ ok: true }, { status: 201 });
}
