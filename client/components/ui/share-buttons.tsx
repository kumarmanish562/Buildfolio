"use client";

import * as React from "react";
import { Check, Link2, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

export function ShareButtons({
  title,
  url,
  className,
}: {
  title: string;
  url?: string;
  className?: string;
}) {
  const [copied, setCopied] = React.useState(false);

  const getShareUrl = () => {
    if (url) return url;
    if (typeof window !== "undefined") return window.location.href;
    return "";
  };

  const handleCopy = () => {
    const shareUrl = getShareUrl();
    if (!shareUrl) return;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast.add({
      title: "Link copied",
      description: "Shareable URL copied to clipboard.",
      type: "success",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareTwitter = () => {
    const shareUrl = getShareUrl();
    const intent = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      `Check out ${title} on BuildFolio`
    )}&url=${encodeURIComponent(shareUrl)}`;
    window.open(intent, "_blank", "noopener,noreferrer");
  };

  const handleShareLinkedIn = () => {
    const shareUrl = getShareUrl();
    const intent = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
      shareUrl
    )}`;
    window.open(intent, "_blank", "noopener,noreferrer");
  };

  return (
    <div
      className={cn("inline-flex flex-wrap items-center gap-1.5 print:hidden", className)}
      role="group"
      aria-label="Social sharing options"
    >
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="gap-1.5 text-xs"
        onClick={handleShareTwitter}
        aria-label={`Share ${title} on X (Twitter)`}
      >
        <Share2 className="size-3.5" aria-hidden="true" />
        X / Twitter
      </Button>

      <Button
        type="button"
        variant="outline"
        size="sm"
        className="gap-1.5 text-xs"
        onClick={handleShareLinkedIn}
        aria-label={`Share ${title} on LinkedIn`}
      >
        <Share2 className="size-3.5" aria-hidden="true" />
        LinkedIn
      </Button>

      <Button
        type="button"
        variant="outline"
        size="sm"
        className="gap-1.5 text-xs"
        onClick={handleCopy}
        aria-label="Copy share link to clipboard"
      >
        {copied ? (
          <>
            <Check className="size-3.5 text-emerald-500" aria-hidden="true" />
            Copied
          </>
        ) : (
          <>
            <Link2 className="size-3.5" aria-hidden="true" />
            Copy Link
          </>
        )}
      </Button>
    </div>
  );
}
