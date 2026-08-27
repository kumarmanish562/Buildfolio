"use client";

import Link from "next/link";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  ArrowLeft,
  GitBranch,
} from "lucide-react";

import {
  ChatComposer,
} from "@/components/chat/chat-composer";

import {
  ChatMessages,
} from "@/components/chat/chat-messages";

import {
  ChatSidebar,
} from "@/components/chat/chat-sidebar";

import {
  IndexingState,
} from "@/components/chat/indexing-state";

import {
  AppShell,
} from "@/components/layout/app-shell";

import {
  Button,
} from "@/components/ui/button";

import {
  Skeleton,
} from "@/components/ui/skeleton";

import {
  useChatMessages,
  useChatSessions,
  useCreateChatSession,
  useStreamChat,
} from "@/hooks/use-chat";

import {
  useIndexStatus,
  useRepository,
} from "@/hooks/use-repos";

export function ChatView({
  repoId,
}: {
  repoId: string;
}) {
  const repoQuery =
    useRepository(
      repoId
    );

  const isIndexing =
    repoQuery.data
      ?.indexStatus ===
    "INDEXING";

  const statusQuery =
    useIndexStatus(
      repoId,
      isIndexing ||
        repoQuery.data
          ?.indexStatus ===
          "PENDING"
    );

  const indexStatus =
    statusQuery.data
      ?.indexStatus ??
    repoQuery.data
      ?.indexStatus;

  const ready =
    indexStatus ===
    "READY";

  const sessionsQuery =
    useChatSessions(
      repoId,
      ready
    );

  const createSession =
    useCreateChatSession(
      repoId
    );

  const [
    selectedSessionId,
    setSelectedSessionId,
  ] = useState<
    string | null
  >(null);

  const autoCreateRef =
    useRef(false);

  const sessionId =
    selectedSessionId ??
    sessionsQuery.data?.[0]
      ?.id ??
    null;

  const messagesQuery =
    useChatMessages(
      sessionId
    );

  const {
    send,
    stop,
    streaming,
    streamText,
  } = useStreamChat(
    sessionId
  );

  useEffect(() => {
    if (
      !ready ||
      sessionsQuery.isLoading
    ) {
      return;
    }

    if (
      sessionsQuery.data &&
      sessionsQuery.data.length >
        0
    ) {
      return;
    }

    if (
      !sessionsQuery.isSuccess ||
      autoCreateRef.current
    ) {
      return;
    }

    autoCreateRef.current =
      true;

    createSession.mutate(
      undefined,
      {
        onSuccess:
          (session) =>
            setSelectedSessionId(
              session.id
            ),

        onError: () => {
          autoCreateRef.current =
            false;
        },
      }
    );
  }, [
    ready,
    sessionsQuery.isLoading,
    sessionsQuery.isSuccess,
    sessionsQuery.data,
    createSession,
  ]);

  if (repoQuery.isLoading) {
    return (
      <AppShell title="Loading workspace…">
        <div className="grid flex-1 gap-4 p-4 md:grid-cols-[18rem_1fr]">
          <Skeleton className="min-h-80 rounded-2xl" />
          <Skeleton className="min-h-80 rounded-2xl" />
        </div>
      </AppShell>
    );
  }

  if (
    repoQuery.isError ||
    !repoQuery.data
  ) {
    return (
      <AppShell title="Repository unavailable">
        <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8">

          <div className="flex size-12 items-center justify-center rounded-2xl bg-muted">
            <GitBranch className="size-5" />
          </div>

          <div className="text-center">
            <h2 className="font-semibold">
              Repository unavailable
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              {(repoQuery.error as Error)
                ?.message ??
                "Repository not found"}
            </p>
          </div>

          <Button
            render={
              <Link href="/dashboard" />
            }
          >
            Back to repositories
          </Button>

        </div>
      </AppShell>
    );
  }

  const repo =
    repoQuery.data;

  return (
    <AppShell
      title={repo.fullName}
      description={
        ready
          ? "AI-powered repository intelligence"
          : "Preparing your repository"
      }
      actions={
        <Button
          variant="outline"
          size="sm"
          render={
            <Link href="/dashboard" />
          }
        >
          <ArrowLeft data-icon="inline-start" />
          Repositories
        </Button>
      }
    >
      <div className="flex min-h-0 flex-1 flex-col md:flex-row">

        <ChatSidebar
          repo={{
            ...repo,
            indexStatus:
              indexStatus ??
              repo.indexStatus,

            filesProcessed:
              statusQuery.data
                ?.filesProcessed ??
              repo.filesProcessed,

            filesTotal:
              statusQuery.data
                ?.filesTotal ??
              repo.filesTotal,

            chunkCount:
              statusQuery.data
                ?.chunkCount ??
              repo.chunkCount,

            errorMessage:
              statusQuery.data
                ?.errorMessage ??
              repo.errorMessage,
          }}
          sessionId={
            sessionId
          }
          onSelectSession={
            setSelectedSessionId
          }
        />

        <section className="flex min-h-[70vh] min-w-0 flex-1 flex-col bg-background">

          {!ready ? (
            <IndexingState
              repo={repo}
              status={
                statusQuery.data
              }
            />
          ) : (
            <>
              <ChatMessages
                repo={repo}
                messages={
                  messagesQuery.data ??
                  []
                }
                streamText={
                  streamText
                }
                isLoading={
                  messagesQuery.isLoading
                }
                onSuggestion={
                  send
                }
              />

              <ChatComposer
                disabled={
                  !sessionId
                }
                streaming={
                  streaming
                }
                onSend={send}
                onStop={stop}
              />
            </>
          )}

        </section>

      </div>
    </AppShell>
  );
}