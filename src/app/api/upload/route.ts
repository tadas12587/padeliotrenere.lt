import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { randomBytes } from "node:crypto";
import path from "node:path";
import fs from "node:fs/promises";
import sharp from "sharp";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const VALID_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/bmp",
  "image/tiff",
  "image/heic",
  "image/heif",
];

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const file = formData.get("file") as File | null;
  const type = formData.get("type") as string | null;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  if (!VALID_MIME_TYPES.includes(file.type)) {
    return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: "File too large (max 10MB)" }, { status: 400 });
  }

  const uploadType = type || "gallery";

  let width: number;
  let height: number;
  let quality: number;

  switch (uploadType) {
    case "profile":
      width = 450;
      height = 600;
      quality = 82;
      break;
    case "logo":
      width = 400;
      height = 400;
      quality = 85;
      break;
    case "banner":
      width = 1200;
      height = 900;
      quality = 82;
      break;
    case "gallery":
    default:
      width = 1200;
      height = 1000;
      quality = 80;
      break;
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const filename = `${Date.now()}-${randomBytes(8).toString("hex")}.webp`;

  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  await fs.mkdir(uploadsDir, { recursive: true });

  const outputBuffer = await sharp(buffer)
    .resize(width, height, { fit: "inside", withoutEnlargement: true })
    .webp({ quality })
    .toBuffer();

  await fs.writeFile(path.join(uploadsDir, filename), outputBuffer);

  return NextResponse.json({ url: "/uploads/" + filename });
}
