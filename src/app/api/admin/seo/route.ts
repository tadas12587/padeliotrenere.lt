import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const db = prisma as any;

async function checkAdmin() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;
  if (role !== "ADMIN") return false;
  return true;
}

export async function GET() {
  if (!(await checkAdmin()))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const [global, pages] = await Promise.all([
    db.globalSeoSetting.findUnique({ where: { id: "global" } }),
    db.seoSetting.findMany({ orderBy: { pageSlug: "asc" } }),
  ]);
  return NextResponse.json({ global, pages });
}

export async function PUT(req: NextRequest) {
  if (!(await checkAdmin()))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();

  if (body.type === "global") {
    const record = await db.globalSeoSetting.upsert({
      where: { id: "global" },
      create: { id: "global", ...body.data },
      update: body.data,
    });
    return NextResponse.json(record);
  }

  if (body.type === "page") {
    const { pageSlug, ...data } = body.data;
    const record = await db.seoSetting.upsert({
      where: { pageSlug },
      create: { pageSlug, ...data },
      update: data,
    });
    return NextResponse.json(record);
  }

  return NextResponse.json({ error: "Invalid type" }, { status: 400 });
}
