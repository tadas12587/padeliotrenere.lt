import { NextResponse } from "next/server";
import { getSiteSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export async function GET() {
  const { faviconUrl } = await getSiteSettings();
  if (faviconUrl) {
    return NextResponse.redirect(faviconUrl, { status: 302 });
  }
  return NextResponse.redirect(
    new URL("/icons/icon-192x192.png", process.env.NEXT_PUBLIC_APP_URL || "https://padeliotrenere.lt"),
    { status: 302 }
  );
}
