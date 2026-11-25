import { ImageResponse } from "next/og";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function OpenGraphImage() {
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
            "linear-gradient(135deg, #09090b 0%, #18181b 55%, #31102f 100%)",
          color: "#fafafa",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            fontSize: 28,
            fontWeight: 700,
            color: "#f472b6",
          }}
        >
          <span>BuildFolio</span>
          <span style={{ color: "#71717a" }}>/</span>
          <span style={{ color: "#e4e4e7", fontWeight: 500 }}>
            Architecture Showcase
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          <div style={{ fontSize: 60, fontWeight: 800, lineHeight: 1.1 }}>
            AI-Generated Engineering Case Study
          </div>
          <div style={{ fontSize: 28, color: "#a1a1aa", maxWidth: "900px" }}>
            System architecture diagrams, verified tech stack, security health,
            and key engineering highlights.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: "16px",
            fontSize: 22,
            color: "#d4d4d8",
          }}
        >
          <span>Mermaid Architecture</span>
          <span>•</span>
          <span>RAG Code Intelligence</span>
          <span>•</span>
          <span>Security Posture</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
