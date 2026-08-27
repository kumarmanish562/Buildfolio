"use client";

import {
  ArrowUp,
  Square,
} from "lucide-react";

import { useState } from "react";

import {
  Button,
} from "@/components/ui/button";

import {
  Textarea,
} from "@/components/ui/textarea";

import {
  Kbd,
} from "@/components/ui/kbd";

import {
  Spinner,
} from "@/components/ui/spinner";

export function ChatComposer({
  disabled,
  streaming,
  onSend,
  onStop,
}: {
  disabled?: boolean;
  streaming?: boolean;
  onSend: (
    content: string
  ) => void | Promise<void>;
  onStop?: () => void;
}) {
  const [
    value,
    setValue,
  ] = useState("");

  async function submit() {
    const content =
      value.trim();

    if (
      !content ||
      disabled ||
      streaming
    ) {
      return;
    }

    setValue("");

    await onSend(content);
  }

  return (
    <div className="border-t bg-background/80 px-3 py-3 backdrop-blur-xl sm:px-4">
      <div className="mx-auto w-full max-w-4xl">

        <div className="relative rounded-2xl border bg-card shadow-lg shadow-foreground-[0.04] transition-all focus-within:border-foreground/20 focus-within:shadow-xl">

          <Textarea
            value={value}
            onChange={(event) =>
              setValue(
                event.target.value
              )
            }
            disabled={disabled}
            placeholder="Ask anything about this codebase..."
            className="min-h-18 resize-none border-0 bg-transparent px-4 py-4 pr-14 text-sm shadow-none focus-visible:ring-0"
            onKeyDown={(event) => {
              if (
                event.key === "Enter" &&
                !event.shiftKey
              ) {
                event.preventDefault();
                void submit();
              }
            }}
          />

          <div className="absolute right-3 bottom-3">

            {streaming ? (
              <Button
                size="icon"
                variant="secondary"
                onClick={onStop}
                className="rounded-xl"
                aria-label="Stop generating"
              >
                <Square className="size-4" />
              </Button>
            ) : (
              <Button
                size="icon"
                disabled={
                  disabled ||
                  !value.trim()
                }
                onClick={() =>
                  void submit()
                }
                className="rounded-xl"
                aria-label="Send message"
              >
                {disabled ? (
                  <Spinner />
                ) : (
                  <ArrowUp className="size-4" />
                )}
              </Button>
            )}

          </div>
        </div>

        <div className="flex items-center justify-between px-2 pt-2">
          <p className="text-[11px] text-muted-foreground">
            BuildFolio AI can make mistakes.
            Verify important code changes.
          </p>

          <p className="hidden text-[11px] text-muted-foreground sm:block">
            <Kbd>Enter</Kbd>
            {" "}send ·{" "}
            <Kbd>Shift</Kbd>
            {" "}new line
          </p>
        </div>

      </div>
    </div>
  );
}