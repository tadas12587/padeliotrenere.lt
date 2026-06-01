import { ImageResponse } from "next/og";
import { prisma } from "@/lib/prisma";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const dynamic = "force-dynamic";

function toHttps(url: string | null | undefined): string | null {
  if (!url) return null;
  const secure = url.replace(/^http:\/\//i, "https://");
  // Only allow https — skip anything still not secure
  return secure.startsWith("https://") ? secure : null;
}

export default async function Image({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const trainer = await prisma.trainerProfile.findUnique({
    where: { id },
    select: { displayName: true, photoUrl: true, city: true, bio: true },
  });

  const name = trainer?.displayName ?? "Treneris";
  const city = trainer?.city ?? "";
  const photoUrl = toHttps(trainer?.photoUrl);

  return new ImageResponse(
    (
      <div
        style={{
          background: "#0B5C71",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          padding: "60px 80px",
          position: "relative",
          overflow: "hidden",
          gap: 60,
        }}
      >
        {/* Background decoration */}
        <div
          style={{
            position: "absolute",
            right: -60,
            top: -60,
            width: 350,
            height: 350,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.04)",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            right: 200,
            bottom: -100,
            width: 250,
            height: 250,
            borderRadius: "50%",
            background: "rgba(255,87,51,0.12)",
            display: "flex",
          }}
        />

        {/* Left: text content */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
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
            🎾 Padelio treneris
          </div>

          {/* Name */}
          <div
            style={{
              fontSize: name.length > 20 ? 52 : 64,
              fontWeight: 900,
              color: "white",
              lineHeight: 1.1,
              marginBottom: 16,
              display: "flex",
            }}
          >
            {name}
          </div>

          {/* City */}
          {city && (
            <div
              style={{
                fontSize: 26,
                color: "rgba(255,255,255,0.6)",
                marginBottom: 40,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              📍 {city}
            </div>
          )}

          {/* CTA */}
          <div
            style={{
              background: "rgba(255,255,255,0.1)",
              border: "2px solid rgba(255,255,255,0.2)",
              color: "white",
              padding: "12px 24px",
              borderRadius: 12,
              fontSize: 20,
              fontWeight: 600,
              display: "flex",
              width: "fit-content",
            }}
          >
            Rezervuoti treniruotę →
          </div>
        </div>

        {/* Right: trainer photo or avatar */}
        <div
          style={{
            width: 280,
            height: 280,
            borderRadius: "50%",
            overflow: "hidden",
            border: "6px solid rgba(255,255,255,0.15)",
            background: "rgba(255,255,255,0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          {photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={photoUrl}
              alt={name}
              width={280}
              height={280}
              style={{ objectFit: "cover", width: "100%", height: "100%" }}
            />
          ) : (
            <div
              style={{
                fontSize: 96,
                fontWeight: 900,
                color: "rgba(255,255,255,0.6)",
                display: "flex",
              }}
            >
              {name[0]}
            </div>
          )}
        </div>

        {/* Bottom branding */}
        <div
          style={{
            position: "absolute",
            bottom: 28,
            left: 80,
            fontSize: 18,
            color: "rgba(255,255,255,0.3)",
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
