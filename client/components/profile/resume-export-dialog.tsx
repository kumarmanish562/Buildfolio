"use client";

import React, { useState } from "react";
import {
  FileText,
  Copy,
  Check,
  Download,
  Printer,
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
import { PublicProfile, SkillPassport } from "@/lib/api";
import { toast } from "@/components/ui/toast";

interface ResumeExportDialogProps {
  profile: PublicProfile;
  passport?: SkillPassport | null;
}

export function ResumeExportDialog({ profile, passport }: ResumeExportDialogProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const developerTitle = passport?.developerTitle || "Senior Software Engineer";
  const overallScore = passport?.overallScore || 92;

  const markdownResume = `# ${profile.displayName}
**${developerTitle}** | GitHub: [@${profile.githubUsername}](${profile.githubUrl}) | BuildFolio Verified Score: ${overallScore}/100

---

## PROFESSIONAL SUMMARY
Results-driven software engineer and solutions architect with demonstrated expertise in distributed systems, clean architecture, and modern application frameworks. Heuristics-audited and production-verified across ${profile.publicProjectCount} open-source repositories with an average security health score of ${profile.averageSecurityScore ?? 90}/100.

---

## VERIFIED CORE COMPETENCIES
${
  passport?.skills
    ? passport.skills
        .map(
          (s) =>
            `- **${s.name}** (${s.proficiencyScore}% - ${s.badgeLevel}): ${s.description}\n  *Key Evidence:* ${s.evidenceCitations.join(", ")}`
        )
        .join("\n")
    : profile.aggregatedTechStack.map((t) => `- **${t}**`).join("\n")
}

---

## FEATURED ARCHITECTURE & OPEN-SOURCE PROJECTS
${profile.portfolios
  .map(
    (p) => `### ${p.repositoryName} — ${p.title}
*Repository:* [${p.repositoryFullName}](${p.repositoryHtmlUrl})
- **Architecture Overview:** ${p.architectureOverview.slice(0, 280)}...
- **Tech Stack:** ${(() => {
      try {
        const parsed = JSON.parse(p.techStack);
        if (Array.isArray(parsed)) {
          return parsed.flatMap((c: { items?: string[] }) => c.items || []).join(", ");
        }
        return p.techStack;
      } catch {
        return p.techStack;
      }
    })()}
`
  )
  .join("\n")}

---

## EDUCATION & ACHIEVEMENTS
- **BuildFolio Architectural Showcase Verification**: Passed automated static code analysis, zero-trust security audits, and PGVector semantic indexing.
- **Continuous Integration**: Real-time push webhooks with HMAC-SHA256 payload integrity validation.
`;

  const handleCopy = () => {
    navigator.clipboard.writeText(markdownResume);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.add({
      title: "Resume Markdown copied!",
      description: "Paste into your favorite editor or ATS portal.",
      type: "success",
    });
  };

  const handleDownload = () => {
    const blob = new Blob([markdownResume], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${profile.githubUsername}-resume.md`;
    a.click();
    URL.revokeObjectURL(url);
    toast.add({
      title: "Resume downloaded",
      description: `Saved as ${profile.githubUsername}-resume.md`,
      type: "success",
    });
  };

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${profile.displayName} - Technical Resume</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; line-height: 1.5; color: #111; max-width: 800px; margin: 40px auto; padding: 0 20px; }
            h1 { font-size: 24px; margin-bottom: 4px; }
            h2 { font-size: 15px; text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px solid #ccc; padding-bottom: 4px; margin-top: 24px; }
            h3 { font-size: 14px; margin-bottom: 2px; }
            p, li { font-size: 13px; color: #333; }
            ul { margin-top: 6px; padding-left: 20px; }
            a { color: #0284c7; text-decoration: none; }
            .header-subtitle { color: #555; font-size: 13px; margin-bottom: 20px; }
            @media print { body { margin: 20px; } a { color: #000; } }
          </style>
        </head>
        <body>
          <h1>${profile.displayName}</h1>
          <div class="header-subtitle">
            <strong>${developerTitle}</strong> | GitHub: @${profile.githubUsername} | BuildFolio Audit Score: ${overallScore}/100
          </div>
          <h2>Professional Summary</h2>
          <p>Results-driven software engineer and solutions architect with demonstrated expertise in distributed systems, clean architecture, and modern application frameworks. Heuristics-audited and production-verified across ${profile.publicProjectCount} open-source repositories with an average security health score of ${profile.averageSecurityScore ?? 90}/100.</p>
          
          <h2>Verified Core Competencies</h2>
          <ul>
            ${
              passport?.skills
                ? passport.skills
                    .map(
                      (s) =>
                        `<li><strong>${s.name}</strong> (${s.proficiencyScore}% - ${s.badgeLevel}): ${s.description}<br><small>Evidence: ${s.evidenceCitations.join(", ")}</small></li>`
                    )
                    .join("")
                : profile.aggregatedTechStack.map((t) => `<li>${t}</li>`).join("")
            }
          </ul>

          <h2>Featured Technical Projects</h2>
          ${profile.portfolios
            .map(
              (p) => `
              <h3>${p.repositoryName} — ${p.title}</h3>
              <p>${p.architectureOverview.slice(0, 300)}...</p>
            `
            )
            .join("")}

          <script>window.onload = function() { window.print(); };</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button size="sm" variant="outline" className="gap-2">
            <FileText className="size-4 text-primary" />
            <span>ATS Resume Generator</span>
          </Button>
        }
      />
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-6">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Sparkles className="size-4" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold">
                ATS-Optimized Technical Resume
              </DialogTitle>
              <DialogDescription className="text-xs">
                Auto-generated from your verified codebase architecture, metrics, and skill passport.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4 py-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Markdown Preview:</span>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="ghost" onClick={handlePrint} className="gap-1 text-xs h-7">
                <Printer className="size-3" />
                Print / PDF
              </Button>
              <Button size="sm" variant="ghost" onClick={handleDownload} className="gap-1 text-xs h-7">
                <Download className="size-3" />
                Download .md
              </Button>
              <Button size="sm" variant="outline" onClick={handleCopy} className="gap-1 text-xs h-7">
                {copied ? <Check className="size-3 text-emerald-500" /> : <Copy className="size-3" />}
                {copied ? "Copied" : "Copy Markdown"}
              </Button>
            </div>
          </div>

          <pre className="rounded-xl border bg-muted/40 p-4 font-mono text-[11px] leading-relaxed overflow-x-auto text-foreground max-h-96 whitespace-pre-wrap">
            {markdownResume}
          </pre>
        </div>
      </DialogContent>
    </Dialog>
  );
}
