"use client";

import { useEffect, useRef, useState } from "react";
import mermaid from "mermaid";
import { useTheme } from "next-themes";
import {
  Check,
  Code2,
  Copy,
  Download,
  Image as ImageIcon,
  Maximize2,
  RotateCcw,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export function MermaidDiagramViewer({
  chart,
  title = "Architecture Diagram",
}: {
  chart: string;
  title?: string;
}) {
  const { theme, resolvedTheme } = useTheme();
  const isDarkPalette =
    resolvedTheme === "dark" ||
    theme === "midnight" ||
    theme === "emerald" ||
    theme === "sunset";
  const mermaidTheme = isDarkPalette ? "dark" : "default";

  const containerRef = useRef<HTMLDivElement>(null);
  const [svgContent, setSvgContent] = useState<string>("");
  const [zoom, setZoom] = useState<number>(1);
  const [modalZoom, setModalZoom] = useState<number>(1.15);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [draftOverride, setDraftOverride] = useState<string | null>(null);
  const draftChart = draftOverride ?? chart;
  const [debouncedChart, setDebouncedChart] = useState<string>(chart);
  const [copiedSource, setCopiedSource] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedChart(draftChart);
    }, 250);
    return () => clearTimeout(timer);
  }, [draftChart]);

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: mermaidTheme,
      securityLevel: "loose",
      fontFamily: "monospace",
    });

    let cancelled = false;

    const renderChart = async () => {
      if (!debouncedChart || debouncedChart.trim() === "") return;
      try {
        const id = "mermaid-svg-" + Math.random().toString(36).substring(2, 9);
        const { svg } = await mermaid.render(id, debouncedChart);
        if (!cancelled) {
          setSvgContent(svg);
          setError(null);
        }
      } catch (err) {
        console.warn("Failed to render Mermaid SVG", err);
        if (!cancelled) {
          setError(
            "Unable to render architecture diagram visually. Check Mermaid syntax or view raw source."
          );
        }
      }
    };

    renderChart();

    return () => {
      cancelled = true;
    };
  }, [debouncedChart, mermaidTheme]);

  useEffect(() => {
    if (!isFullscreen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsFullscreen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFullscreen]);

  const slug = title.toLowerCase().replace(/\s+/g, "-");

  const handleCopySource = () => {
    navigator.clipboard.writeText(draftChart);
    setCopiedSource(true);
    setTimeout(() => setCopiedSource(false), 2000);
  };

  const handleDownloadSvg = () => {
    if (!svgContent) return;
    const blob = new Blob([svgContent], {
      type: "image/svg+xml;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${slug}.svg`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadPng = () => {
    if (!svgContent) return;

    const parser = new DOMParser();
    const doc = parser.parseFromString(svgContent, "image/svg+xml");
    const svgEl = doc.documentElement;

    let width = 1200;
    let height = 800;

    const viewBox = svgEl.getAttribute("viewBox");
    if (viewBox) {
      const parts = viewBox.split(/[\s,]+/).map(Number);
      if (parts.length === 4 && parts[2] > 0 && parts[3] > 0) {
        width = parts[2];
        height = parts[3];
      }
    } else {
      const wAttr = parseFloat(svgEl.getAttribute("width") || "0");
      const hAttr = parseFloat(svgEl.getAttribute("height") || "0");
      if (wAttr > 0 && hAttr > 0) {
        width = wAttr;
        height = hAttr;
      }
    }

    const scale = 2; // High-DPI 2x rasterization
    const padding = 32;
    const canvas = document.createElement("canvas");
    canvas.width = Math.ceil((width + padding * 2) * scale);
    canvas.height = Math.ceil((height + padding * 2) * scale);

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const svgBlob = new Blob([svgContent], {
      type: "image/svg+xml;charset=utf-8",
    });
    const url = URL.createObjectURL(svgBlob);
    const img = new Image();

    img.onload = () => {
      ctx.fillStyle = mermaidTheme === "dark" ? "#09090b" : "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.scale(scale, scale);
      ctx.drawImage(img, padding, padding, width, height);
      URL.revokeObjectURL(url);

      const pngUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = pngUrl;
      link.download = `${slug}.png`;
      link.click();
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
    };

    img.src = url;
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Visual Architecture Flow
        </span>

        <div className="flex flex-wrap items-center gap-1.5 print:hidden">
          {svgContent && !error && (
            <>
              <Button
                variant="ghost"
                size="sm"
                className="size-8 p-0"
                onClick={() => setZoom((z) => Math.max(0.6, z - 0.15))}
                title="Zoom Out"
                aria-label="Zoom out diagram"
              >
                <ZoomOut className="size-4" aria-hidden="true" />
              </Button>
              <span className="font-mono text-xs text-muted-foreground" aria-live="polite">
                {Math.round(zoom * 100)}%
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="size-8 p-0"
                onClick={() => setZoom((z) => Math.min(2.0, z + 0.15))}
                title="Zoom In"
                aria-label="Zoom in diagram"
              >
                <ZoomIn className="size-4" aria-hidden="true" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="size-8 p-0"
                onClick={() => setIsFullscreen(true)}
                title="Fullscreen View"
                aria-label="Open diagram in fullscreen"
              >
                <Maximize2 className="size-4" aria-hidden="true" />
              </Button>
            </>
          )}

          <Button
            variant={isEditing ? "default" : "outline"}
            size="sm"
            className="gap-1.5 text-xs ml-1"
            onClick={() => setIsEditing((v) => !v)}
            aria-pressed={isEditing}
            aria-label="Toggle live Mermaid editor"
          >
            <Code2 className="size-3.5" aria-hidden="true" />
            {isEditing ? "Close Editor" : "Live Editor"}
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs"
            onClick={handleCopySource}
          >
            {copiedSource ? (
              <>
                <Check className="size-3.5 text-emerald-500" />
                Copied
              </>
            ) : (
              <>
                <Copy className="size-3.5" />
                Copy Mermaid
              </>
            )}
          </Button>

          {svgContent && !error && (
            <>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-xs"
                onClick={handleDownloadSvg}
              >
                <Download className="size-3.5" />
                SVG
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-xs"
                onClick={handleDownloadPng}
              >
                <ImageIcon className="size-3.5" />
                PNG
              </Button>
            </>
          )}
        </div>
      </div>

      {isEditing ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="flex flex-col gap-2 rounded-2xl border bg-muted/40 p-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-medium text-muted-foreground">
                Mermaid Source (Live Preview)
              </span>
              {draftChart !== chart && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 gap-1 px-2 text-xs"
                  onClick={() => setDraftOverride(null)}
                  aria-label="Reset diagram to original source"
                >
                  <RotateCcw className="size-3" aria-hidden="true" />
                  Reset
                </Button>
              )}
            </div>
            <textarea
              value={draftChart}
              onChange={(e) => setDraftOverride(e.target.value)}
              spellCheck={false}
              aria-label="Mermaid diagram source editor"
              className="min-h-[280px] w-full flex-1 resize-y rounded-xl border bg-background p-3 font-mono text-xs leading-5 text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          <div className="overflow-auto rounded-2xl border bg-card/60 p-6 shadow-inner backdrop-blur-sm">
            {!error && svgContent ? (
              <div
                ref={containerRef}
                style={{ transform: `scale(${zoom})`, transformOrigin: "top left" }}
                className="transition-transform duration-150 flex justify-center min-w-fit"
                dangerouslySetInnerHTML={{ __html: svgContent }}
              />
            ) : (
              <p className="text-xs text-destructive">
                {error ?? "Waiting for valid Mermaid syntax..."}
              </p>
            )}
          </div>
        </div>
      ) : !error && svgContent ? (
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
          <code>{draftChart}</code>
        </pre>
      )}

      {/* Fullscreen Architecture Modal */}
      {isFullscreen && svgContent && (
        <div className="fixed inset-0 z-50 flex flex-col bg-background/95 backdrop-blur-md">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b px-6 py-4">
            <div className="flex items-center gap-3">
              <h3 className="text-base font-bold tracking-tight">{title}</h3>
              <span className="rounded-md bg-muted px-2 py-0.5 font-mono text-xs text-muted-foreground">
                {Math.round(modalZoom * 100)}%
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="size-8 p-0"
                onClick={() => setModalZoom((z) => Math.max(0.5, z - 0.2))}
                title="Zoom Out"
              >
                <ZoomOut className="size-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="size-8 p-0"
                onClick={() => setModalZoom((z) => Math.min(2.6, z + 0.2))}
                title="Zoom In"
              >
                <ZoomIn className="size-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-xs"
                onClick={handleCopySource}
              >
                {copiedSource ? (
                  <>
                    <Check className="size-3.5 text-emerald-500" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="size-3.5" />
                    Copy Mermaid
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-xs"
                onClick={handleDownloadSvg}
              >
                <Download className="size-3.5" />
                Export SVG
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-xs"
                onClick={handleDownloadPng}
              >
                <ImageIcon className="size-3.5" />
                Export PNG
              </Button>
              <Button
                variant="secondary"
                size="sm"
                className="gap-1.5 text-xs ml-2"
                onClick={() => setIsFullscreen(false)}
              >
                <X className="size-4" />
                Close
              </Button>
            </div>
          </div>

          <div className="flex-1 overflow-auto p-8">
            <div
              style={{
                transform: `scale(${modalZoom})`,
                transformOrigin: "top center",
              }}
              className="mx-auto flex min-w-fit justify-center transition-transform duration-150"
              dangerouslySetInnerHTML={{ __html: svgContent }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
