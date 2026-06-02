import { NextResponse } from "next/server";
import { getSiteSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export async function GET() {
  const { faviconUrl } = await getSiteSettings();

  const targetUrl = faviconUrl || null;

  if (targetUrl) {
    try {
      const upstream = await fetch(targetUrl, { cache: "no-store" });
      const bytes = await upstream.arrayBuffer();
      const mime = upstream.headers.get("content-type") || "image/png";
      return new NextResponse(bytes, {
        headers: {
          "Content-Type": mime,
          "Cache-Control": "no-cache, no-store, must-revalidate",
          "Pragma": "no-cache",
        },
      });
    } catch {
      // fall through to default
    }
  }

  // No favicon set — redirect to default icon
  return NextResponse.redirect(
    new URL(
      "/icons/icon-192x192.png",
      process.env.NEXT_PUBLIC_APP_URL || "https://padeliotrenere.lt"
    ),
    { status: 302 }
  );
}
