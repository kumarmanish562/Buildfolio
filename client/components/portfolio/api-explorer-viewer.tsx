"use client";

import React, { useState } from "react";
import {
  Code2,
  Copy,
  Check,
  Search,
  Lock,
  Unlock,
  Play,
  ChevronDown,
  ChevronUp,
  Server,
  Zap,
} from "lucide-react";
import { ApiExplorerResponse, api } from "@/lib/api";
import { toast } from "@/components/ui/toast";

interface ApiExplorerViewerProps {
  portfolioId: string;
  initialData?: ApiExplorerResponse;
}

export function ApiExplorerViewer({ portfolioId, initialData }: ApiExplorerViewerProps) {
  const [data, setData] = useState<ApiExplorerResponse | null>(initialData ?? null);
  const [loading, setLoading] = useState(!initialData);
  const [search, setSearch] = useState("");
  const [methodFilter, setMethodFilter] = useState("ALL");
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ index: number; latency: number; status: number } | null>(null);

  React.useEffect(() => {
    if (!initialData) {
      api
        .getApiExplorer(portfolioId)
        .then(setData)
        .catch((err) => {
          console.error("Failed to load API spec", err);
        })
        .finally(() => setLoading(false));
    }
  }, [portfolioId, initialData]);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
    toast.add({
      title: "Copied to clipboard",
      description: "Code snippet copied successfully.",
      type: "success",
    });
  };

  const handleSimulate = (index: number) => {
    const latency = 24 + ((index * 13) % 29);
    setTestResult({ index, latency, status: 200 });
    toast.add({
      title: "Mock Request Successful (200 OK)",
      description: `Latency: ${latency}ms | Simulated in-browser sandbox`,
      type: "success",
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <Server className="h-8 w-8 animate-pulse text-primary mb-3" />
        <p className="text-sm font-medium">Extracting REST endpoints from codebase...</p>
      </div>
    );
  }

  if (!data || data.endpoints.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed p-8 text-center text-muted-foreground">
        <Code2 className="mx-auto h-8 w-8 mb-2 opacity-50" />
        <p className="text-sm">No REST endpoints detected for this repository.</p>
      </div>
    );
  }

  const methods = ["ALL", ...Array.from(new Set(data.endpoints.map((e) => e.method)))];

  const filtered = data.endpoints.filter((ep) => {
    const matchesMethod = methodFilter === "ALL" || ep.method === methodFilter;
    const matchesSearch =
      ep.path.toLowerCase().includes(search.toLowerCase()) ||
      ep.summary.toLowerCase().includes(search.toLowerCase()) ||
      ep.controller.toLowerCase().includes(search.toLowerCase());
    return matchesMethod && matchesSearch;
  });

  const getMethodBadgeClass = (method: string) => {
    switch (method.toUpperCase()) {
      case "GET":
        return "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30";
      case "POST":
        return "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30";
      case "PUT":
      case "PATCH":
        return "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30";
      case "DELETE":
        return "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  return (
    <div className="space-y-4">
      {/* Header controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search endpoint paths or controllers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border bg-background pl-9 pr-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>

        <div className="flex flex-wrap gap-1.5">
          {methods.map((m) => (
            <button
              key={m}
              onClick={() => setMethodFilter(m)}
              className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition-all ${
                methodFilter === m
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted/50 text-muted-foreground hover:bg-muted"
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Endpoint list */}
      <div className="space-y-3">
        {filtered.map((ep, idx) => {
          const isExpanded = expandedIndex === idx;
          const isPublic = ep.authRequirement.toLowerCase().includes("public");

          return (
            <div
              key={idx}
              className={`rounded-xl border transition-all ${
                isExpanded ? "border-primary/40 bg-card shadow-sm" : "border-border/70 bg-card/60 hover:border-border"
              }`}
            >
              <div
                onClick={() => setExpandedIndex(isExpanded ? null : idx)}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 cursor-pointer select-none"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`inline-flex items-center justify-center rounded-lg border px-2.5 py-0.5 font-mono text-[11px] font-extrabold tracking-wide min-w-[54px] ${getMethodBadgeClass(
                      ep.method
                    )}`}
                  >
                    {ep.method}
                  </span>
                  <div>
                    <span className="font-mono text-xs font-semibold text-foreground">
                      {ep.path}
                    </span>
                    <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">
                      {ep.summary}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 self-end sm:self-center shrink-0">
                  <span className="inline-flex items-center gap-1 rounded-md bg-muted/60 px-2 py-0.5 text-[10px] text-muted-foreground">
                    {isPublic ? (
                      <Unlock className="h-3 w-3 text-emerald-500" />
                    ) : (
                      <Lock className="h-3 w-3 text-amber-500" />
                    )}
                    {ep.authRequirement}
                  </span>
                  <span className="text-[10px] font-mono text-muted-foreground/80 hidden md:inline">
                    {ep.controller}
                  </span>
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
              </div>

              {/* Expanded details */}
              {isExpanded && (
                <div className="border-t border-border/50 p-4 space-y-4 bg-accent/5 rounded-b-xl">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-foreground">Controller:</span>
                      <code className="text-xs font-mono text-primary bg-primary/10 px-2 py-0.5 rounded">
                        {ep.controller}.java
                      </code>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleSimulate(idx)}
                        className="inline-flex items-center gap-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 active:scale-95 transition-all"
                      >
                        <Play className="h-3 w-3 fill-current" />
                        <span>Send Mock Call</span>
                      </button>

                      <button
                        onClick={() => handleCopy(ep.path, `path-${idx}`)}
                        className="inline-flex items-center gap-1 rounded-lg border bg-background px-2.5 py-1 text-xs text-muted-foreground hover:text-foreground transition-all"
                      >
                        {copiedKey === `path-${idx}` ? (
                          <Check className="h-3 w-3 text-emerald-500" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                        <span>Copy Path</span>
                      </button>
                    </div>
                  </div>

                  {testResult && testResult.index === idx && (
                    <div className="flex items-center gap-2 p-2.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-xs text-emerald-600 dark:text-emerald-400">
                      <Zap className="h-3.5 w-3.5" />
                      <span className="font-semibold">Response: HTTP {testResult.status} OK</span>
                      <span className="text-muted-foreground">({testResult.latency}ms simulated latency)</span>
                    </div>
                  )}

                  {/* Request Body if applicable */}
                  {ep.requestBodyJson && (
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-semibold text-muted-foreground">Request Payload (JSON):</span>
                        <button
                          onClick={() => handleCopy(ep.requestBodyJson!, `req-${idx}`)}
                          className="text-[11px] text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
                        >
                          {copiedKey === `req-${idx}` ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                          Copy JSON
                        </button>
                      </div>
                      <pre className="p-3 rounded-lg bg-background border font-mono text-[11px] overflow-x-auto text-foreground">
                        {ep.requestBodyJson}
                      </pre>
                    </div>
                  )}

                  {/* Response Body */}
                  {ep.responseBodyJson && (
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-semibold text-muted-foreground">Response Schema / Payload:</span>
                        <button
                          onClick={() => handleCopy(ep.responseBodyJson!, `res-${idx}`)}
                          className="text-[11px] text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
                        >
                          {copiedKey === `res-${idx}` ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                          Copy JSON
                        </button>
                      </div>
                      <pre className="p-3 rounded-lg bg-background border font-mono text-[11px] overflow-x-auto text-foreground">
                        {ep.responseBodyJson}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
