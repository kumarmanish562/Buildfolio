"use client";

import {
  Bot,
  Check,
  Copy,
  UserRound,
} from "lucide-react";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  ChatMarkdown,
} from "@/components/chat/chat-markdown";

import {
  ChatSuggestions,
} from "@/components/chat/chat-suggestions";

import {
  CitationChips,
} from "@/components/chat/citation-chips";

import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar";

import {
  Button,
} from "@/components/ui/button";

import {
  Bubble,
  BubbleContent,
} from "@/components/ui/bubble";

import {
  Message,
  MessageAvatar,
  MessageContent,
  MessageFooter,
  MessageGroup,
} from "@/components/ui/message";

import {
  ScrollArea,
} from "@/components/ui/scroll-area";

import {
  Skeleton,
} from "@/components/ui/skeleton";

import type {
  ChatMessage,
  Repository,
} from "@/lib/api";

import {
  cn,
} from "@/lib/utils";

export function ChatMessages({
  repo,
  messages,
  streamText,
  isLoading,
  onSuggestion,
}: {
  repo: Repository;
  messages: ChatMessage[];
  streamText?: string;
  isLoading?: boolean;
  onSuggestion?: (
    value: string
  ) => void;
}) {
  const bottomRef =
    useRef<HTMLDivElement>(
      null
    );

  useEffect(() => {
    bottomRef.current?.scrollIntoView(
      {
        behavior: "smooth",
      }
    );
  }, [
    messages,
    streamText,
  ]);

  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col gap-5 p-6">
        <Skeleton className="h-20 w-2/3 rounded-2xl" />
        <Skeleton className="ml-auto h-14 w-1/2 rounded-2xl" />
        <Skeleton className="h-28 w-3/4 rounded-2xl" />
      </div>
    );
  }

  const empty =
    messages.length === 0 &&
    !streamText;

  return (
    <ScrollArea className="flex-1">
      <div className="mx-auto flex min-h-full w-full max-w-4xl flex-col px-4 py-6 sm:px-6">

        {empty ? (
          <div className="flex flex-1 flex-col items-center justify-center py-10">

            <div className="mb-5 flex size-14 items-center justify-center rounded-2xl border bg-card shadow-sm">
              <Bot className="size-7 text-primary" />
            </div>

            <h2 className="text-center text-xl font-semibold tracking-tight">
              Ask about your codebase
            </h2>

            <p className="mt-2 max-w-lg text-center text-sm leading-relaxed text-muted-foreground">
              Ask questions about architecture,
              authentication, APIs, files,
              database flows, or implementation details.
            </p>

            {onSuggestion && (
              <div className="mt-8 w-full">
                <ChatSuggestions
                  onSelect={onSuggestion}
                />
              </div>
            )}

          </div>
        ) : (
          <MessageGroup>

            {messages.map(
              (message) => {
                const isUser =
                  message.role ===
                  "USER";

                return (
                  <ChatMessageItem
                    key={message.id}
                    message={message}
                    repo={repo}
                    isUser={isUser}
                  />
                );
              }
            )}

            {streamText && (
              <Message align="start">

                <MessageAvatar>
                  <Avatar className="size-8">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      <Bot className="size-4" />
                    </AvatarFallback>
                  </Avatar>
                </MessageAvatar>

                <MessageContent>
                  <Bubble
                    variant="muted"
                    align="start"
                    className="max-w-full"
                  >
                    <BubbleContent className="w-full max-w-full px-4 py-3">
                      <ChatMarkdown
                        content={
                          streamText
                        }
                        isStreaming
                      />

                      <span className="ml-1 inline-block h-4 w-1.5 animate-pulse rounded-sm bg-primary/60 align-middle" />
                    </BubbleContent>
                  </Bubble>
                </MessageContent>

              </Message>
            )}

          </MessageGroup>
        )}

        <div ref={bottomRef} />

      </div>
    </ScrollArea>
  );
}

function ChatMessageItem({
  message,
  repo,
  isUser,
}: {
  message: ChatMessage;
  repo: Repository;
  isUser: boolean;
}) {
  return (
    <Message
      align={
        isUser
          ? "end"
          : "start"
      }
    >
      <MessageAvatar>
        <Avatar className="size-8">
          <AvatarFallback
            className={cn(
              isUser
                ? "bg-primary text-primary-foreground"
                : "bg-primary/10 text-primary"
            )}
          >
            {isUser ? (
              <UserRound className="size-4" />
            ) : (
              <Bot className="size-4" />
            )}
          </AvatarFallback>
        </Avatar>
      </MessageAvatar>

      <MessageContent>

        <Bubble
          variant={
            isUser
              ? "default"
              : "muted"
          }
          align={
            isUser
              ? "end"
              : "start"
          }
          className={cn(
            isUser
              ? "max-w-[85%]"
              : "max-w-full"
          )}
        >
          <BubbleContent
            className={cn(
              !isUser &&
                "w-full max-w-full px-4 py-3"
            )}
          >
            {isUser ? (
              <span className="whitespace-pre-wrap">
                {message.content}
              </span>
            ) : (
              <ChatMarkdown
                content={
                  message.content
                }
              />
            )}
          </BubbleContent>
        </Bubble>

        {!isUser &&
          message.citations?.length >
            0 && (
            <MessageFooter>
              <CitationChips
                repo={repo}
                citations={
                  message.citations
                }
              />
            </MessageFooter>
          )}

        {!isUser && (
          <CopyMessageButton
            content={
              message.content
            }
          />
        )}

      </MessageContent>
    </Message>
  );
}

function CopyMessageButton({
  content,
}: {
  content: string;
}) {
  const [
    copied,
    setCopied,
  ] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(
      content
    );

    setCopied(true);

    setTimeout(
      () =>
        setCopied(false),
      1500
    );
  }

  return (
    <Button
      variant="ghost"
      size="icon-xs"
      className="mt-1 opacity-50 hover:opacity-100"
      onClick={() =>
        void copy()
      }
      aria-label="Copy response"
    >
      {copied ? (
        <Check className="size-3" />
      ) : (
        <Copy className="size-3" />
      )}
    </Button>
  );
}