import { ImageResponse } from "next/og";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default async function OpenGraphImage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px",
          background:
            "linear-gradient(135deg, #09090b 0%, #14172b 60%, #1e1b4b 100%)",
          color: "#fafafa",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "14px",
            fontSize: 28,
            fontWeight: 700,
            color: "#818cf8",
          }}
        >
          <span>BuildFolio</span>
          <span style={{ color: "#71717a" }}>•</span>
          <span style={{ color: "#e4e4e7", fontWeight: 500 }}>
            Developer Profile Hub
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          <div style={{ fontSize: 64, fontWeight: 800, lineHeight: 1.1 }}>
            @{username}
          </div>
          <div style={{ fontSize: 28, color: "#a1a1aa", maxWidth: "900px" }}>
            Verified public repositories, aggregated tech stack, security health
            score, and interactive architecture showcases.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: "16px",
            fontSize: 22,
            color: "#c7d2fe",
          }}
        >
          <span>Public Portfolios</span>
          <span>•</span>
          <span>Tech Stack Cloud</span>
          <span>•</span>
          <span>Security Health</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
