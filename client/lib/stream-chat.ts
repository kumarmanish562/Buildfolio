import {
  ApiError,
  getApiBaseUrl,
  type ChatMessage,
} from "@/lib/api";

export type StreamChatHandlers = {
  onUserMessage?: (
    message: ChatMessage
  ) => void;

  onToken?: (
    token: string
  ) => void;

  onAssistantMessage?: (
    message: ChatMessage
  ) => void;

  onDone?: () => void;

  onError?: (
    error: Error
  ) => void;

  signal?: AbortSignal;
};

export async function streamChatMessage(
  sessionId: string,
  content: string,
  handlers: StreamChatHandlers = {}
): Promise<void> {
  const res = await fetch(
    `${getApiBaseUrl()}/api/chat/sessions/${sessionId}/messages`,
    {
      method: "POST",

      credentials: "include",

      headers: {
        "Content-Type":
          "application/json",
        Accept:
          "text/event-stream",
      },

      body: JSON.stringify({
        content,
      }),

      signal: handlers.signal,
    }
  );

  if (!res.ok) {
    let message =
      res.statusText ||
      "Request failed";

    try {
      const data =
        await res.json();

      message =
        data.message ??
        data.error ??
        data.detail ??
        message;
    } catch {
      // Ignore JSON parsing errors.
    }

    throw new ApiError(
      res.status,
      message
    );
  }

  if (!res.body) {
    throw new Error(
      "No response body for SSE stream"
    );
  }

  const reader =
    res.body.getReader();

  const decoder =
    new TextDecoder();

  let buffer = "";

  while (true) {
    const {
      done,
      value,
    } = await reader.read();

    if (done) {
      break;
    }

    buffer += decoder.decode(
      value,
      {
        stream: true,
      }
    );

    const parts =
      buffer.split("\n\n");

    buffer =
      parts.pop() ?? "";

    for (const part of parts) {
      processSSEEvent(
        part,
        handlers
      );
    }
  }

  buffer += decoder.decode();

  if (buffer.trim()) {
    processSSEEvent(
      buffer,
      handlers
    );
  }

  handlers.onDone?.();
}

function processSSEEvent(
  part: string,
  handlers: StreamChatHandlers
) {
  if (!part.trim()) {
    return;
  }

  const lines =
    part.split("\n");

  let event =
    "message";

  const dataLines: string[] =
    [];

  for (const line of lines) {
    if (
      line.startsWith(
        "event:"
      )
    ) {
      event =
        line
          .slice(6)
          .trim();
    }

    if (
      line.startsWith(
        "data:"
      )
    ) {
      dataLines.push(
        line
          .slice(5)
          .trimStart()
      );
    }
  }

  const data =
    dataLines.join("\n");

  if (!data) {
    return;
  }

  try {
    switch (event) {
      case "token":
        handlers.onToken?.(
          JSON.parse(data)
        );
        break;

      case "user_message":
        handlers.onUserMessage?.(
          JSON.parse(data)
        );
        break;

      case "assistant_message":
        handlers.onAssistantMessage?.(
          JSON.parse(data)
        );
        break;

      case "done":
        handlers.onDone?.();
        break;
    }
  } catch (error) {
    handlers.onError?.(
      error instanceof Error
        ? error
        : new Error(
            "Failed to parse SSE event"
          )
    );
  }
}