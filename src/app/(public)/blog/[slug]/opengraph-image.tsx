import { ImageResponse } from "next/og";
import { prisma } from "@/lib/prisma";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const dynamic = "force-dynamic";

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const article = await prisma.article.findUnique({
    where: { slug },
    select: { title: true, excerpt: true, coverImage: true },
  });

  const title = article?.title ?? "Straipsnis";
  const excerpt = article?.excerpt ?? "";
  const coverImage = article?.coverImage;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background */}
        {coverImage ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={coverImage}
              alt={title}
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(135deg, rgba(11,92,113,0.95) 0%, rgba(5,50,65,0.88) 100%)",
                display: "flex",
              }}
            />
          </>
        ) : (
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "#0B5C71",
              display: "flex",
            }}
          />
        )}

        {/* Content */}
        <div
          style={{
            position: "relative",
            zIndex: 10,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "60px 80px",
            width: "100%",
          }}
        >
          {/* Badge */}
          <div
            style={{
              background: "#FF5733",
              color: "white",
              padding: "6px 16px",
              borderRadius: 100,
              fontSize: 18,
              fontWeight: 700,
              marginBottom: 28,
              display: "flex",
              width: "fit-content",
            }}
          >
            📰 Blog'as
          </div>

          {/* Title */}
          <div
            style={{
              fontSize: title.length > 60 ? 44 : title.length > 40 ? 52 : 60,
              fontWeight: 900,
              color: "white",
              lineHeight: 1.15,
              marginBottom: 20,
              display: "flex",
              maxWidth: 900,
            }}
          >
            {title}
          </div>

          {/* Excerpt */}
          {excerpt && (
            <div
              style={{
                fontSize: 22,
                color: "rgba(255,255,255,0.65)",
                lineHeight: 1.4,
                maxWidth: 800,
                display: "flex",
              }}
            >
              {excerpt.length > 120 ? excerpt.slice(0, 117) + "..." : excerpt}
            </div>
          )}
        </div>

        {/* Branding */}
        <div
          style={{
            position: "absolute",
            bottom: 28,
            right: 80,
            fontSize: 18,
            color: "rgba(255,255,255,0.3)",
            zIndex: 20,
            display: "flex",
          }}
        >
          padeliotrenere.lt
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
