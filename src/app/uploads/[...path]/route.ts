import { NextRequest, NextResponse } from "next/server";
import fs from "node:fs/promises";
import nodePath from "node:path";

const MIME: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
  bmp: "image/bmp",
};

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: parts } = await params;

  // Block path traversal
  if (parts.some((p) => p === ".." || p.includes("/"))) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const uploadsDir = nodePath.join(process.cwd(), "public", "uploads");
  const filePath = nodePath.join(uploadsDir, ...parts);

  // Extra safety: ensure resolved path is inside uploads dir
  if (!filePath.startsWith(uploadsDir + nodePath.sep) && filePath !== uploadsDir) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  try {
    const buffer = await fs.readFile(filePath);
    const ext = nodePath.extname(filePath).slice(1).toLowerCase();
    const contentType = MIME[ext] || "application/octet-stream";
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000",
      },
    });
  } catch {
    return new NextResponse("Not Found", { status: 404 });
  }
}
