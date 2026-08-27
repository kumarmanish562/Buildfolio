"use client";

import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  RotateCcw,
} from "lucide-react";

import {
  Button,
} from "@/components/ui/button";

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

import {
  Progress,
} from "@/components/ui/progress";

import {
  getRepoProgress,
  useStartIndexing,
} from "@/hooks/use-repos";

import type {
  IndexStatusResponse,
  Repository,
} from "@/lib/api";

export function IndexingState({
  repo,
  status,
}: {
  repo: Repository;
  status?: IndexStatusResponse;
}) {
  const indexMutation =
    useStartIndexing();

  const filesProcessed =
    status?.filesProcessed ??
    repo.filesProcessed;

  const filesTotal =
    status?.filesTotal ??
    repo.filesTotal;

  const chunkCount =
    status?.chunkCount ??
    repo.chunkCount;

  const progress =
    getRepoProgress({
      filesProcessed,
      filesTotal,
    });

  const indexStatus =
    status?.indexStatus ??
    repo.indexStatus;

  const errorMessage =
    status?.errorMessage ??
    repo.errorMessage;

  if (
    indexStatus ===
    "FAILED"
  ) {
    return (
      <Empty className="h-full border-0 px-6">

        <EmptyHeader>

          <EmptyMedia variant="icon">
            <AlertCircle className="text-destructive" />
          </EmptyMedia>

          <EmptyTitle>
            Indexing failed
          </EmptyTitle>

          <EmptyDescription className="max-w-md">
            {errorMessage ||
              "Something went wrong while preparing this repository."}
          </EmptyDescription>

        </EmptyHeader>

        <Button
          onClick={() =>
            indexMutation.mutate(
              repo.id
            )
          }
          disabled={
            indexMutation.isPending
          }
        >
          <RotateCcw data-icon="inline-start" />

          {indexMutation.isPending
            ? "Retrying..."
            : "Retry indexing"}
        </Button>

      </Empty>
    );
  }

  if (
    indexStatus ===
    "READY"
  ) {
    return (
      <Empty className="h-full border-0">

        <EmptyHeader>

          <EmptyMedia variant="icon">
            <CheckCircle2 className="text-primary" />
          </EmptyMedia>

          <EmptyTitle>
            Repository ready
          </EmptyTitle>

          <EmptyDescription>
            Your repository has been indexed and is ready for AI-powered questions.
          </EmptyDescription>

        </EmptyHeader>

      </Empty>
    );
  }

  return (
    <Empty className="h-full border-0 px-6">

      <EmptyHeader>

        <EmptyMedia variant="icon">
          <Loader2 className="animate-spin" />
        </EmptyMedia>

        <EmptyTitle>
          Preparing {repo.fullName}
        </EmptyTitle>

        <EmptyDescription className="max-w-md">
          BuildFolio is reading your repository,
          splitting source files into searchable
          chunks, and preparing them for AI search.
        </EmptyDescription>

      </EmptyHeader>

      <div className="w-full max-w-md space-y-4">

        <Progress
          value={
            filesTotal
              ? progress
              : 12
          }
        />

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            {filesTotal > 0
              ? `${filesProcessed} / ${filesTotal} files`
              : "Scanning files..."}
          </span>

          <span>
            {chunkCount.toLocaleString()} chunks
          </span>
        </div>

        <p className="text-center text-xs text-muted-foreground">
          You can leave this page open.
          Chat will unlock automatically when indexing finishes.
        </p>

      </div>

    </Empty>
  );
}