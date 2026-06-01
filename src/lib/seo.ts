import { prisma } from "./prisma";

// New models (SeoSetting, GlobalSeoSetting) are added in schema but prisma generate
// runs at build time — cast to any until then.
const db = prisma as any;

export async function getPageSeo(slug: string) {
  return db.seoSetting.findUnique({ where: { pageSlug: slug } });
}

export async function getGlobalSeo() {
  return db.globalSeoSetting.findUnique({ where: { id: "global" } });
}

export function buildMetadata({
  title,
  description,
  ogImageUrl,
  keywords,
  path,
  global,
}: {
  title?: string | null;
  description?: string | null;
  ogImageUrl?: string | null;
  keywords?: string | null;
  path?: string;
  global?: {
    siteName?: string;
    siteUrl?: string | null;
    defaultOgImage?: string | null;
    twitterHandle?: string | null;
  } | null;
}) {
  const siteUrl =
    global?.siteUrl ||
    process.env.NEXT_PUBLIC_APP_URL ||
    "https://padeliotrenere.lt";
  const canonicalUrl = path ? `${siteUrl}${path}` : siteUrl;
  const ogImage =
    ogImageUrl || global?.defaultOgImage || `${siteUrl}/og-default.jpg`;
  const siteName = global?.siteName || "Padėlio Treneris";

  return {
    ...(title ? { title } : {}),
    ...(description ? { description } : {}),
    ...(keywords
      ? { keywords: keywords.split(",").map((k) => k.trim()) }
      : {}),
    alternates: { canonical: canonicalUrl },
    openGraph: {
      ...(title ? { title } : {}),
      ...(description ? { description } : {}),
      url: canonicalUrl,
      siteName,
      locale: "lt_LT",
      type: "website" as const,
      images: [{ url: ogImage, width: 1200, height: 630, alt: title || siteName }],
    },
    twitter: {
      card: "summary_large_image" as const,
      ...(title ? { title } : {}),
      ...(description ? { description } : {}),
      images: [ogImage],
      ...(global?.twitterHandle ? { site: global.twitterHandle } : {}),
    },
  };
}
