import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#0B5C71",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          padding: "80px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Decorative circles */}
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
            right: 60,
            bottom: -120,
            width: 300,
            height: 300,
            borderRadius: "50%",
            background: "rgba(255,87,51,0.15)",
            display: "flex",
          }}
        />

        {/* Badge */}
        <div
          style={{
            background: "#FF5733",
            color: "white",
            padding: "8px 20px",
            borderRadius: 100,
            fontSize: 18,
            fontWeight: 700,
            marginBottom: 32,
            display: "flex",
          }}
        >
          🎾 Padėlio Treneris
        </div>

        {/* Main title */}
        <div
          style={{
            fontSize: 72,
            fontWeight: 900,
            color: "white",
            lineHeight: 1.1,
            marginBottom: 24,
            display: "flex",
            flexDirection: "column",
          }}
        >
          Rezervuokite
          <span style={{ color: "#FF5733" }}>treniruotę</span>
          internetu
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: 26,
            color: "rgba(255,255,255,0.65)",
            marginBottom: 48,
            display: "flex",
          }}
        >
          Rask trenerį · Pasirink laiką · Treniruokis
        </div>

        {/* URL */}
        <div
          style={{
            fontSize: 22,
            color: "rgba(255,255,255,0.4)",
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
