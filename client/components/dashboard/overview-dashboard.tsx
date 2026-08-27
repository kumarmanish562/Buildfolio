"use client";

import Link from "next/link";

import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Database,
  FolderGit2,
  MessageSquareCode,
  LoaderCircle,
} from "lucide-react";

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

export function OverviewDashboard() {
  const reposQuery = useRepos();

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
    <div className="flex flex-1 flex-col gap-8 p-4 md:p-6">
      {/* Welcome */}

      <section>
        <p className="text-sm font-medium text-primary">
          Developer workspace
        </p>

        <h1 className="mt-1 font-heading text-2xl font-bold tracking-tight sm:text-3xl">
          Your codebase at a glance.
        </h1>

        <p className="mt-2 text-sm text-muted-foreground">
          Monitor repositories, indexing and AI-ready code from one workspace.
        </p>
      </section>

      {/* Stats */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {reposQuery.isLoading ? (
          Array.from({
            length: 4,
          }).map((_, index) => (
            <Skeleton
              key={index}
              className="h-32 rounded-2xl"
            />
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
              icon={
                failedCount > 0
                  ? AlertCircle
                  : LoaderCircle
              }
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

      {/* Main grid */}

      <div className="grid gap-8 xl:grid-cols-[1.4fr_0.6fr]">
        {/* Recent */}

        <section className="space-y-4">
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
              {Array.from({
                length: 4,
              }).map((_, index) => (
                <Skeleton
                  key={index}
                  className="h-80 rounded-2xl"
                />
              ))}
            </div>
          ) : recentRepos.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {recentRepos.map(
                (repo) => (
                  <RepoCard
                    key={repo.id}
                    repo={repo}
                  />
                )
              )}
            </div>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>
                  No repositories yet
                </CardTitle>

                <CardDescription>
                  Connect GitHub repositories to start building your code knowledge base.
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

        {/* Workspace */}

        <section className="space-y-4">
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
              <StatusRow
                label="Ready"
                value={readyCount}
              />

              <StatusRow
                label="Indexing"
                value={indexingCount}
              />

              <StatusRow
                label="Pending"
                value={pendingCount}
              />

              <StatusRow
                label="Failed"
                value={failedCount}
                destructive={
                  failedCount > 0
                }
              />

              <div className="mt-5 rounded-xl border border-dashed bg-muted/20 p-4">
                <div className="flex items-center gap-2">
                  <MessageSquareCode className="size-4 text-primary" />

                  <span className="text-sm font-medium">
                    AI-ready code
                  </span>
                </div>

                <p className="mt-2 text-xs leading-5 text-muted-foreground">
                  {readyCount} repositories are currently available for AI-powered code conversations.
                </p>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
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
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <CardDescription>
              {label}
            </CardDescription>

            <CardTitle className="mt-1 text-2xl">
              {value}
            </CardTitle>
          </div>

          <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Icon className="size-4" />
          </div>
        </div>
      </CardHeader>

      <CardContent className="text-xs text-muted-foreground">
        {hint}
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