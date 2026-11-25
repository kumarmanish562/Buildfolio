"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import {
  RotateCcw,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { api, DependencyGraphNode } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const TYPE_COLORS: Record<string, { bg: string; text: string; stroke: string; dot: string }> = {
  CONTROLLER: {
    bg: "rgba(99, 102, 241, 0.12)",
    text: "#6366f1",
    stroke: "#6366f1",
    dot: "#6366f1",
  },
  SERVICE: {
    bg: "rgba(16, 185, 129, 0.12)",
    text: "#10b981",
    stroke: "#10b981",
    dot: "#10b981",
  },
  REPOSITORY: {
    bg: "rgba(245, 158, 11, 0.12)",
    text: "#f59e0b",
    stroke: "#f59e0b",
    dot: "#f59e0b",
  },
  ENTITY: {
    bg: "rgba(168, 85, 247, 0.12)",
    text: "#a855f7",
    stroke: "#a855f7",
    dot: "#a855f7",
  },
  CONFIG: {
    bg: "rgba(244, 63, 94, 0.12)",
    text: "#f43f5e",
    stroke: "#f43f5e",
    dot: "#f43f5e",
  },
  COMPONENT: {
    bg: "rgba(14, 165, 233, 0.12)",
    text: "#0ea5e9",
    stroke: "#0ea5e9",
    dot: "#0ea5e9",
  },
};

export function DependencyGraphViewer({
  repoId,
  portfolioId,
  isPublicView = false,
}: {
  repoId?: string;
  portfolioId?: string;
  isPublicView?: boolean;
}) {
  const [filterType, setFilterType] = React.useState<string>("ALL");
  const [selectedNode, setSelectedNode] = React.useState<DependencyGraphNode | null>(null);
  const [zoom, setZoom] = React.useState(1);

  const query = useQuery({
    queryKey: ["dependency-graph", isPublicView ? portfolioId : repoId],
    queryFn: () => {
      if (isPublicView && portfolioId) {
        return api.getPublicDependencyGraph(portfolioId);
      }
      if (repoId) {
        return api.getDependencyGraph(repoId);
      }
      throw new Error("Missing ID for graph");
    },
    enabled: isPublicView ? !!portfolioId : !!repoId,
  });

  const graph = query.data;

  const filteredNodes = React.useMemo(() => {
    if (!graph) return [];
    if (filterType === "ALL") return graph.nodes;
    return graph.nodes.filter((n) => n.type === filterType);
  }, [graph, filterType]);

  // Compute node layout coordinates partitioned by architecture layer
  const layout = React.useMemo(() => {
    if (!graph || graph.nodes.length === 0) return { positions: new Map<string, { x: number; y: number }>() };

    const layersOrder = ["CONTROLLER", "SERVICE", "REPOSITORY", "ENTITY", "CONFIG", "COMPONENT"];
    const grouped = new Map<string, DependencyGraphNode[]>();
    for (const type of layersOrder) {
      grouped.set(type, []);
    }

    for (const node of graph.nodes) {
      const list = grouped.get(node.type) ?? grouped.get("COMPONENT")!;
      list.push(node);
    }

    const positions = new Map<string, { x: number; y: number }>();
    const activeLayers = layersOrder.filter((t) => (grouped.get(t)?.length ?? 0) > 0);
    const colWidth = 220;

    activeLayers.forEach((type, colIdx) => {
      const nodesInCol = grouped.get(type)!;
      const x = 80 + colIdx * colWidth;
      const totalHeight = 420;
      const step = totalHeight / (nodesInCol.length + 1);

      nodesInCol.forEach((node, rowIdx) => {
        const y = step * (rowIdx + 1);
        positions.set(node.id, { x, y });
      });
    });

    return { positions, width: Math.max(780, activeLayers.length * colWidth + 120), height: 460 };
  }, [graph]);

  if (query.isLoading) {
    return (
      <div className="space-y-4 rounded-2xl border bg-card p-6">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-80 w-full rounded-xl" />
      </div>
    );
  }

  if (query.isError || !graph) {
    return (
      <div className="rounded-2xl border border-dashed p-8 text-center text-xs text-muted-foreground">
        Unable to load dependency graph. Indexing may still be completing.
      </div>
    );
  }

  return (
    <div className="space-y-4 rounded-2xl border bg-card/60 p-5 backdrop-blur-sm">
      {/* Top toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Layer Filters */}
        <div className="flex flex-wrap items-center gap-1.5" role="tablist" aria-label="Architecture layers">
          {["ALL", "CONTROLLER", "SERVICE", "REPOSITORY", "ENTITY"].map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setFilterType(type)}
              className={cn(
                "rounded-lg px-2.5 py-1 text-xs font-medium transition-colors",
                filterType === type
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              {type === "ALL" ? "All Layers" : type.charAt(0) + type.slice(1).toLowerCase() + "s"}
            </button>
          ))}
        </div>

        {/* Zoom controls */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setZoom((z) => Math.max(0.6, z - 0.15))}
            aria-label="Zoom out dependency graph"
          >
            <ZoomOut className="size-3.5" />
          </Button>
          <span className="font-mono text-xs text-muted-foreground px-1">
            {Math.round(zoom * 100)}%
          </span>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setZoom((z) => Math.min(1.8, z + 0.15))}
            aria-label="Zoom in dependency graph"
          >
            <ZoomIn className="size-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => {
              setZoom(1);
              setSelectedNode(null);
            }}
            aria-label="Reset dependency graph zoom"
          >
            <RotateCcw className="size-3.5" />
          </Button>
        </div>
      </div>

      {/* SVG Interactive Canvas */}
      <div className="relative overflow-auto rounded-xl border bg-background/50 shadow-inner min-h-[380px]">
        <div
          style={{ transform: `scale(${zoom})`, transformOrigin: "top left" }}
          className="transition-transform duration-150 p-6 min-w-fit"
        >
          <svg
            width={layout.width ?? 780}
            height={layout.height ?? 460}
            className="overflow-visible select-none"
          >
            <defs>
              <marker
                id="arrowhead"
                markerWidth="8"
                markerHeight="6"
                refX="7"
                refY="3"
                orient="auto"
              >
                <polygon points="0 0, 8 3, 0 6" fill="rgba(148, 163, 184, 0.6)" />
              </marker>
            </defs>

            {/* Render Links */}
            {graph.links.map((link, idx) => {
              const src = layout.positions.get(link.source);
              const tgt = layout.positions.get(link.target);
              if (!src || !tgt) return null;

              const isHighlighted =
                selectedNode && (selectedNode.id === link.source || selectedNode.id === link.target);

              return (
                <g key={idx}>
                  <path
                    d={`M ${src.x + 60} ${src.y} C ${(src.x + tgt.x) / 2} ${src.y}, ${(src.x + tgt.x) / 2} ${tgt.y}, ${tgt.x - 60} ${tgt.y}`}
                    fill="none"
                    stroke={isHighlighted ? "#6366f1" : "rgba(148, 163, 184, 0.28)"}
                    strokeWidth={isHighlighted ? 2.5 : 1.2}
                    markerEnd="url(#arrowhead)"
                  />
                </g>
              );
            })}

            {/* Render Nodes */}
            {filteredNodes.map((node) => {
              const pos = layout.positions.get(node.id);
              if (!pos) return null;

              const style = TYPE_COLORS[node.type] ?? TYPE_COLORS.COMPONENT;
              const isSelected = selectedNode?.id === node.id;

              return (
                <g
                  key={node.id}
                  transform={`translate(${pos.x - 70}, ${pos.y - 18})`}
                  onClick={() => setSelectedNode(node)}
                  className="cursor-pointer transition-transform hover:scale-105"
                >
                  <rect
                    width="140"
                    height="36"
                    rx="10"
                    fill={isSelected ? style.text : style.bg}
                    stroke={style.stroke}
                    strokeWidth={isSelected ? 2.5 : 1.2}
                    className="transition-colors"
                  />
                  <circle cx="16" cy="18" r="4" fill={isSelected ? "#fff" : style.dot} />
                  <text
                    x="28"
                    y="22"
                    fill={isSelected ? "#fff" : "currentColor"}
                    fontSize="11"
                    fontFamily="monospace"
                    fontWeight="600"
                  >
                    {node.name.length > 14 ? node.name.slice(0, 13) + "…" : node.name}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Selected Node Details Drawer/Card */}
      {selectedNode && (
        <div className="flex flex-col gap-2 rounded-xl border bg-muted/30 p-3.5 text-xs sm:flex-row sm:items-center sm:justify-between animate-in fade-in duration-150">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-foreground">{selectedNode.name}</span>
              <Badge
                variant="secondary"
                className="text-[10px]"
                style={{
                  color: TYPE_COLORS[selectedNode.type]?.text,
                  backgroundColor: TYPE_COLORS[selectedNode.type]?.bg,
                }}
              >
                {selectedNode.type}
              </Badge>
            </div>
            <p className="font-mono text-[11px] text-muted-foreground">{selectedNode.path}</p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-muted-foreground text-[11px]">
              Outgoing connections:{" "}
              {graph.links.filter((l) => l.source === selectedNode.id).length}
            </span>
            <Button
              variant="outline"
              size="sm"
              className="text-[11px] h-7"
              onClick={() => setSelectedNode(null)}
            >
              Clear
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
