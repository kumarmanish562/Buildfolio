"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  AlertTriangle,
  ArrowLeft,
  ArrowUpRight,
  Database,
  FileCode2,
  GitBranch,
  Lock,
  MessageSquare,
  RefreshCw,
  Search,
  Sparkles,
  Trash2,
} from "lucide-react";

import { GitHubIcon } from "@/components/icons/github-icon";

import {
  getRepoProgress,
  useDeleteRepository,
  useIndexStatus,
  useRepository,
  useStartIndexing,
} from "@/hooks/use-repos";

import { IndexStatusBadge } from "@/components/dashboard/repo-status";
import { LanguageBadge } from "@/components/dashboard/language-badge";
import { IndexErrorAlert } from "@/components/dashboard/index-error-alert";
import { AppShell } from "@/components/layout/app-shell";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

/* ================================================================
   Repository Details
================================================================ */

export function RepositoryDetails({
  repoId,
}: {
  repoId: string;
}) {
  const router = useRouter();

  const repoQuery = useRepository(repoId);

  const repo = repoQuery.data;

  const statusQuery = useIndexStatus(
    repoId,
    repo?.indexStatus === "INDEXING" ||
      repo?.indexStatus === "PENDING"
  );

  const indexMutation = useStartIndexing();

  const deleteMutation = useDeleteRepository();

  /* ================================================================
     Loading
  ================================================================= */

  if (repoQuery.isLoading) {
    return (
      <AppShell title="Repository">
        <div className="space-y-6 p-4 md:p-6">
          <Skeleton className="h-40 rounded-3xl" />

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Skeleton className="h-28 rounded-2xl" />
            <Skeleton className="h-28 rounded-2xl" />
            <Skeleton className="h-28 rounded-2xl" />
            <Skeleton className="h-28 rounded-2xl" />
          </div>

          <Skeleton className="h-72 rounded-2xl" />
        </div>
      </AppShell>
    );
  }

  /* ================================================================
     Error / Not Found
  ================================================================= */

  if (repoQuery.isError || !repo) {
    return (
      <AppShell title="Repository unavailable">
        <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 p-8 text-center">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-muted">
            <Database className="size-5 text-muted-foreground" />
          </div>

          <div>
            <h2 className="font-heading text-lg font-semibold">
              Repository not found
            </h2>

            <p className="mt-1 max-w-md text-sm text-muted-foreground">
              {(repoQuery.error as Error)?.message ??
                "This repository could not be loaded."}
            </p>
          </div>

          <Button render={<Link href="/dashboard" />}>
            <ArrowLeft data-icon="inline-start" />
            Back to repositories
          </Button>
        </div>
      </AppShell>
    );
  }

  /* ================================================================
     Current Index Status
  ================================================================= */

  const indexStatus =
    statusQuery.data?.indexStatus ??
    repo.indexStatus;

  const filesTotal =
    statusQuery.data?.filesTotal ??
    repo.filesTotal;

  const filesProcessed =
    statusQuery.data?.filesProcessed ??
    repo.filesProcessed;

  const chunkCount =
    statusQuery.data?.chunkCount ??
    repo.chunkCount;

  const errorMessage =
    statusQuery.data?.errorMessage ??
    repo.errorMessage;

  const progress = getRepoProgress({
    filesTotal,
    filesProcessed,
  });

  const ready = indexStatus === "READY";

  const indexing = indexStatus === "INDEXING";

  /* ================================================================
     Start / Retry / Re-index
  ================================================================= */

  function handleIndexing() {
    if (!repo) return;

    indexMutation.mutate(repo.id);
  }

  /* ================================================================
     Delete Repository
  ================================================================= */

  function handleDeleteRepository() {
    if (!repo) return;

    const confirmed = window.confirm(
      `Remove ${repo.fullName} from BuildFolio?\n\n` +
        "This will remove the repository and its indexed " +
        "data from BuildFolio."
    );

    if (!confirmed) {
      return;
    }

    deleteMutation.mutate(repo.id, {
      onSuccess: () => {
        router.push("/dashboard");
      },
    });
  }

  /* ================================================================
     UI
  ================================================================= */

  return (
    <AppShell
      title={repo.name}
      description={repo.fullName}
      actions={
        <Button
          variant="outline"
          size="sm"
          render={<Link href="/dashboard" />}
        >
          <ArrowLeft data-icon="inline-start" />
          Repositories
        </Button>
      }
    >
      <div className="mx-auto w-full max-w-6xl space-y-6 p-4 md:p-6">

        {/* ==========================================================
            HERO
        =========================================================== */}

        <section className="relative overflow-hidden rounded-3xl border bg-card shadow-sm">

          {/* Background glow */}

          <div className="pointer-events-none absolute -right-20 -top-20 size-72 rounded-full bg-primary/10 blur-3xl" />

          <div className="relative p-6 md:p-8">

            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">

              {/* Repository information */}

              <div className="flex min-w-0 items-start gap-4">

                <LanguageBadge
                  language={repo.language}
                  showLabel={false}
                  iconSize="lg"
                />

                <div className="min-w-0">

                  <div className="flex flex-wrap items-center gap-2">

                    <h1 className="font-heading text-2xl font-bold tracking-tight">
                      {repo.name}
                    </h1>

                    <IndexStatusBadge
                      status={indexStatus}
                    />

                    {repo.isPrivate && (
                      <span className="inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs text-muted-foreground">
                        <Lock className="size-3" />
                        Private
                      </span>
                    )}

                  </div>

                  <p className="mt-1 font-mono text-xs text-muted-foreground">
                    {repo.fullName}
                  </p>

                  <p className="mt-4 max-w-2xl text-sm leading-6 text-muted-foreground">
                    {repo.description ||
                      "No description provided for this repository."}
                  </p>

                </div>

              </div>

              {/* Actions */}

              <div className="flex flex-wrap gap-2">

                {repo.htmlUrl && (
                  <Button
                    variant="outline"
                    render={
                      <a
                        href={repo.htmlUrl}
                        target="_blank"
                        rel="noreferrer"
                      />
                    }
                  >
                    <GitHubIcon className="size-4" />

                    GitHub

                    <ArrowUpRight
                      data-icon="inline-end"
                    />
                  </Button>
                )}

                {ready && (
                  <Button
                    render={
                      <Link
                        href={`/chat/${repo.id}`}
                      />
                    }
                  >
                    <MessageSquare
                      data-icon="inline-start"
                    />

                    Open Chat
                  </Button>
                )}

              </div>

            </div>

            <Separator className="my-6" />

            {/* Repository metadata */}

            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-xs text-muted-foreground">

              <span className="inline-flex items-center gap-1.5">
                <GitBranch className="size-3.5" />
                {repo.defaultBranch}
              </span>

              {repo.language && (
                <span className="inline-flex items-center gap-1.5">
                  <FileCode2 className="size-3.5" />
                  {repo.language}
                </span>
              )}

              <span className="inline-flex items-center gap-1.5">
                <Database className="size-3.5" />
                {chunkCount.toLocaleString()} chunks
              </span>

              <span className="inline-flex items-center gap-1.5">
                <Search className="size-3.5" />
                {filesProcessed.toLocaleString()} files processed
              </span>

            </div>

          </div>

        </section>

        {/* ==========================================================
            STATISTICS
        =========================================================== */}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          <Stat
            icon={FileCode2}
            label="Repository files"
            value={filesTotal}
          />

          <Stat
            icon={Search}
            label="Files processed"
            value={filesProcessed}
          />

          <Stat
            icon={Database}
            label="Vector chunks"
            value={chunkCount}
          />

          <Stat
            icon={Sparkles}
            label="Index progress"
            value={`${progress}%`}
          />

        </div>

        {/* ==========================================================
            INDEXING
        =========================================================== */}

        <section className="rounded-2xl border bg-card p-6">

          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

            <div className="flex gap-3">

              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Database className="size-5" />
              </div>

              <div>

                <h2 className="font-semibold">
                  Repository indexing
                </h2>

                <p className="mt-1 max-w-xl text-sm text-muted-foreground">
                  BuildFolio indexes your repository and
                  converts code into searchable vector
                  embeddings for AI-powered chat.
                </p>

              </div>

            </div>

            <Button
              variant={
                indexStatus === "FAILED"
                  ? "destructive"
                  : "outline"
              }
              disabled={
                indexMutation.isPending ||
                indexing
              }
              onClick={handleIndexing}
            >

              <RefreshCw
                data-icon="inline-start"
                className={
                  indexing ||
                  indexMutation.isPending
                    ? "animate-spin"
                    : undefined
                }
              />

              {indexing
                ? "Indexing..."
                : indexStatus === "READY"
                  ? "Re-index"
                  : indexStatus === "FAILED"
                    ? "Retry indexing"
                    : "Start indexing"}

            </Button>

          </div>

          {/* Progress */}

          <div className="mt-6 space-y-3">

            <div className="flex items-center justify-between text-xs">

              <span className="text-muted-foreground">
                Indexing progress
              </span>

              <span className="font-medium">
                {filesProcessed} /{" "}
                {filesTotal || "?"} files
              </span>

            </div>

            <Progress
              value={
                indexing
                  ? Math.max(progress, 8)
                  : progress
              }
            />

            <div className="flex items-center justify-between text-xs text-muted-foreground">

              <span>
                {chunkCount.toLocaleString()} chunks
              </span>

              <span>
                {progress}%
              </span>

            </div>

          </div>

          {/* Error */}

          {indexStatus === "FAILED" &&
            errorMessage && (
              <div className="mt-5">
                <IndexErrorAlert
                  message={errorMessage}
                />
              </div>
            )}

        </section>

        {/* ==========================================================
            CHAT CTA
        =========================================================== */}

        {ready && (
          <section className="relative overflow-hidden rounded-2xl border bg-card">

            <div className="pointer-events-none absolute -right-10 -top-20 size-60 rounded-full bg-primary/10 blur-3xl" />

            <div className="relative flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between">

              <div className="flex gap-3">

                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <MessageSquare className="size-5" />
                </div>

                <div>

                  <h2 className="font-semibold">
                    Chat with this repository
                  </h2>

                  <p className="mt-1 max-w-xl text-sm text-muted-foreground">
                    Ask questions about architecture,
                    authentication, APIs, files, database
                    flows, and implementation details.
                  </p>

                </div>

              </div>

              <Button
                render={
                  <Link
                    href={`/chat/${repo.id}`}
                  />
                }
              >
                Open AI Chat

                <ArrowUpRight
                  data-icon="inline-end"
                />
              </Button>

            </div>

          </section>
        )}

        {/* ==========================================================
            DANGER ZONE
        =========================================================== */}

        <section className="rounded-2xl border border-destructive/20 bg-destructive/3 p-6">

          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

            <div className="flex gap-3">

              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
                <AlertTriangle className="size-5" />
              </div>

              <div>

                <h2 className="font-semibold">
                  Danger zone
                </h2>

                <p className="mt-1 max-w-xl text-sm text-muted-foreground">
                  Remove{" "}
                  <span className="font-medium text-foreground">
                    {repo.fullName}
                  </span>{" "}
                  from BuildFolio. This also removes its
                  indexed vector data.
                </p>

              </div>

            </div>

            <Button
              variant="destructive"
              disabled={deleteMutation.isPending}
              onClick={handleDeleteRepository}
            >

              <Trash2
                data-icon="inline-start"
              />

              {deleteMutation.isPending
                ? "Removing..."
                : "Remove repository"}

            </Button>

          </div>

        </section>

      </div>
    </AppShell>
  );
}

/* ================================================================
   STAT CARD
================================================================ */

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Database;
  label: string;
  value: number | string;
}) {
  return (
    <div className="rounded-2xl border bg-card p-5 shadow-sm">

      <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Icon className="size-4" />
      </div>

      <p className="mt-4 text-2xl font-semibold tracking-tight">
        {typeof value === "number"
          ? value.toLocaleString()
          : value}
      </p>

      <p className="mt-1 text-xs text-muted-foreground">
        {label}
      </p>

    </div>
  );
}