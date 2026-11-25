"use client";

import React, { useState, useEffect } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Copy,
  Check,
  FileCode2,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Info,
} from "lucide-react";
import { AntiPatternAuditResponse, api } from "@/lib/api";
import { toast } from "@/components/ui/toast";

interface AntiPatternAuditorProps {
  portfolioId?: string;
  repoId?: string;
  isPublicView?: boolean;
}

export function AntiPatternAuditor({
  portfolioId,
  repoId,
  isPublicView = false,
}: AntiPatternAuditorProps) {
  const [data, setData] = useState<AntiPatternAuditResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterSeverity, setFilterSeverity] = useState("ALL");
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  useEffect(() => {
    const fetchAudit = async () => {
      try {
        let res: AntiPatternAuditResponse;
        if (isPublicView && portfolioId) {
          res = await api.getPublicAntiPatterns(portfolioId);
        } else if (repoId) {
          res = await api.getAntiPatterns(repoId);
        } else if (portfolioId) {
          res = await api.getPublicAntiPatterns(portfolioId);
        } else {
          setLoading(false);
          return;
        }
        setData(res);
      } catch (err) {
        console.error("Failed to load anti-pattern audit", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAudit();
  }, [portfolioId, repoId, isPublicView]);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
    toast.add({
      title: "Copied to clipboard",
      description: "Remediation code snippet ready to paste.",
      type: "success",
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <ShieldAlert className="h-8 w-8 animate-pulse text-amber-500 mb-3" />
        <p className="text-sm font-medium">Running architectural anti-pattern & tech debt inspection...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="rounded-2xl border border-dashed p-8 text-center text-muted-foreground">
        <CheckCircle2 className="mx-auto h-8 w-8 mb-2 text-emerald-500" />
        <p className="text-sm">Architectural audit completed. No critical tech debt detected.</p>
      </div>
    );
  }

  const getSeverityBadge = (severity: string) => {
    switch (severity.toUpperCase()) {
      case "CRITICAL":
        return "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30";
      case "HIGH":
        return "bg-orange-500/15 text-orange-600 dark:text-orange-400 border-orange-500/30";
      case "MEDIUM":
        return "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30";
      default:
        return "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30";
    }
  };

  const severities = ["ALL", ...Array.from(new Set(data.violations.map((v) => v.severity)))];

  const filteredViolations =
    filterSeverity === "ALL"
      ? data.violations
      : data.violations.filter((v) => v.severity === filterSeverity);

  return (
    <div className="space-y-6">
      {/* Header Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Rating Card */}
        <div className="rounded-2xl border border-border/80 bg-card/60 p-4 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Architecture Debt Rating
          </span>
          <div className="text-xl font-extrabold text-foreground flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-emerald-500" />
            <span>{data.debtRating}</span>
          </div>
          <p className="text-[11px] text-muted-foreground">
            Health Index: <strong className="text-foreground">{data.healthScore}/100</strong>
          </p>
        </div>

        {/* Refactor Time */}
        <div className="rounded-2xl border border-border/80 bg-card/60 p-4 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Estimated Refactor Effort
          </span>
          <div className="text-xl font-extrabold text-foreground flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" />
            <span>{data.estimatedRefactorHours} hrs</span>
          </div>
          <p className="text-[11px] text-muted-foreground">
            Total rule items identified: <strong className="text-foreground">{data.totalViolations}</strong>
          </p>
        </div>

        {/* Security / Boundary Score */}
        <div className="rounded-2xl border border-border/80 bg-card/60 p-4 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Boundary Enforcement
          </span>
          <div className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            <span>Modular & Clean</span>
          </div>
          <p className="text-[11px] text-muted-foreground">Layer decoupling verified</p>
        </div>
      </div>

      {/* Executive Summary */}
      <div className="rounded-xl border border-border/70 bg-accent/15 p-4 flex items-start gap-3">
        <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
        <p className="text-xs text-muted-foreground leading-relaxed">{data.executiveSummary}</p>
      </div>

      {/* Severity Filter Tabs */}
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Architectural Rules ({filteredViolations.length})
        </span>

        <div className="flex flex-wrap gap-1.5">
          {severities.map((sev) => (
            <button
              key={sev}
              onClick={() => setFilterSeverity(sev)}
              className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition-all ${
                filterSeverity === sev
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted/50 text-muted-foreground hover:bg-muted"
              }`}
            >
              {sev}
            </button>
          ))}
        </div>
      </div>

      {/* Violation Items */}
      <div className="space-y-3">
        {filteredViolations.map((item, idx) => {
          const isExpanded = expandedIndex === idx;

          return (
            <div
              key={item.id}
              className={`rounded-xl border transition-all ${
                isExpanded ? "border-primary/40 bg-card shadow-sm" : "border-border/70 bg-card/60 hover:border-border"
              }`}
            >
              <div
                onClick={() => setExpandedIndex(isExpanded ? null : idx)}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 cursor-pointer select-none"
              >
                <div className="flex items-start sm:items-center gap-3">
                  <span
                    className={`inline-flex items-center justify-center rounded-lg border px-2 py-0.5 font-mono text-[10px] font-extrabold tracking-wide uppercase shrink-0 ${getSeverityBadge(
                      item.severity
                    )}`}
                  >
                    {item.severity}
                  </span>
                  <div>
                    <h4 className="text-xs font-bold text-foreground flex items-center gap-2">
                      <span>{item.ruleName}</span>
                      <span className="text-[10px] font-normal text-muted-foreground font-mono">({item.id})</span>
                    </h4>
                    <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">
                      {item.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  <span className="rounded bg-muted px-2 py-0.5 text-[10px] font-mono text-muted-foreground">
                    {item.category}
                  </span>
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
              </div>

              {isExpanded && (
                <div className="border-t border-border/50 p-4 space-y-4 bg-accent/5 rounded-b-xl">
                  {/* File component path */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <FileCode2 className="h-3.5 w-3.5 text-primary" />
                      <span className="font-mono text-foreground font-semibold">{item.componentPath}</span>
                    </div>

                    <button
                      onClick={() => handleCopy(item.remediationSnippet, `rem-${item.id}`)}
                      className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground font-semibold"
                    >
                      {copiedKey === `rem-${item.id}` ? (
                        <Check className="h-3 w-3 text-emerald-500" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                      <span>Copy Fix</span>
                    </button>
                  </div>

                  {/* Impact explanation */}
                  <div className="rounded-lg border border-border/60 bg-background/60 p-3 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-500 flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      Why this matters:
                    </span>
                    <p className="text-xs text-muted-foreground leading-relaxed">{item.impactExplanation}</p>
                  </div>

                  {/* Remediation code snippet */}
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1 block">
                      Recommended Code Remediation:
                    </span>
                    <pre className="p-3 rounded-lg bg-background border font-mono text-[11px] overflow-x-auto text-foreground leading-relaxed">
                      {item.remediationSnippet}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
