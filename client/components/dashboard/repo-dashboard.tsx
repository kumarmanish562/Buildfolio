"use client";

import { useMemo, useState } from "react";

import {
  FolderGit2,
  Plus,
  Sparkles,
} from "lucide-react";

import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { RepoCard } from "@/components/dashboard/repo-card";

import { Button } from "@/components/ui/button";

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

import { Skeleton } from "@/components/ui/skeleton";

import {
  useRefreshRepos,
  useRepos,
} from "@/hooks/use-repos";

import type { IndexStatus } from "@/lib/api";

type FilterStatus =
  | "ALL"
  | IndexStatus;

export function RepoDashboard() {
  const reposQuery = useRepos();
  const refresh = useRefreshRepos();

  const [search, setSearch] =
    useState("");

  const [status, setStatus] =
    useState<FilterStatus>("ALL");

  const [visibility, setVisibility] =
    useState<
      "all" | "public" | "private"
    >("all");

  const filtered = useMemo(() => {
    const list =
      reposQuery.data ?? [];

    const query =
      search.trim().toLowerCase();

    return list.filter((repo) => {
      if (
        status !== "ALL" &&
        repo.indexStatus !== status
      ) {
        return false;
      }

      if (
        visibility === "private" &&
        !repo.isPrivate
      ) {
        return false;
      }

      if (
        visibility === "public" &&
        repo.isPrivate
      ) {
        return false;
      }

      if (!query) {
        return true;
      }

      return (
        repo.fullName
          .toLowerCase()
          .includes(query) ||
        (repo.description ?? "")
          .toLowerCase()
          .includes(query) ||
        (repo.language ?? "")
          .toLowerCase()
          .includes(query)
      );
    });
  }, [
    reposQuery.data,
    search,
    status,
    visibility,
  ]);

  const readyCount =
    reposQuery.data?.filter(
      (repo) =>
        repo.indexStatus === "READY"
    ).length ?? 0;

  const totalChunks =
    reposQuery.data?.reduce(
      (sum, repo) =>
        sum + repo.chunkCount,
      0
    ) ?? 0;

  return (
    <div className="flex min-h-full flex-col">
      <DashboardHeader
        search={search}
        onSearchChange={setSearch}
        visibility={visibility}
        onVisibilityChange={
          setVisibility
        }
        status={status}
        onStatusChange={setStatus}
        totalCount={
          reposQuery.data?.length
        }
        readyCount={readyCount}
        onSync={() =>
          refresh.mutate()
        }
        isSyncing={
          refresh.isPending ||
          reposQuery.isFetching
        }
      />

      <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
        {/* Summary */}

        {!reposQuery.isLoading &&
          reposQuery.isSuccess && (
            <div className="grid gap-3 sm:grid-cols-3">
              <MiniStat
                label="Repositories"
                value={
                  reposQuery.data.length
                }
              />

              <MiniStat
                label="Ready to chat"
                value={readyCount}
              />

              <MiniStat
                label="Indexed chunks"
                value={totalChunks}
              />
            </div>
          )}

        {/* Loading */}

        {reposQuery.isLoading && (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({
              length: 6,
            }).map((_, index) => (
              <Skeleton
                key={index}
                className="h-80 rounded-2xl"
              />
            ))}
          </div>
        )}

        {/* Error */}

        {reposQuery.isError && (
          <Empty className="border border-dashed">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <FolderGit2 />
              </EmptyMedia>

              <EmptyTitle>
                Could not load repositories
              </EmptyTitle>

              <EmptyDescription>
                {
                  (
                    reposQuery.error as Error
                  ).message
                }
              </EmptyDescription>
            </EmptyHeader>

            <Button
              onClick={() =>
                void reposQuery.refetch()
              }
            >
              Try again
            </Button>
          </Empty>
        )}

        {/* Empty */}

        {reposQuery.isSuccess &&
          filtered.length === 0 && (
            <Empty className="min-h-72 border border-dashed">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  {search ||
                  status !== "ALL" ||
                  visibility !== "all" ? (
                    <FolderGit2 />
                  ) : (
                    <Sparkles />
                  )}
                </EmptyMedia>

                <EmptyTitle>
                  {search ||
                  status !== "ALL" ||
                  visibility !== "all"
                    ? "No repositories match"
                    : "Connect your repositories"}
                </EmptyTitle>

                <EmptyDescription>
                  {search ||
                  status !== "ALL" ||
                  visibility !== "all"
                    ? "Try changing your filters or search."
                    : "Sync your GitHub repositories to start indexing and chatting with your code."}
                </EmptyDescription>
              </EmptyHeader>

              {reposQuery.data.length ===
                0 && (
                <Button
                  onClick={() =>
                    refresh.mutate()
                  }
                  disabled={
                    refresh.isPending
                  }
                >
                  <Plus data-icon="inline-start" />
                  Sync GitHub
                </Button>
              )}
            </Empty>
          )}

        {/* Repository grid */}

        {reposQuery.isSuccess &&
          filtered.length > 0 && (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {filtered.map(
                (repo) => (
                  <RepoCard
                    key={repo.id}
                    repo={repo}
                  />
                )
              )}
            </div>
          )}
      </div>
    </div>
  );
}

function MiniStat({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border bg-card px-5 py-4">
      <p className="text-xs font-medium text-muted-foreground">
        {label}
      </p>

      <p className="mt-1 text-2xl font-semibold tracking-tight">
        {value.toLocaleString()}
      </p>
    </div>
  );
}