"use client";

import { use, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowUpRight,
  Check,
  CheckCircle2,
  GitPullRequest,
  Lock,
  RefreshCw,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Wand2,
} from "lucide-react";

import { Vulnerability, FixVulnerabilityResponse } from "@/lib/api";
import {
  useSecurityAudit,
  useRunSecurityAudit,
  useFixVulnerability,
} from "@/hooks/use-security-audit";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/toast";

export default function SecurityAuditPage({
  params,
}: {
  params: Promise<{ repoId: string }>;
}) {
  const { repoId } = use(params);
  const auditQuery = useSecurityAudit(repoId);
  const runAuditMutation = useRunSecurityAudit(repoId);
  const fixMutation = useFixVulnerability(repoId);

  const [activeFixIndex, setActiveFixIndex] = useState<number | null>(null);
  const [fixResults, setFixResults] = useState<Record<number, FixVulnerabilityResponse>>({});

  const audit = auditQuery.data;
  const isLoading = auditQuery.isLoading;
  const isRunning = runAuditMutation.isPending;

  const handleFixVulnerability = async (vuln: Vulnerability, index: number) => {
    setActiveFixIndex(index);
    try {
      const res = await fixMutation.mutateAsync({
        vulnerabilityTitle: vuln.title,
        vulnerabilityDescription: vuln.description,
        remediation: vuln.remediation,
      });
      setFixResults((prev) => ({ ...prev, [index]: res }));
      toast.add({
        title: "Security Fix PR Created",
        description: `Opened PR #${res.pullRequestNumber} on ${res.branchName}.`,
        type: "success",
      });
    } catch (err) {
      toast.add({
        title: "Failed to generate fix PR",
        description: err instanceof Error ? err.message : String(err),
        type: "error",
      });
    } finally {
      setActiveFixIndex(null);
    }
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-5xl space-y-8 p-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64 w-full rounded-2xl" />
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-48 w-full rounded-2xl" />
          <Skeleton className="h-48 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!audit) {
    return (
      <div className="mx-auto max-w-4xl p-6">
        <Link
          href={`/dashboard/repos/${repoId}`}
          className="mb-6 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back to Repository
        </Link>

        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed py-16 text-center">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Shield className="size-7" />
          </div>
          <h2 className="mt-4 text-xl font-bold tracking-tight">
            Codebase Health & Security Audit
          </h2>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            Run an AI-powered static security audit to detect credential leaks, injection risks, and architectural vulnerabilities.
          </p>

          <Button
            className="mt-6 gap-2"
            disabled={isRunning}
            onClick={() => runAuditMutation.mutate()}
          >
            {isRunning ? (
              <>
                <RefreshCw className="size-4 animate-spin" />
                Scanning Codebase...
              </>
            ) : (
              <>
                <ShieldCheck className="size-4" />
                Run Security Audit
              </>
            )}
          </Button>
        </div>
      </div>
    );
  }

  let vulnerabilitiesList: Vulnerability[] = [];
  try {
    vulnerabilitiesList = JSON.parse(audit.vulnerabilities);
  } catch {
    vulnerabilitiesList = [];
  }

  let recommendationsList: string[] = [];
  try {
    recommendationsList = JSON.parse(audit.recommendations);
  } catch {
    recommendationsList = [];
  }

  const riskBadgeColor = {
    LOW: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
    MEDIUM: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
    HIGH: "bg-orange-500/15 text-orange-600 dark:text-orange-400",
    CRITICAL: "bg-red-500/15 text-red-600 dark:text-red-400",
  }[audit.riskLevel] || "bg-secondary text-foreground";

  return (
    <div className="mx-auto max-w-5xl space-y-10 p-6 md:p-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href={`/dashboard/repos/${repoId}`}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back to Repository
        </Link>

        <Button
          variant="outline"
          size="sm"
          className="gap-2 text-xs"
          disabled={isRunning}
          onClick={() => runAuditMutation.mutate()}
        >
          <RefreshCw className={`size-3.5 ${isRunning ? "animate-spin" : ""}`} />
          Re-Run Audit
        </Button>
      </div>

      {/* Audit Score Card */}
      <div className="grid gap-6 rounded-3xl border bg-gradient-to-br from-card via-card to-muted/40 p-6 md:p-8 sm:grid-cols-3">
        <div className="flex flex-col items-center justify-center rounded-2xl border bg-card p-6 text-center">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Security Health Score
          </span>
          <span className="mt-2 text-5xl font-extrabold tracking-tight text-primary">
            {audit.overallScore}/100
          </span>
          <Badge className={`mt-3 ${riskBadgeColor}`}>
            {audit.riskLevel} Risk Posture
          </Badge>
        </div>

        <div className="sm:col-span-2 flex flex-col justify-center space-y-3">
          <h1 className="text-2xl font-bold tracking-tight">Codebase Security Audit</h1>
          <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
            {audit.summary}
          </p>
        </div>
      </div>

      {/* Vulnerabilities with AI Fix Action */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 text-lg font-semibold tracking-tight">
          <ShieldAlert className="size-5 text-amber-500" />
          <h2>Detected Vulnerabilities & Warnings ({vulnerabilitiesList.length})</h2>
        </div>

        {vulnerabilitiesList.length === 0 ? (
          <div className="flex items-center gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-5 text-sm text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="size-5" />
            <span>No critical code security vulnerabilities detected in the indexed files.</span>
          </div>
        ) : (
          <div className="grid gap-5">
            {vulnerabilitiesList.map((vuln, idx) => {
              const isFixingThis = activeFixIndex === idx;
              const fixResult = fixResults[idx];

              return (
                <div key={idx} className="space-y-4 rounded-2xl border bg-card p-5 md:p-6 shadow-sm">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-semibold text-foreground">{vuln.title}</h3>
                      <Badge variant="outline" className="text-xs">
                        {vuln.severity}
                      </Badge>
                    </div>

                    {!fixResult ? (
                      <Button
                        size="sm"
                        variant="secondary"
                        className="gap-2 text-xs"
                        disabled={isFixingThis || activeFixIndex !== null}
                        onClick={() => handleFixVulnerability(vuln, idx)}
                      >
                        <Wand2 className={`size-3.5 ${isFixingThis ? "animate-spin" : ""}`} />
                        {isFixingThis ? "Generating PR..." : "Generate AI Fix PR"}
                      </Button>
                    ) : (
                      <a
                        href={fixResult.pullRequestUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500/15 px-3 py-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20"
                      >
                        <GitPullRequest className="size-3.5" />
                        View PR #{fixResult.pullRequestNumber} <ArrowUpRight className="size-3" />
                      </a>
                    )}
                  </div>

                  <p className="text-sm text-muted-foreground leading-relaxed">{vuln.description}</p>

                  {vuln.remediation && (
                    <div className="rounded-lg bg-muted/60 p-3 text-xs text-foreground">
                      <span className="font-semibold text-primary">Remediation: </span>
                      {vuln.remediation}
                    </div>
                  )}

                  {fixResult && (
                    <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs text-emerald-700 dark:text-emerald-300">
                      <span className="font-semibold">PR Opened on branch <code>{fixResult.branchName}</code>: </span>
                      {fixResult.explanation}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Actionable Recommendations */}
      {recommendationsList.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-lg font-semibold tracking-tight">
            <Lock className="size-5 text-primary" />
            <h2>Actionable Hardening Recommendations</h2>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {recommendationsList.map((rec, idx) => (
              <div key={idx} className="flex items-start gap-3 rounded-2xl border bg-card p-4">
                <div className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <CheckCircle2 className="size-3.5" />
                </div>
                <p className="text-sm text-foreground">{rec}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
