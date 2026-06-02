import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const db = prisma as any;

async function checkAdmin() {
  const session = await getServerSession(authOptions);
  return (session?.user as any)?.role === "ADMIN";
}

export async function GET() {
  if (!(await checkAdmin()))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const row = await db.globalSeoSetting.findUnique({ where: { id: "global" } });
  return NextResponse.json(row ?? {});
}

export async function PATCH(req: NextRequest) {
  if (!(await checkAdmin()))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const allowed = [
    "logoUrl", "logoSquare", "logoUrlDark", "logoSquareDark", "faviconUrl",
    "tagline", "phone", "email", "address",
    "instagramUrl", "facebookUrl", "youtubeUrl",
    "heroTitle", "heroSubtitle",
    "maintenanceMode", "maintenanceMsg",
  ];

  const data: Record<string, unknown> = {};
  for (const key of allowed) {
    if (key in body) data[key] = body[key];
  }

  const row = await db.globalSeoSetting.upsert({
    where: { id: "global" },
    create: { id: "global", ...data },
    update: data,
  });

  return NextResponse.json(row);
}
