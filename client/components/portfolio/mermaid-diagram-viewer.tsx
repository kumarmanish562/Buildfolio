"use client";

import { useEffect, useRef, useState } from "react";
import mermaid from "mermaid";
import { Download, RefreshCw, ZoomIn, ZoomOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export function MermaidDiagramViewer({
  chart,
  title = "Architecture Diagram",
}: {
  chart: string;
  title?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svgContent, setSvgContent] = useState<string>("");
  const [zoom, setZoom] = useState<number>(1);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: "neutral",
      securityLevel: "loose",
      fontFamily: "monospace",
    });

    const renderChart = async () => {
      if (!chart || chart.trim() === "") return;
      try {
        const id = "mermaid-svg-" + Math.random().toString(36).substring(2, 9);
        const { svg } = await mermaid.render(id, chart);
        setSvgContent(svg);
        setError(null);
      } catch (err) {
        console.warn("Failed to render Mermaid SVG", err);
        setError("Unable to render architecture diagram visually. Showing raw format below.");
      }
    };

    renderChart();
  }, [chart]);

  const handleDownloadSvg = () => {
    if (!svgContent) return;
    const blob = new Blob([svgContent], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${title.toLowerCase().replace(/\s+/g, "-")}.svg`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Visual Architecture Flow
        </span>

        {svgContent && !error && (
          <div className="flex items-center gap-1.5">
            <Button
              variant="ghost"
              size="sm"
              className="size-8 p-0"
              onClick={() => setZoom((z) => Math.max(0.6, z - 0.15))}
              title="Zoom Out"
            >
              <ZoomOut className="size-4" />
            </Button>
            <span className="font-mono text-xs text-muted-foreground">
              {Math.round(zoom * 100)}%
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="size-8 p-0"
              onClick={() => setZoom((z) => Math.min(2.0, z + 0.15))}
              title="Zoom In"
            >
              <ZoomIn className="size-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs ml-2"
              onClick={handleDownloadSvg}
            >
              <Download className="size-3.5" />
              Export SVG
            </Button>
          </div>
        )}
      </div>

      {!error && svgContent ? (
        <div className="overflow-auto rounded-2xl border bg-card/60 p-6 shadow-inner backdrop-blur-sm">
          <div
            ref={containerRef}
            style={{ transform: `scale(${zoom})`, transformOrigin: "top left" }}
            className="transition-transform duration-150 flex justify-center min-w-fit"
            dangerouslySetInnerHTML={{ __html: svgContent }}
          />
        </div>
      ) : (
        <pre className="overflow-x-auto rounded-xl bg-muted/70 p-4 font-mono text-xs leading-5 text-foreground">
          <code>{chart}</code>
        </pre>
      )}
    </div>
  );
}
