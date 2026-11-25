"use client";

import * as React from "react";
import Link from "next/link";

import {
  AlertCircle,
  ArrowDown,
  ArrowRight,
  ArrowUp,
  CheckCircle2,
  Database,
  Eye,
  EyeOff,
  FolderGit2,
  GripVertical,
  LayoutGrid,
  MessageSquareCode,
  LoaderCircle,
  RotateCcw,
  ShieldCheck,
} from "lucide-react";

import { Button } from "@/components/ui/button";

import { RepoCard } from "@/components/dashboard/repo-card";

import { Badge } from "@/components/ui/badge";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Skeleton } from "@/components/ui/skeleton";

import { useRepos } from "@/hooks/use-repos";
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
} from "recharts";

const LANG_COLORS = [
  "#6366f1",
  "#10b981",
  "#f59e0b",
  "#ec4899",
  "#06b6d4",
  "#8b5cf6",
];

type WidgetId = "stats" | "recent" | "language" | "health" | "security";

type WidgetConfig = {
  id: WidgetId;
  label: string;
  visible: boolean;
};

const DEFAULT_WIDGETS: WidgetConfig[] = [
  { id: "stats", label: "Workspace KPIs", visible: true },
  { id: "recent", label: "Recent Repositories", visible: true },
  { id: "language", label: "Language Distribution", visible: true },
  { id: "security", label: "Security Posture & Health", visible: true },
  { id: "health", label: "Workspace Health", visible: true },
];

const WIDGET_STORAGE_KEY = "buildfolio:overview-widgets:v1";

export function OverviewDashboard() {
  const reposQuery = useRepos();
  const [customizing, setCustomizing] = React.useState(false);
  const [widgets, setWidgets] = React.useState<WidgetConfig[]>(DEFAULT_WIDGETS);

  React.useEffect(() => {
    const id = requestAnimationFrame(() => {
      try {
        const saved = localStorage.getItem(WIDGET_STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved) as WidgetConfig[];
          if (Array.isArray(parsed) && parsed.length === DEFAULT_WIDGETS.length) {
            setWidgets(parsed);
          }
        }
      } catch {
        // Ignore malformed storage
      }
    });
    return () => cancelAnimationFrame(id);
  }, []);

  const updateWidgets = (next: WidgetConfig[]) => {
    setWidgets(next);
    try {
      localStorage.setItem(WIDGET_STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Ignore storage errors
    }
  };

  const moveWidget = (index: number, delta: -1 | 1) => {
    const target = index + delta;
    if (target < 0 || target >= widgets.length) return;
    const copy = [...widgets];
    const [item] = copy.splice(index, 1);
    copy.splice(target, 0, item);
    updateWidgets(copy);
  };

  const reorderWidgets = (sourceIndex: number, targetIndex: number) => {
    if (sourceIndex === targetIndex || sourceIndex < 0 || targetIndex < 0) return;
    const copy = [...widgets];
    const [item] = copy.splice(sourceIndex, 1);
    copy.splice(targetIndex, 0, item);
    updateWidgets(copy);
  };

  const toggleWidget = (id: WidgetId) => {
    updateWidgets(
      widgets.map((w) => (w.id === id ? { ...w, visible: !w.visible } : w))
    );
  };

  const repos =
    reposQuery.data ?? [];

  const readyCount =
    repos.filter(
      (repo) =>
        repo.indexStatus === "READY"
    ).length;

  const indexingCount =
    repos.filter(
      (repo) =>
        repo.indexStatus === "INDEXING"
    ).length;

  const failedCount =
    repos.filter(
      (repo) =>
        repo.indexStatus === "FAILED"
    ).length;

  const pendingCount =
    repos.filter(
      (repo) =>
        repo.indexStatus === "PENDING"
    ).length;

  const totalChunks =
    repos.reduce(
      (sum, repo) =>
        sum + repo.chunkCount,
      0
    );

  const languageData = Object.entries(
    repos.reduce<Record<string, number>>((acc, repo) => {
      const lang = repo.language || "Other";
      acc[lang] = (acc[lang] ?? 0) + 1;
      return acc;
    }, {})
  )
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);

  const recentRepos =
    [...repos]
      .sort((a, b) => {
        const aTime =
          a.indexedAt
            ? new Date(
                a.indexedAt
              ).getTime()
            : 0;

        const bTime =
          b.indexedAt
            ? new Date(
                b.indexedAt
              ).getTime()
            : 0;

        return bTime - aTime;
      })
      .slice(0, 4);

  return (
    <div
      className="flex flex-1 flex-col gap-8 p-4 md:p-6"
      data-tour="overview-widgets"
    >
      {/* Welcome */}

      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-primary">
            Developer workspace
          </p>

          <h1 className="mt-1 font-heading text-2xl font-bold tracking-tight sm:text-3xl">
            Your codebase at a glance.
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            Monitor repositories, indexing and AI-ready code from one workspace.
          </p>
        </div>

        <div className="flex items-center gap-2 print:hidden">
          {customizing && (
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 text-xs"
              onClick={() => updateWidgets(DEFAULT_WIDGETS)}
            >
              <RotateCcw className="size-3.5" aria-hidden="true" />
              Reset
            </Button>
          )}
          <Button
            variant={customizing ? "default" : "outline"}
            size="sm"
            className="gap-1.5 text-xs"
            onClick={() => setCustomizing((v) => !v)}
            aria-pressed={customizing}
          >
            <LayoutGrid className="size-3.5" aria-hidden="true" />
            {customizing ? "Done Customizing" : "Customize Widgets"}
          </Button>
        </div>
      </section>

      {customizing && (
        <Card className="border-dashed print:hidden">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Dashboard Layout</CardTitle>
            <CardDescription className="text-xs">
              Reorder or show/hide overview widgets. Changes save automatically.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
            {widgets.map((widget, idx) => (
              <div
                key={widget.id}
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData("text/plain", String(idx));
                }}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const from = Number(e.dataTransfer.getData("text/plain"));
                  if (!Number.isNaN(from)) {
                    reorderWidgets(from, idx);
                  }
                }}
                className="flex cursor-grab items-center justify-between gap-2 rounded-xl border bg-background/60 px-3 py-2 text-xs transition-colors hover:border-primary/40 active:cursor-grabbing"
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  <GripVertical className="size-3 text-muted-foreground shrink-0" aria-hidden="true" />
                  <span className="font-medium truncate">{widget.label}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    disabled={idx === 0}
                    onClick={() => moveWidget(idx, -1)}
                    aria-label={`Move ${widget.label} up`}
                  >
                    <ArrowUp className="size-3.5" aria-hidden="true" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    disabled={idx === widgets.length - 1}
                    onClick={() => moveWidget(idx, 1)}
                    aria-label={`Move ${widget.label} down`}
                  >
                    <ArrowDown className="size-3.5" aria-hidden="true" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => toggleWidget(widget.id)}
                    aria-label={
                      widget.visible
                        ? `Hide ${widget.label}`
                        : `Show ${widget.label}`
                    }
                  >
                    {widget.visible ? (
                      <Eye className="size-3.5 text-emerald-500" aria-hidden="true" />
                    ) : (
                      <EyeOff className="size-3.5 text-muted-foreground" aria-hidden="true" />
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {widgets
        .filter((w) => w.visible)
        .map((widget) => {
          if (widget.id === "stats") {
            return (
              <div
                key="stats"
                className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
              >
                {reposQuery.isLoading ? (
                  Array.from({ length: 4 }).map((_, index) => (
                    <Skeleton key={index} className="h-32 rounded-2xl" />
                  ))
                ) : (
                  <>
                    <StatCard
                      icon={FolderGit2}
                      label="Repositories"
                      value={repos.length}
                      hint="Connected from GitHub"
                    />
                    <StatCard
                      icon={CheckCircle2}
                      label="Ready to chat"
                      value={readyCount}
                      hint={`${indexingCount} currently indexing`}
                    />
                    <StatCard
                      icon={Database}
                      label="Indexed chunks"
                      value={totalChunks.toLocaleString()}
                      hint="Searchable code segments"
                    />
                    <StatCard
                      icon={failedCount > 0 ? AlertCircle : LoaderCircle}
                      label="Needs attention"
                      value={failedCount}
                      hint={
                        failedCount > 0
                          ? "Review failed repositories"
                          : "Workspace looks healthy"
                      }
                    />
                  </>
                )}
              </div>
            );
          }

          if (widget.id === "recent") {
            return (
              <section key="recent" className="space-y-4">
                <div className="flex items-end justify-between">
                  <div>
                    <h2 className="font-heading text-lg font-semibold">
                      Recent repositories
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Continue working with your latest indexed repositories.
                    </p>
                  </div>
                  <Link
                    href="/dashboard"
                    className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                  >
                    View all
                    <ArrowRight className="size-3.5" />
                  </Link>
                </div>

                {reposQuery.isLoading ? (
                  <div className="grid gap-4 md:grid-cols-2">
                    {Array.from({ length: 4 }).map((_, index) => (
                      <Skeleton key={index} className="h-80 rounded-2xl" />
                    ))}
                  </div>
                ) : recentRepos.length > 0 ? (
                  <div className="grid gap-4 md:grid-cols-2">
                    {recentRepos.map((repo) => (
                      <RepoCard key={repo.id} repo={repo} />
                    ))}
                  </div>
                ) : (
                  <Card>
                    <CardHeader>
                      <CardTitle>No repositories yet</CardTitle>
                      <CardDescription>
                        Connect GitHub repositories to start building your code
                        knowledge base.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Link
                        href="/dashboard"
                        className="text-sm font-medium text-primary hover:underline"
                      >
                        Connect repositories →
                      </Link>
                    </CardContent>
                  </Card>
                )}
              </section>
            );
          }

          if (widget.id === "language" && languageData.length > 0) {
            return (
              <Card key="language" variant="gradient">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">
                    Language Distribution
                  </CardTitle>
                  <CardDescription>
                    Tech breakdown across {repos.length} repositories
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="h-48 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={languageData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={48}
                          outerRadius={76}
                          paddingAngle={3}
                        >
                          {languageData.map((_, idx) => (
                            <Cell
                              key={idx}
                              fill={LANG_COLORS[idx % LANG_COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <RechartsTooltip
                          contentStyle={{
                            borderRadius: "0.75rem",
                            fontSize: "12px",
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {languageData.map((entry, idx) => (
                      <div
                        key={entry.name}
                        className="flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs"
                      >
                        <span
                          className="size-2.5 rounded-full"
                          style={{
                            backgroundColor:
                              LANG_COLORS[idx % LANG_COLORS.length],
                          }}
                        />
                        <span className="font-medium">{entry.name}</span>
                        <span className="text-muted-foreground">
                          ({entry.value})
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          }

          if (widget.id === "security") {
            return (
              <Card key="security" variant="gradient" className="space-y-4">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="size-5 text-emerald-500" aria-hidden="true" />
                      <CardTitle className="text-base">Security Posture & Health</CardTitle>
                    </div>
                    <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                      Verified Shield
                    </Badge>
                  </div>
                  <CardDescription>
                    Automated static audit scanning across your repositories.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="rounded-xl border bg-card/60 p-3">
                      <p className="text-xs text-muted-foreground">Scanned Repos</p>
                      <p className="mt-1 font-heading text-xl font-bold">{readyCount}</p>
                    </div>
                    <div className="rounded-xl border bg-card/60 p-3">
                      <p className="text-xs text-muted-foreground">Audit Coverage</p>
                      <p className="mt-1 font-heading text-xl font-bold">
                        {repos.length > 0 ? Math.round((readyCount / repos.length) * 100) : 0}%
                      </p>
                    </div>
                    <div className="rounded-xl border bg-card/60 p-3">
                      <p className="text-xs text-muted-foreground">AI Fix Generator</p>
                      <p className="mt-1 font-heading text-xl font-bold text-emerald-600 dark:text-emerald-400">
                        Active
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
                    <span>Vulnerability detection & remediation via Spring AI</span>
                    <Link
                      href="/dashboard/compare"
                      className="font-medium text-primary hover:underline"
                    >
                      Compare Matrix Security →
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          }

          if (widget.id === "health") {
            return (
              <section key="health" className="space-y-4">
                <div>
                  <h2 className="font-heading text-lg font-semibold">
                    Workspace health
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Current indexing status across your workspace.
                  </p>
                </div>

                <Card>
                  <CardContent className="space-y-4 pt-6">
                    <StatusRow label="Ready" value={readyCount} />
                    <StatusRow label="Indexing" value={indexingCount} />
                    <StatusRow label="Pending" value={pendingCount} />
                    <StatusRow
                      label="Failed"
                      value={failedCount}
                      destructive={failedCount > 0}
                    />

                    <div className="mt-5 rounded-xl border border-dashed bg-muted/20 p-4">
                      <div className="flex items-center gap-2">
                        <MessageSquareCode className="size-4 text-primary" />
                        <span className="text-sm font-medium">
                          AI-ready code
                        </span>
                      </div>
                      <p className="mt-2 text-xs leading-5 text-muted-foreground">
                        {readyCount} repositories are currently available for
                        AI-powered code conversations.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </section>
            );
          }

          return null;
        })}
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: typeof FolderGit2;
  label: string;
  value: number | string;
  hint: string;
}) {
  return (
    <Card variant="gradient" className="glow-card overflow-hidden border border-border/80 shadow-xs hover:border-foreground/20 transition-all">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
              {label}
            </span>

            <div className="text-3xl font-extrabold tracking-tight text-foreground">
              {value}
            </div>
          </div>

          <div className="flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary border border-primary/20 shadow-inner">
            <Icon className="size-4" />
          </div>
        </div>
      </CardHeader>

      <CardContent className="text-xs text-muted-foreground flex items-center gap-1.5 pt-1">
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
        <span>{hint}</span>
      </CardContent>
    </Card>
  );
}

function StatusRow({
  label,
  value,
  destructive = false,
}: {
  label: string;
  value: number;
  destructive?: boolean;
}) {
  return (
    <div className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0">
      <span className="text-sm text-muted-foreground">
        {label}
      </span>

      <Badge
        variant={
          destructive
            ? "destructive"
            : "secondary"
        }
      >
        {value}
      </Badge>
    </div>
  );
}