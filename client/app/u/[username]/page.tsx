"use client";

import { use, useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  Briefcase,
  Calendar,
  Check,
  Copy,
  Cpu,
  FolderGit2,
  Globe,
  Layers,
  ShieldCheck,
  Sparkles,
  UserX,
} from "lucide-react";

import { TechStackCategory } from "@/lib/api";
import { usePublicProfile } from "@/hooks/use-portfolio";
import { GitHubIcon } from "@/components/icons/github-icon";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export default function PublicDeveloperProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = use(params);
  const { data: profile, isLoading, isError } = usePublicProfile(username);
  const [copied, setCopied] = useState(false);

  const handleCopyProfileUrl = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Sticky Public Header */}
      <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Briefcase className="size-4" />
            </div>
            <span className="font-heading text-lg font-bold tracking-tight">
              BuildFolio
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <ModeToggle />
            <Button variant="outline" size="sm" render={<Link href="/login" />}>
              Sign In
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">
        {isLoading && (
          <div className="space-y-8">
            <Skeleton className="h-52 w-full rounded-3xl" />
            <Skeleton className="h-28 w-full rounded-2xl" />
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Skeleton className="h-64 rounded-2xl md:col-span-2" />
              <Skeleton className="h-64 rounded-2xl" />
              <Skeleton className="h-64 rounded-2xl" />
            </div>
          </div>
        )}

        {isError && (
          <div className="mx-auto max-w-lg py-20 text-center">
            <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-muted">
              <UserX className="size-6 text-muted-foreground" />
            </div>
            <h1 className="mt-4 text-2xl font-bold tracking-tight">
              Developer Profile Not Found
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              No BuildFolio profile exists for{" "}
              <span className="font-mono font-semibold text-foreground">
                @{username}
              </span>
              .
            </p>
            <Button className="mt-6" render={<Link href="/" />}>
              Back to BuildFolio Home
            </Button>
          </div>
        )}

        {profile && (
          <div className="space-y-12">
            {/* Developer Hero Card */}
            <section className="relative overflow-hidden rounded-3xl border bg-gradient-to-br from-card via-card to-muted/40 p-6 md:p-10 shadow-sm">
              <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                  {profile.avatarUrl ? (
                    <img
                      src={profile.avatarUrl}
                      alt={profile.displayName}
                      className="size-20 rounded-2xl border-2 border-border object-cover shadow-sm md:size-24"
                    />
                  ) : (
                    <div className="flex size-20 items-center justify-center rounded-2xl border bg-primary/10 text-2xl font-bold text-primary md:size-24">
                      {profile.displayName.slice(0, 2).toUpperCase()}
                    </div>
                  )}

                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <h1 className="text-2xl font-extrabold tracking-tight md:text-3xl">
                        {profile.displayName}
                      </h1>
                      <Badge variant="secondary" className="gap-1 text-xs">
                        <Globe className="size-3 text-emerald-500" />
                        Verified Developer
                      </Badge>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      <a
                        href={profile.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 font-mono text-xs hover:text-foreground"
                      >
                        <GitHubIcon className="size-3.5" />
                        @{profile.githubUsername}
                        <ArrowUpRight className="size-3" />
                      </a>

                      <span className="inline-flex items-center gap-1.5 text-xs">
                        <Calendar className="size-3.5" />
                        Joined{" "}
                        {new Date(profile.memberSince).toLocaleDateString(
                          "en-US",
                          {
                            month: "short",
                            year: "numeric",
                          }
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quick Share & Stats */}
                <div className="flex flex-col items-start gap-3 md:items-end">
                  <Button
                    size="sm"
                    className="gap-2"
                    onClick={handleCopyProfileUrl}
                  >
                    {copied ? (
                      <>
                        <Check className="size-4" />
                        Profile URL Copied
                      </>
                    ) : (
                      <>
                        <Copy className="size-4" />
                        Copy Profile URL
                      </>
                    )}
                  </Button>

                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className="gap-1.5 px-3 py-1">
                      <FolderGit2 className="size-3.5 text-primary" />
                      {profile.publicProjectCount}{" "}
                      {profile.publicProjectCount === 1
                        ? "Public Project"
                        : "Public Projects"}
                    </Badge>

                    {profile.averageSecurityScore !== null && (
                      <Badge className="gap-1.5 bg-emerald-500/15 px-3 py-1 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20">
                        <ShieldCheck className="size-3.5" />
                        {profile.averageSecurityScore}/100 Security Health
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </section>

            {/* Aggregated Tech Stack Cloud */}
            {profile.aggregatedTechStack.length > 0 && (
              <section className="space-y-4">
                <div className="flex items-center gap-2 text-lg font-semibold tracking-tight">
                  <Cpu className="size-5 text-primary" />
                  <h2>Aggregated Tech Stack & Capabilities</h2>
                </div>

                <div className="flex flex-wrap gap-2 rounded-2xl border bg-card p-6">
                  {profile.aggregatedTechStack.map((tech, idx) => (
                    <span
                      key={idx}
                      className="rounded-xl border bg-secondary/60 px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-secondary"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* Bento-Grid Public Portfolios Gallery */}
            <section className="space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-lg font-semibold tracking-tight">
                  <Layers className="size-5 text-primary" />
                  <h2>Featured Architecture Showcases</h2>
                </div>
                <span className="text-xs text-muted-foreground">
                  {profile.portfolios.length} published
                </span>
              </div>

              {profile.portfolios.length === 0 ? (
                <div className="rounded-2xl border border-dashed py-16 text-center">
                  <Sparkles className="mx-auto size-8 text-muted-foreground/60" />
                  <h3 className="mt-3 text-base font-semibold">
                    No Public Portfolios Yet
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    @{profile.githubUsername} hasn&apos;t published any
                    repository showcases yet.
                  </p>
                </div>
              ) : (
                <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                  {profile.portfolios.map((item, idx) => {
                    const isFeatured =
                      profile.portfolios.length >= 3 && idx === 0;

                    let tags: string[] = [];
                    try {
                      const cats: TechStackCategory[] = JSON.parse(
                        item.techStack
                      );
                      tags = cats
                        .flatMap((c) =>
                          Array.isArray(c.items) ? c.items : [c.items]
                        )
                        .slice(0, isFeatured ? 8 : 5);
                    } catch {
                      tags = [];
                    }

                    return (
                      <div
                        key={item.id}
                        className={`group flex flex-col justify-between rounded-2xl border bg-card p-6 transition-all hover:border-primary/40 hover:shadow-md ${
                          isFeatured ? "md:col-span-2" : ""
                        }`}
                      >
                        <div className="space-y-3">
                          <div className="flex items-center justify-between gap-2">
                            <Badge
                              variant="outline"
                              className="gap-1.5 font-mono text-[11px]"
                            >
                              <GitHubIcon className="size-3" />
                              {item.repositoryFullName}
                            </Badge>
                            {isFeatured && (
                              <Badge className="bg-primary/10 text-primary text-[10px]">
                                Featured
                              </Badge>
                            )}
                          </div>

                          <h3 className="text-xl font-bold tracking-tight group-hover:text-primary transition-colors">
                            {item.title}
                          </h3>

                          <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                            {item.summary}
                          </p>

                          {tags.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 pt-2">
                              {tags.map((tag, i) => (
                                <span
                                  key={i}
                                  className="rounded-md bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="mt-6 flex items-center justify-between border-t pt-4">
                          <Link
                            href={`/portfolio/${item.id}`}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
                          >
                            View Architecture Showcase
                            <ArrowUpRight className="size-3.5" />
                          </Link>

                          <a
                            href={item.repositoryHtmlUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-muted-foreground hover:text-foreground"
                          >
                            GitHub Repo
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
