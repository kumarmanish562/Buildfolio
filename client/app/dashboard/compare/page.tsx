"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  Check,
  Columns3,
  GitBranch,
  Layers,
  RefreshCw,
  Shield,
  Sparkles,
} from "lucide-react";

import { api, Repository, RepoComparisonResponse } from "@/lib/api";
import { useRepos } from "@/hooks/use-repos";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export default function CompareRepositoriesPage() {
  const { data: repos, isLoading } = useRepos();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const compareMutation = useMutation({
    mutationFn: (ids: string[]) => api.compareRepositories(ids),
  });

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id)
        ? prev.filter((item) => item !== id)
        : prev.length < 4
        ? [...prev, id]
        : prev
    );
  };

  const handleRunComparison = () => {
    if (selectedIds.length >= 2) {
      compareMutation.mutate(selectedIds);
    }
  };

  const comparison = compareMutation.data;
  const isComparing = compareMutation.isPending;

  return (
    <AppShell>
      <div className="mx-auto max-w-6xl space-y-8 p-6 md:p-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link
              href="/dashboard"
              className="mb-2 flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="size-3.5" />
              Back to Dashboard
            </Link>
            <h1 className="text-2xl font-bold tracking-tight">
              Multi-Repository Architecture & Tech Matrix
            </h1>
            <p className="text-sm text-muted-foreground">
              Select 2 to 4 repositories to synthesize a cross-architecture comparison and polyglot balance matrix.
            </p>
          </div>

          <Button
            disabled={selectedIds.length < 2 || isComparing}
            onClick={handleRunComparison}
            className="gap-2"
          >
            {isComparing ? (
              <>
                <RefreshCw className="size-4 animate-spin" />
                Synthesizing Matrix...
              </>
            ) : (
              <>
                <Columns3 className="size-4" />
                Compare ({selectedIds.length}/4)
              </>
            )}
          </Button>
        </div>

        {/* Repository Selection Chips */}
        {isLoading ? (
          <Skeleton className="h-20 w-full rounded-2xl" />
        ) : (
          <div className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Choose Repositories to Compare
            </span>
            <div className="flex flex-wrap gap-2.5">
              {repos?.map((repo) => {
                const isSelected = selectedIds.includes(repo.id);
                return (
                  <button
                    key={repo.id}
                    onClick={() => toggleSelect(repo.id)}
                    className={`flex items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-medium transition-all ${
                      isSelected
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-card text-muted-foreground hover:border-foreground/30"
                    }`}
                  >
                    <div
                      className={`flex size-4 items-center justify-center rounded-sm border ${
                        isSelected ? "border-primary bg-primary text-primary-foreground" : "border-muted"
                      }`}
                    >
                      {isSelected && <Check className="size-3" />}
                    </div>
                    <span>{repo.name}</span>
                    {repo.language && (
                      <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                        {repo.language}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Comparative Analysis Result */}
        {comparison && (
          <div className="space-y-8 pt-4">
            {/* Cross-Architecture Executive Summary */}
            <div className="space-y-3 rounded-2xl border bg-gradient-to-br from-card via-card to-muted/40 p-6 md:p-8">
              <div className="flex items-center gap-2 text-lg font-semibold tracking-tight text-primary">
                <Sparkles className="size-5" />
                <h2>Cross-Repository Synergy & Architectural Evaluation</h2>
              </div>
              <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                {comparison.crossArchitectureSummary}
              </p>
            </div>

            {/* Side-by-side Matrix Table */}
            <div className="overflow-x-auto rounded-2xl border bg-card">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b bg-muted/40">
                    <th className="p-4 font-semibold text-muted-foreground">Metric</th>
                    {comparison.repositories.map((item) => (
                      <th key={item.repositoryId} className="p-4 font-semibold text-foreground">
                        {item.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y text-xs">
                  <tr>
                    <td className="p-4 font-medium text-muted-foreground">Language / Runtime</td>
                    {comparison.repositories.map((item) => (
                      <td key={item.repositoryId} className="p-4 font-semibold text-foreground">
                        {item.language}
                      </td>
                    ))}
                  </tr>

                  <tr>
                    <td className="p-4 font-medium text-muted-foreground">Security Posture</td>
                    {comparison.repositories.map((item) => (
                      <td key={item.repositoryId} className="p-4">
                        {item.securityScore !== null ? (
                          <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                            {item.securityScore}/100 ({item.securityRiskLevel})
                          </span>
                        ) : (
                          <span className="text-muted-foreground">Not Audited</span>
                        )}
                      </td>
                    ))}
                  </tr>

                  <tr>
                    <td className="p-4 font-medium text-muted-foreground">Architecture Title</td>
                    {comparison.repositories.map((item) => (
                      <td key={item.repositoryId} className="p-4 text-foreground">
                        {item.portfolioTitle}
                      </td>
                    ))}
                  </tr>

                  <tr>
                    <td className="p-4 font-medium text-muted-foreground">Tech Categories</td>
                    {comparison.repositories.map((item) => (
                      <td key={item.repositoryId} className="p-4">
                        <div className="flex flex-wrap gap-1">
                          {item.techStackCategories.map((c, i) => (
                            <Badge key={i} variant="outline" className="text-[10px]">
                              {c}
                            </Badge>
                          ))}
                        </div>
                      </td>
                    ))}
                  </tr>

                  <tr>
                    <td className="p-4 font-medium text-muted-foreground">Index Volume</td>
                    {comparison.repositories.map((item) => (
                      <td key={item.repositoryId} className="p-4 text-muted-foreground">
                        {item.filesCount} files ({item.chunkCount} vector chunks)
                      </td>
                    ))}
                  </tr>

                  <tr>
                    <td className="p-4 font-medium text-muted-foreground">Architecture Overview</td>
                    {comparison.repositories.map((item) => (
                      <td key={item.repositoryId} className="p-4 text-muted-foreground line-clamp-3">
                        {item.architectureSummary}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
