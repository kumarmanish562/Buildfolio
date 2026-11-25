"use client";

import * as React from "react";
import { Activity, ChevronDown, ChevronUp, Gauge, X } from "lucide-react";
import { cn } from "@/lib/utils";

const PERF_HUD_STORAGE_KEY = "buildfolio:perf-hud-enabled";
const PERF_HUD_EVENT = "buildfolio:perf-hud-toggle";

export function setPerformanceHudEnabled(enabled: boolean) {
  if (typeof window === "undefined") return;
  localStorage.setItem(PERF_HUD_STORAGE_KEY, enabled ? "true" : "false");
  window.dispatchEvent(new CustomEvent(PERF_HUD_EVENT, { detail: enabled }));
}

export function isPerformanceHudEnabled(): boolean {
  if (typeof window === "undefined") return true;
  const stored = localStorage.getItem(PERF_HUD_STORAGE_KEY);
  return stored !== "false";
}

export function PerformanceHud({ className }: { className?: string }) {
  const [enabled, setEnabled] = React.useState(true);
  const [expanded, setExpanded] = React.useState(false);
  const [loadMs, setLoadMs] = React.useState<number | null>(null);
  const [apiLatencyMs, setApiLatencyMs] = React.useState<number | null>(null);

  React.useEffect(() => {
    const raf = requestAnimationFrame(() => {
      setEnabled(isPerformanceHudEnabled());
    });

    const handleToggle = (e: Event) => {
      const custom = e as CustomEvent<boolean>;
      setEnabled(Boolean(custom.detail));
    };
    window.addEventListener(PERF_HUD_EVENT, handleToggle);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener(PERF_HUD_EVENT, handleToggle);
    };
  }, []);

  React.useEffect(() => {
    if (typeof window === "undefined" || typeof performance === "undefined") {
      return;
    }

    const raf = requestAnimationFrame(() => {
      const navEntries = performance.getEntriesByType(
        "navigation"
      ) as PerformanceNavigationTiming[];
      if (navEntries.length > 0) {
        const nav = navEntries[0];
        const interactive = Math.round(nav.domInteractive || nav.loadEventEnd);
        if (interactive > 0) {
          setLoadMs(interactive);
        }
      }
    });

    if (typeof PerformanceObserver === "undefined") {
      return () => cancelAnimationFrame(raf);
    }

    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === "resource") {
          const res = entry as PerformanceResourceTiming;
          if (res.name.includes("/api/") && res.duration > 0) {
            setApiLatencyMs(Math.round(res.duration));
          }
        }
      }
    });

    try {
      observer.observe({ type: "resource", buffered: true });
    } catch {
      // Some browsers don't support buffered resource observer
    }

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
    };
  }, []);

  if (!enabled) return null;

  return (
    <aside
      aria-label="Performance metrics HUD"
      className={cn(
        "fixed bottom-4 left-4 z-40 rounded-xl border bg-popover/90 text-xs text-popover-foreground shadow-lg backdrop-blur-md print:hidden",
        className
      )}
    >
      <div className="flex items-center gap-2 px-3 py-1.5">
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="flex items-center gap-2 font-mono text-[11px] hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-expanded={expanded}
          aria-label="Toggle performance metrics details"
        >
          <span
            className={cn(
              "size-2 rounded-full",
              loadMs !== null && loadMs < 800
                ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.7)]"
                : loadMs !== null && loadMs < 2000
                  ? "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.7)]"
                  : "bg-emerald-500"
            )}
            aria-hidden="true"
          />
          <Gauge className="size-3.5 text-muted-foreground" aria-hidden="true" />
          <span>{loadMs !== null ? `${loadMs}ms` : "— ms"}</span>
          {apiLatencyMs !== null && (
            <span className="text-muted-foreground">
              • API {apiLatencyMs}ms
            </span>
          )}
          {expanded ? (
            <ChevronDown className="size-3 text-muted-foreground" aria-hidden="true" />
          ) : (
            <ChevronUp className="size-3 text-muted-foreground" aria-hidden="true" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setPerformanceHudEnabled(false)}
          className="ml-1 rounded p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Dismiss Performance HUD"
          title="Hide Performance HUD (re-enable in Settings)"
        >
          <X className="size-3" aria-hidden="true" />
        </button>
      </div>

      {expanded && (
        <div className="space-y-1.5 border-t px-3 py-2 text-[11px]">
          <div className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1 text-muted-foreground">
              <Activity className="size-3" aria-hidden="true" />
              DOM Interactive
            </span>
            <span className="font-mono font-medium">
              {loadMs !== null ? `${loadMs} ms` : "Measuring..."}
            </span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-muted-foreground">Latest API Latency</span>
            <span className="font-mono font-medium">
              {apiLatencyMs !== null ? `${apiLatencyMs} ms` : "No API calls yet"}
            </span>
          </div>
        </div>
      )}
    </aside>
  );
}
