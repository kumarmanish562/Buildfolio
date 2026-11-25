"use client";

import * as React from "react";
import {
  Activity,
  ArrowRight,
  GitFork,
  Loader2,
  Milestone,
  Scale,
  Sparkles,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { MermaidDiagramViewer } from "@/components/portfolio/mermaid-diagram-viewer";
import { api, SimulateArchitectureResponse } from "@/lib/api";
import { toast } from "@/components/ui/toast";

const PRESET_SCENARIOS = [
  "Migrate database caching from PostgreSQL to Redis",
  "Decompose audit & indexing into Event-Driven Kafka Microservices",
  "Introduce a GraphQL Gateway Layer with Apollo Router",
  "Enable Multi-Region Active-Active Replication with Edge CDN",
];

export function WhatIfSimulatorDialog({
  repoId,
  repoName,
}: {
  repoId: string;
  repoName: string;
}) {
  const [open, setOpen] = React.useState(false);
  const [prompt, setPrompt] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [result, setResult] = React.useState<SimulateArchitectureResponse | null>(null);

  const handleSimulate = async (scenarioText?: string) => {
    const text = (scenarioText ?? prompt).trim();
    if (!text || loading) return;

    setLoading(true);
    try {
      const res = await api.simulateArchitecture(repoId, text);
      setResult(res);
      toast.add({
        title: "Simulation synthesized",
        description: `Architectural changes projected for ${repoName}.`,
        type: "success",
      });
    } catch (err) {
      toast.add({
        title: "Simulation failed",
        description: err instanceof Error ? err.message : String(err),
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="outline" size="sm" className="gap-1.5 text-xs">
            <GitFork className="size-3.5 text-indigo-500" aria-hidden="true" />
            What-If Simulator
          </Button>
        }
      />
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col p-6">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-500">
              <Zap className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold">
                &ldquo;What-If&rdquo; Architectural Simulator
              </DialogTitle>
              <DialogDescription className="text-xs">
                Prototype refactorings, technology migrations, and microservice decouplings for {repoName}.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Input & Presets */}
        <div className="space-y-3 pt-2">
          <div className="flex flex-wrap gap-1.5">
            {PRESET_SCENARIOS.map((scenario, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setPrompt(scenario);
                  handleSimulate(scenario);
                }}
                disabled={loading}
                className="rounded-lg border bg-muted/30 px-2.5 py-1 text-[11px] font-medium text-muted-foreground hover:border-primary/40 hover:text-foreground transition-all"
              >
                {scenario}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Or describe a custom scenario (e.g., 'Switch from REST to gRPC')..."
              className="flex-1 rounded-xl border bg-background px-3.5 py-2 text-xs text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              disabled={loading}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleSimulate();
                }
              }}
            />
            <Button
              size="sm"
              onClick={() => handleSimulate()}
              disabled={loading || !prompt.trim()}
              className="gap-1.5 text-xs"
            >
              {loading ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  Simulating...
                </>
              ) : (
                <>
                  <Sparkles className="size-3.5" />
                  Simulate
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Results view */}
        <div className="flex-1 overflow-y-auto space-y-5 pt-4">
          {result && (
            <div className="space-y-5 animate-in fade-in duration-200">
              {/* Header summary & complexity badge */}
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border bg-gradient-to-r from-card via-card to-indigo-500/[0.06] p-4">
                <div>
                  <span className="text-[10px] font-bold text-primary uppercase tracking-wider">
                    Simulated Scenario
                  </span>
                  <h3 className="text-sm font-semibold">{result.scenario}</h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Estimated Complexity:</span>
                  <Badge
                    className={
                      result.estimatedComplexity === "LOW"
                        ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                        : result.estimatedComplexity === "HIGH" || result.estimatedComplexity === "CRITICAL"
                        ? "bg-rose-500/15 text-rose-600 dark:text-rose-400"
                        : "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                    }
                  >
                    {result.estimatedComplexity}
                  </Badge>
                </div>
              </div>

              {/* Proposed Mermaid Diagram */}
              <div className="rounded-2xl border bg-card p-4 space-y-2">
                <span className="text-xs font-semibold text-muted-foreground">
                  Proposed Architecture Diagram
                </span>
                <MermaidDiagramViewer
                  chart={result.proposedMermaid}
                  title={`${result.scenario} - Proposed Architecture`}
                />
              </div>

              {/* Trade-Off Analysis */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border bg-card p-4 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-semibold">
                    <Scale className="size-4 text-primary" />
                    <span>Trade-Off Analysis</span>
                  </div>
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    {result.tradeOffAnalysis}
                  </p>
                </div>

                <div className="rounded-2xl border bg-card p-4 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-semibold">
                    <Activity className="size-4 text-emerald-500" />
                    <span>Architectural Impacts</span>
                  </div>
                  <ul className="space-y-1.5 text-xs text-muted-foreground">
                    {result.architecturalImpacts.map((impact, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <ArrowRight className="size-3 text-primary shrink-0 mt-0.5" />
                        <span>{impact}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Migration Strategy */}
              <div className="rounded-2xl border bg-muted/20 p-4 space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-semibold">
                  <Milestone className="size-4 text-indigo-500" />
                  <span>Phased Migration Strategy</span>
                </div>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  {result.migrationStrategy}
                </p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
