import { ImageResponse } from "next/og";
import { prisma } from "@/lib/prisma";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const dynamic = "force-dynamic";

export default async function Image({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const arena = await prisma.arena.findUnique({
    where: { id },
    select: { name: true, city: true, address: true, photoUrl: true },
  });

  const name = arena?.name ?? "Sporto arena";
  const city = arena?.city ?? "";
  const address = arena?.address ?? "";
  const photoUrl = arena?.photoUrl;

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
        {/* Background: photo or solid color */}
        {photoUrl ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photoUrl}
              alt={name}
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
            {/* Dark overlay */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(135deg, rgba(11,92,113,0.92) 0%, rgba(5,50,65,0.85) 100%)",
                display: "flex",
              }}
            />
          </>
        ) : (
          <>
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "#0B5C71",
                display: "flex",
              }}
            />
            {/* Decorative */}
            <div
              style={{
                position: "absolute",
                right: -80,
                top: -80,
                width: 400,
                height: 400,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.05)",
                display: "flex",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: -60,
                bottom: -100,
                width: 300,
                height: 300,
                borderRadius: "50%",
                background: "rgba(255,87,51,0.1)",
                display: "flex",
              }}
            />
          </>
        )}

        {/* Content */}
        <div
          style={{
            position: "relative",
            zIndex: 10,
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
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
              marginBottom: 24,
              display: "flex",
              width: "fit-content",
            }}
          >
            🏟️ Sporto arena
          </div>

          {/* Arena name */}
          <div
            style={{
              fontSize: name.length > 25 ? 52 : 64,
              fontWeight: 900,
              color: "white",
              lineHeight: 1.1,
              marginBottom: 16,
              display: "flex",
            }}
          >
            {name}
          </div>

          {/* Location */}
          <div
            style={{
              fontSize: 26,
              color: "rgba(255,255,255,0.7)",
              marginBottom: 32,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            📍 {[address, city].filter(Boolean).join(", ")}
          </div>

          {/* CTA */}
          <div
            style={{
              background: "rgba(255,255,255,0.12)",
              border: "2px solid rgba(255,255,255,0.25)",
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

        {/* Bottom branding */}
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
