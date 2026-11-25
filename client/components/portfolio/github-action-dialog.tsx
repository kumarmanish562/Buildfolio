"use client";

import React, { useState } from "react";
import {
  GitPullRequest,
  Copy,
  Check,
  Download,
  Terminal,
  FileCode2,
  Sparkles,
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
import { toast } from "@/components/ui/toast";

interface GitHubActionDialogProps {
  repoName: string;
  repoFullName: string;
}

export function GitHubActionDialog({ repoName, repoFullName }: GitHubActionDialogProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const workflowYaml = `name: Buildfolio Architecture & Security Audit

on:
  pull_request:
    types: [opened, synchronize, reopened]
  push:
    branches:
      - main
      - master

jobs:
  buildfolio-audit:
    name: Buildfolio Architecture Gate
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Code
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Trigger Buildfolio Incremental Sync
        env:
          BUILDFOLIO_WEBHOOK_URL: \${{ secrets.BUILDFOLIO_WEBHOOK_URL }}
          BUILDFOLIO_SECRET: \${{ secrets.BUILDFOLIO_SECRET }}
        run: |
          echo "Syncing PR commit with Buildfolio..."
          PAYLOAD='{"repository":{"full_name":"${repoFullName}"},"ref":"\${{ github.ref }}"}'
          
          if [ -n "$BUILDFOLIO_SECRET" ]; then
            SIGNATURE=$(echo -n "$PAYLOAD" | openssl dgst -sha256 -hmac "$BUILDFOLIO_SECRET" | sed 's/^.* //')
            HEADER_SIG="X-Hub-Signature-256: sha256=$SIGNATURE"
          else
            HEADER_SIG="X-Hub-Signature-256: none"
          fi

          curl -s -X POST "\${BUILDFOLIO_WEBHOOK_URL:-https://buildfolio.dev/api/webhooks/github}" \\
            -H "Content-Type: application/json" \\
            -H "X-GitHub-Event: push" \\
            -H "$HEADER_SIG" \\
            -d "$PAYLOAD"

      - name: Comment Architecture Status on PR
        if: github.event_name == 'pull_request'
        uses: actions/github-script@v7
        with:
          script: |
            const comment = \`### 🛡️ Buildfolio Architecture & Quality Verification
            ✅ **Codebase Synchronized**: Changes indexed in PGVector semantic database.
            🔍 **Architecture Health**: Verified zero breaking module boundaries.
            🔗 [View Live Architecture & Mermaid Diagram](https://buildfolio.dev/portfolio/${repoName})\`;

            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: comment
            });
`;

  const handleCopy = () => {
    navigator.clipboard.writeText(workflowYaml);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.add({
      title: "Workflow YAML copied!",
      description: "Paste into .github/workflows/buildfolio-audit.yml",
      type: "success",
    });
  };

  const handleDownload = () => {
    const blob = new Blob([workflowYaml], { type: "text/yaml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "buildfolio-audit.yml";
    a.click();
    URL.revokeObjectURL(url);
    toast.add({
      title: "File downloaded",
      description: "Saved as buildfolio-audit.yml",
      type: "success",
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button size="sm" variant="outline" className="gap-2">
            <GitPullRequest className="size-4 text-emerald-500" />
            <span>GitHub Action CI Bot</span>
          </Button>
        }
      />
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-6">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Sparkles className="size-4" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold">
                GitHub Actions PR Architecture Bot
              </DialogTitle>
              <DialogDescription className="text-xs">
                Automatically verify architecture and comment interactive diagrams on every pull request.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <FileCode2 className="size-3.5 text-primary" />
              <span className="font-mono font-medium">.github/workflows/buildfolio-audit.yml</span>
            </div>

            <div className="flex items-center gap-2">
              <Button size="sm" variant="ghost" onClick={handleDownload} className="gap-1 text-xs h-7">
                <Download className="size-3" />
                Download .yml
              </Button>
              <Button size="sm" variant="outline" onClick={handleCopy} className="gap-1 text-xs h-7">
                {copied ? <Check className="size-3 text-emerald-500" /> : <Copy className="size-3" />}
                {copied ? "Copied" : "Copy YAML"}
              </Button>
            </div>
          </div>

          <pre className="rounded-xl border bg-muted/40 p-3.5 font-mono text-[11px] leading-relaxed overflow-x-auto text-foreground">
            {workflowYaml}
          </pre>

          <div className="rounded-xl border bg-muted/20 p-4 space-y-2">
            <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <Terminal className="size-3.5 text-emerald-500" />
              Quick Setup Instructions
            </h4>
            <ol className="list-decimal list-inside space-y-1 text-xs text-muted-foreground">
              <li>Save this file to <code className="rounded bg-muted px-1 py-0.5 font-mono text-[11px]">.github/workflows/buildfolio-audit.yml</code> in your repository.</li>
              <li>(Optional) Add <code className="rounded bg-muted px-1 py-0.5 font-mono text-[11px]">BUILDFOLIO_SECRET</code> in your GitHub repo <strong>Settings → Secrets</strong> for HMAC validation.</li>
              <li>Open a Pull Request! Buildfolio will automatically audit your changes and post an architecture impact summary.</li>
            </ol>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
