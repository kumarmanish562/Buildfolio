import { ImageResponse } from "next/og";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function RootOpenGraphImage() {
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
            "linear-gradient(135deg, #09090b 0%, #1c1427 50%, #2e1065 100%)",
          color: "#fafafa",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "14px",
            fontSize: 32,
            fontWeight: 800,
            color: "#c084fc",
          }}
        >
          <span>BuildFolio</span>
          <span style={{ color: "#71717a" }}>—</span>
          <span style={{ color: "#f3e8ff", fontWeight: 600 }}>
            AI Codebase Intelligence & Portfolios
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div style={{ fontSize: 62, fontWeight: 800, lineHeight: 1.1 }}>
            Turn Your GitHub Repositories Into Interactive AI Portfolios
          </div>
          <div style={{ fontSize: 26, color: "#cbd5e1", maxWidth: "940px" }}>
            Chat with indexed repositories, generate verified system architecture
            diagrams, audit security vulnerabilities, and showcase developer capabilities.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: "24px",
            fontSize: 22,
            color: "#e2e8f0",
          }}
        >
          <span>Repository RAG</span>
          <span>•</span>
          <span>Mermaid Architecture</span>
          <span>•</span>
          <span>Security Audit</span>
          <span>•</span>
          <span>Developer Profile Hub</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
