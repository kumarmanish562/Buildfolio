"use client";

import * as React from "react";
import { Check, Copy, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/toast";

export function BadgeEmbedDialog({
  repoId,
  repoName,
  portfolioId,
}: {
  repoId: string;
  repoName: string;
  portfolioId?: string;
}) {
  const [copiedKey, setCopiedKey] = React.useState<string | null>(null);

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://buildfolio.dev";
  const targetUrl = portfolioId ? `${baseUrl}/portfolio/${portfolioId}` : `${baseUrl}/dashboard/repos/${repoId}`;

  const badges = [
    {
      key: "architecture",
      title: "Architecture Verified Shield",
      imgUrl: `${baseUrl}/api/public/repos/${repoId}/badge/architecture`,
      markdown: `[![BuildFolio Architecture](${baseUrl}/api/public/repos/${repoId}/badge/architecture)](${targetUrl})`,
    },
    {
      key: "security",
      title: "Security Health Score Shield",
      imgUrl: `${baseUrl}/api/public/repos/${repoId}/badge/security`,
      markdown: `[![BuildFolio Security](${baseUrl}/api/public/repos/${repoId}/badge/security)](${targetUrl})`,
    },
    {
      key: "stack",
      title: "Codebase Stack Shield",
      imgUrl: `${baseUrl}/api/public/repos/${repoId}/badge/stack`,
      markdown: `[![BuildFolio Tech Stack](${baseUrl}/api/public/repos/${repoId}/badge/stack)](${targetUrl})`,
    },
  ];

  const allMarkdown = badges.map((b) => b.markdown).join("\n");

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    toast.add({
      title: "Badge markdown copied",
      description: "Paste directly into your GitHub README.md",
      type: "success",
    });
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button variant="outline" size="sm" className="gap-1.5 text-xs">
            <ShieldCheck className="size-3.5 text-primary" aria-hidden="true" />
            README Badges
          </Button>
        }
      />
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldCheck className="size-5 text-primary" />
            Embed GitHub README Badges ({repoName})
          </DialogTitle>
          <DialogDescription>
            Showcase your verified architecture and security health directly on GitHub.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {badges.map((b) => (
            <div
              key={b.key}
              className="flex flex-col gap-2 rounded-xl border bg-muted/30 p-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="space-y-1">
                <p className="text-xs font-medium text-foreground">{b.title}</p>
                <div className="pt-0.5">
                  <img src={b.imgUrl} alt={b.title} className="h-5" />
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5 text-xs shrink-0"
                onClick={() => copyToClipboard(b.markdown, b.key)}
              >
                {copiedKey === b.key ? (
                  <>
                    <Check className="size-3 text-emerald-500" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="size-3" />
                    Copy Markdown
                  </>
                )}
              </Button>
            </div>
          ))}

          <div className="pt-2">
            <Button
              className="w-full gap-2 text-xs"
              onClick={() => copyToClipboard(allMarkdown, "all")}
            >
              {copiedKey === "all" ? (
                <>
                  <Check className="size-3.5 text-emerald-500" />
                  All Badges Copied!
                </>
              ) : (
                <>
                  <Copy className="size-3.5" />
                  Copy All Badges (Bundle)
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
