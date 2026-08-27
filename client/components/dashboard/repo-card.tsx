"use client";

import { useRouter } from "next/navigation";

import {
  ArrowRight,
  ExternalLink,
  GitBranch,
  Lock,
  MessageSquare,
  RotateCcw,
  Sparkles,
} from "lucide-react";

import { IndexErrorAlert } from "@/components/dashboard/index-error-alert";
import { LanguageBadge } from "@/components/dashboard/language-badge";
import { IndexStatusBadge } from "@/components/dashboard/repo-status";

import { LanguageIcon } from "@/components/icons/language-icon";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Spinner } from "@/components/ui/spinner";

import {
  getRepoProgress,
  useStartIndexing,
} from "@/hooks/use-repos";

import type { Repository } from "@/lib/api";
import { cn } from "@/lib/utils";

export function RepoCard({
  repo,
}: {
  repo: Repository;
}) {
  const router = useRouter();

  const indexMutation = useStartIndexing();

  const isIndexing =
    repo.indexStatus === "INDEXING" ||
    indexMutation.isPending;

  const isFailed =
    repo.indexStatus === "FAILED";

  const progress = getRepoProgress(repo);

  function openChat() {
    router.push(`/chat/${repo.id}`);
  }

  function openRepository() {
    router.push(`/dashboard/repos/${repo.id}`);
  }

  function handlePrimary() {
    if (repo.indexStatus === "READY") {
      openChat();
      return;
    }

    indexMutation.mutate(repo.id, {
      onSuccess: () => {
        router.push(`/chat/${repo.id}`);
      },
    });
  }

  return (
    <article
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-2xl border bg-card",
        "transition-all duration-200",
        "hover:-translate-y-0.5 hover:shadow-xl hover:shadow-foreground/6",
        isFailed
          ? "border-destructive/30"
          : "border-border/70 hover:border-primary/30"
      )}
    >
      {/* Accent line */}

      <div
        className={cn(
          "absolute inset-x-0 top-0 h-0.5",
          isFailed
            ? "bg-destructive"
            : repo.indexStatus === "READY"
              ? "bg-primary"
              : "bg-border"
        )}
      />

      {/* Header */}

      <div className="flex items-start justify-between gap-3 border-b p-5">
        <button
          type="button"
          onClick={openRepository}
          className="flex min-w-0 items-start gap-3 text-left"
        >
          <LanguageBadge
            language={repo.language}
            showLabel={false}
            iconSize="lg"
          />

          <div className="min-w-0">
            <p className="truncate text-xs text-muted-foreground">
              {repo.owner}
            </p>

            <h3 className="mt-0.5 truncate font-semibold transition-colors group-hover:text-primary">
              {repo.name}
            </h3>
          </div>
        </button>

        <IndexStatusBadge
          status={repo.indexStatus}
        />
      </div>

      {/* Body */}

      <div className="flex flex-1 flex-col gap-4 p-5">
        <p className="line-clamp-2 min-h-10 text-sm leading-6 text-muted-foreground">
          {repo.description ||
            "No description provided for this repository."}
        </p>

        <div className="flex flex-wrap gap-2">
          {repo.isPrivate && (
            <span className="inline-flex items-center gap-1.5 rounded-full border bg-muted/30 px-2.5 py-1 text-xs text-muted-foreground">
              <Lock className="size-3" />
              Private
            </span>
          )}

          <span className="inline-flex items-center gap-1.5 rounded-full border bg-muted/30 px-2.5 py-1 text-xs text-muted-foreground">
            <GitBranch className="size-3" />
            {repo.defaultBranch}
          </span>

          {repo.language && (
            <span className="inline-flex items-center gap-1.5 rounded-full border bg-muted/30 px-2.5 py-1 text-xs">
              <LanguageIcon
                language={repo.language}
                size="sm"
              />

              {repo.language}
            </span>
          )}
        </div>

        {/* Stats */}

        <div className="grid grid-cols-3 gap-2">
          <RepoStat
            label="Files"
            value={repo.filesTotal}
          />

          <RepoStat
            label="Processed"
            value={repo.filesProcessed}
          />

          <RepoStat
            label="Chunks"
            value={repo.chunkCount}
          />
        </div>

        {/* Indexing */}

        {isIndexing && (
          <div className="space-y-2 rounded-xl border bg-muted/30 p-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">
                Indexing repository
              </span>

              <span className="font-medium">
                {repo.filesProcessed}/
                {repo.filesTotal || "?"}
              </span>
            </div>

            <Progress
              value={progress || 8}
            />
          </div>
        )}

        {/* Error */}

        {isFailed && repo.errorMessage && (
          <IndexErrorAlert
            message={repo.errorMessage}
          />
        )}
      </div>

      {/* Footer */}

      <div className="flex items-center justify-between gap-2 border-t bg-muted/10 p-4">
        {repo.htmlUrl ? (
          <Button
            variant="ghost"
            size="sm"
            render={
              <a
                href={repo.htmlUrl}
                target="_blank"
                rel="noreferrer"
              />
            }
          >
            <ExternalLink data-icon="inline-start" />
            GitHub
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            onClick={openRepository}
          >
            Details
          </Button>
        )}

        <div className="flex gap-2">
          {repo.indexStatus === "READY" && (
            <Button
              variant="secondary"
              size="sm"
              onClick={openChat}
            >
              <MessageSquare data-icon="inline-start" />
              Chat
            </Button>
          )}

          <Button
            size="sm"
            variant={
              isFailed
                ? "outline"
                : "default"
            }
            disabled={isIndexing}
            onClick={handlePrimary}
          >
            {isIndexing ? (
              <>
                <Spinner data-icon="inline-start" />
                Indexing
              </>
            ) : repo.indexStatus === "READY" ? (
              <>
                Open
                <ArrowRight data-icon="inline-end" />
              </>
            ) : isFailed ? (
              <>
                <RotateCcw data-icon="inline-start" />
                Retry
              </>
            ) : (
              <>
                <Sparkles data-icon="inline-start" />
                Index
              </>
            )}
          </Button>
        </div>
      </div>
    </article>
  );
}

function RepoStat({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-xl border bg-muted/20 px-3 py-2.5">
      <p className="text-sm font-semibold">
        {value.toLocaleString()}
      </p>

      <p className="mt-0.5 text-[11px] text-muted-foreground">
        {label}
      </p>
    </div>
  );
}