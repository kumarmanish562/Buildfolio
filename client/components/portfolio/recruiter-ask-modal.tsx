"use client";

import * as React from "react";
import {
  Bot,
  FileCode2,
  Loader2,
  Send,
  Sparkles,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { api, Citation, PublicAskResponse } from "@/lib/api";
import { toast } from "@/components/ui/toast";

const STARTER_PROMPTS = [
  "Why was this architecture & tech stack chosen?",
  "How are authentication and security enforced?",
  "What was the most challenging technical constraint solved?",
  "How does this service scale under high read/write loads?",
];

export function RecruiterAskModal({
  portfolioId,
  repoName,
  authorName = "the developer",
}: {
  portfolioId: string;
  repoName: string;
  authorName?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const [question, setQuestion] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [history, setHistory] = React.useState<
    { question: string; answer: string; citations: Citation[] }[]
  >([]);
  const [streamingAnswer, setStreamingAnswer] = React.useState<string | null>(null);
  const [streamingCitations, setStreamingCitations] = React.useState<Citation[]>([]);

  const handleAsk = async (queryText?: string) => {
    const q = (queryText ?? question).trim();
    if (!q || loading) return;

    setLoading(true);
    setStreamingAnswer("");
    setStreamingCitations([]);
    if (!queryText) setQuestion("");

    // Try EventSource for token-by-token streaming
    let accumulatedText = "";
    let accumulatedCitations: Citation[] = [];

    try {
      const sseUrl = `/api/public/portfolios/${portfolioId}/ask/stream?question=${encodeURIComponent(q)}`;
      const es = new EventSource(sseUrl);

      es.addEventListener("citations", (event: MessageEvent) => {
        try {
          const parsed = JSON.parse(event.data);
          accumulatedCitations = Array.isArray(parsed) ? parsed : [];
          setStreamingCitations(accumulatedCitations);
        } catch {
          // ignore parsing error
        }
      });

      es.addEventListener("token", (event: MessageEvent) => {
        accumulatedText += event.data;
        setStreamingAnswer(accumulatedText);
      });

      es.addEventListener("done", () => {
        es.close();
        setHistory((prev) => [
          ...prev,
          {
            question: q,
            answer: accumulatedText,
            citations: accumulatedCitations,
          },
        ]);
        setStreamingAnswer(null);
        setStreamingCitations([]);
        setLoading(false);
      });

      es.addEventListener("error", async () => {
        es.close();
        // If stream failed before any tokens were received, fallback to standard POST
        if (!accumulatedText) {
          try {
            const res: PublicAskResponse = await api.askPublicPortfolio(portfolioId, q);
            setHistory((prev) => [
              ...prev,
              {
                question: q,
                answer: res.answer,
                citations: res.citations ?? [],
              },
            ]);
          } catch (fallbackErr) {
            toast.add({
              title: "Could not answer question",
              description: fallbackErr instanceof Error ? fallbackErr.message : String(fallbackErr),
              type: "error",
            });
          } finally {
            setStreamingAnswer(null);
            setStreamingCitations([]);
            setLoading(false);
          }
        } else {
          // Keep what we received
          setHistory((prev) => [
            ...prev,
            {
              question: q,
              answer: accumulatedText,
              citations: accumulatedCitations,
            },
          ]);
          setStreamingAnswer(null);
          setStreamingCitations([]);
          setLoading(false);
        }
      });
    } catch {
      // Direct fallback
      try {
        const res: PublicAskResponse = await api.askPublicPortfolio(portfolioId, q);
        setHistory((prev) => [
          ...prev,
          {
            question: q,
            answer: res.answer,
            citations: res.citations ?? [],
          },
        ]);
      } catch (err) {
        toast.add({
          title: "Could not answer question",
          description: err instanceof Error ? err.message : String(err),
          type: "error",
        });
      } finally {
        setStreamingAnswer(null);
        setStreamingCitations([]);
        setLoading(false);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button
            size="sm"
            className="gap-2 bg-gradient-to-r from-primary to-indigo-600 text-primary-foreground shadow-md hover:opacity-90"
          >
            <Bot className="size-4" aria-hidden="true" />
            <span>Ask My Code AI</span>
          </Button>
        }
      />
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-6">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Bot className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold">
                Recruiter Technical Interview Advocate
              </DialogTitle>
              <DialogDescription className="text-xs">
                Ask anything about {repoName}&apos;s code, architectural decisions, and patterns.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Conversation history */}
        <div className="flex-1 overflow-y-auto space-y-4 py-4 pr-1 min-h-[220px]">
          {history.length === 0 ? (
            <div className="rounded-2xl border border-dashed bg-muted/20 p-5 text-center">
              <Sparkles className="mx-auto size-7 text-primary/70" />
              <p className="mt-2 text-sm font-medium">
                Ask a technical question about {repoName}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Spring AI answers with direct file citations representing {authorName}&apos;s architectural intent.
              </p>

              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {STARTER_PROMPTS.map((prompt, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleAsk(prompt)}
                    className="rounded-lg border bg-background/80 px-2.5 py-1.5 text-xs text-muted-foreground hover:border-primary/40 hover:text-foreground transition-all"
                  >
                    &ldquo;{prompt}&rdquo;
                  </button>
                ))}
              </div>
            </div>
          ) : (
            history.map((item, idx) => (
              <div key={idx} className="space-y-3">
                {/* User question */}
                <div className="flex items-start gap-2.5 justify-end">
                  <div className="max-w-[85%] rounded-2xl rounded-tr-sm bg-primary px-3.5 py-2 text-xs text-primary-foreground shadow-xs">
                    {item.question}
                  </div>
                  <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                    <User className="size-3.5" />
                  </div>
                </div>

                {/* AI advocate answer */}
                <div className="flex items-start gap-2.5">
                  <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
                    <Bot className="size-3.5" />
                  </div>
                  <div className="max-w-[88%] space-y-2.5 rounded-2xl rounded-tl-sm border bg-card p-3.5 text-xs text-card-foreground shadow-xs">
                    <p className="whitespace-pre-line leading-relaxed">
                      {item.answer}
                    </p>

                    {item.citations.length > 0 && (
                      <div className="border-t pt-2 space-y-1">
                        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                          Codebase Citations:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {item.citations.map((c, i) => (
                            <span
                              key={i}
                              className="inline-flex items-center gap-1 rounded bg-secondary/80 px-2 py-0.5 font-mono text-[10px]"
                            >
                              <FileCode2 className="size-3 text-primary" />
                              {c.filePath}
                              {c.startLine ? `:${c.startLine}` : ""}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}

          {/* Real-time Streaming AI Answer */}
          {streamingAnswer !== null && (
            <div className="flex items-start gap-2.5">
              <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
                <Bot className="size-3.5" />
              </div>
              <div className="max-w-[88%] space-y-2.5 rounded-2xl rounded-tl-sm border bg-card p-3.5 text-xs text-card-foreground shadow-xs">
                <p className="whitespace-pre-line leading-relaxed">
                  {streamingAnswer}
                  <span className="inline-block w-1.5 h-3.5 ml-0.5 bg-primary animate-pulse" />
                </p>

                {streamingCitations.length > 0 && (
                  <div className="border-t pt-2 space-y-1">
                    <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                      Codebase Citations:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {streamingCitations.map((c, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1 rounded bg-secondary/80 px-2 py-0.5 font-mono text-[10px]"
                        >
                          <FileCode2 className="size-3 text-primary" />
                          {c.filePath}
                          {c.startLine ? `:${c.startLine}` : ""}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {loading && streamingAnswer === null && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground p-2">
              <Loader2 className="size-4 animate-spin text-primary" />
              <span>Analyzing codebase & generating technical response...</span>
            </div>
          )}
        </div>

        {/* Input box */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAsk();
          }}
          className="flex items-center gap-2 border-t pt-3"
        >
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask a technical question (e.g. 'How does caching work here?')..."
            className="flex-1 rounded-xl border bg-background px-3.5 py-2 text-xs text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            disabled={loading}
          />
          <Button
            type="submit"
            size="sm"
            disabled={loading || !question.trim()}
            className="gap-1.5 text-xs"
          >
            <Send className="size-3" />
            Send
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
