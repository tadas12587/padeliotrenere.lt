import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base =
    process.env.NEXT_PUBLIC_APP_URL || "https://padeliotrenere.lt";
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/api", "/auth", "/trainer", "/client"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
