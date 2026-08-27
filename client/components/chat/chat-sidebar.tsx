"use client";

import {
  MoreHorizontal,
  Plus,
  RotateCcw,
  Trash2,
} from "lucide-react";

import {
  formatDistanceToNow,
} from "date-fns";

import {
  IndexStatusBadge,
} from "@/components/dashboard/repo-status";

import {
  Button,
} from "@/components/ui/button";

import {
  ScrollArea,
} from "@/components/ui/scroll-area";

import {
  Separator,
} from "@/components/ui/separator";

import {
  Skeleton,
} from "@/components/ui/skeleton";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  useChatSessions,
  useCreateChatSession,
  useDeleteChatSession,
} from "@/hooks/use-chat";

import {
  useStartIndexing,
} from "@/hooks/use-repos";

import type {
  Repository,
} from "@/lib/api";

import {
  cn,
} from "@/lib/utils";

export function ChatSidebar({
  repo,
  sessionId,
  onSelectSession,
}: {
  repo: Repository;
  sessionId: string | null;
  onSelectSession: (
    id: string
  ) => void;
}) {
  const ready =
    repo.indexStatus ===
    "READY";

  const sessionsQuery =
    useChatSessions(
      repo.id,
      ready
    );

  const createSession =
    useCreateChatSession(
      repo.id
    );

  const deleteSession =
    useDeleteChatSession(
      repo.id
    );

  const reindex =
    useStartIndexing();

  function createChat() {
    createSession.mutate(
      "New chat",
      {
        onSuccess:
          (session) =>
            onSelectSession(
              session.id
            ),
      }
    );
  }

  return (
    <aside className="flex w-full shrink-0 flex-col border-b bg-muted/1200 md:w-72 md:border-r md:border-b-0">

      {/* Repository */}

      <div className="p-4">

        <div className="flex items-start gap-3">

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">
              {repo.fullName}
            </p>

            <div className="mt-1.5 flex flex-wrap items-center gap-2">
              <IndexStatusBadge
                status={
                  repo.indexStatus
                }
              />

              {repo.isPrivate && (
                <span className="text-xs text-muted-foreground">
                  Private
                </span>
              )}
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() =>
              reindex.mutate(
                repo.id
              )
            }
            disabled={
              reindex.isPending ||
              repo.indexStatus ===
                "INDEXING"
            }
            aria-label="Re-index repository"
          >
            <RotateCcw
              className={cn(
                reindex.isPending &&
                  "animate-spin"
              )}
            />
          </Button>

        </div>

        <Button
          className="mt-4 w-full rounded-xl"
          disabled={
            !ready ||
            createSession.isPending
          }
          onClick={
            createChat
          }
        >
          <Plus data-icon="inline-start" />
          New chat
        </Button>

      </div>

      <Separator />

      <div className="flex items-center justify-between px-4 py-3">

        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Conversations
        </span>

        {sessionsQuery.data && (
          <span className="text-xs text-muted-foreground">
            {sessionsQuery.data.length}
          </span>
        )}

      </div>

      <ScrollArea className="flex-1">
        <div className="space-y-1 px-2 pb-4">

          {!ready && (
            <div className="mx-2 rounded-xl border border-dashed p-3 text-xs leading-relaxed text-muted-foreground">
              Chat becomes available after repository indexing finishes.
            </div>
          )}

          {sessionsQuery.isLoading &&
            Array.from({
              length: 4,
            }).map(
              (_, index) => (
                <Skeleton
                  key={index}
                  className="h-14 rounded-xl"
                />
              )
            )}

          {sessionsQuery.data?.map(
            (session) => (
              <div
                key={session.id}
                className={cn(
                  "group flex items-center gap-1 rounded-xl transition-colors",
                  sessionId ===
                    session.id
                    ? "bg-muted"
                    : "hover:bg-muted/70"
                )}
              >

                <button
                  type="button"
                  onClick={() =>
                    onSelectSession(
                      session.id
                    )
                  }
                  className="min-w-0 flex-1 px-3 py-2.5 text-left"
                >
                  <p className="truncate text-sm font-medium">
                    {session.title}
                  </p>

                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    {formatDistanceToNow(
                      new Date(
                        session.createdAt
                      ),
                      {
                        addSuffix:
                          true,
                      }
                    )}
                  </p>
                </button>

                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        className="mr-1 opacity-0 transition-opacity group-hover:opacity-100"
                      />
                    }
                  >
                    <MoreHorizontal />
                  </DropdownMenuTrigger>

                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      variant="destructive"
                      disabled={
                        deleteSession.isPending
                      }
                      onClick={() =>
                        deleteSession.mutate(
                          session.id
                        )
                      }
                    >
                      <Trash2 />
                      Delete chat
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

              </div>
            )
          )}

          {ready &&
            sessionsQuery.isSuccess &&
            sessionsQuery.data.length ===
              0 && (
              <p className="px-3 py-6 text-center text-xs text-muted-foreground">
                No conversations yet.
              </p>
            )}

        </div>
      </ScrollArea>

    </aside>
  );
}