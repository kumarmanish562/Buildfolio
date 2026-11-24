"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeft, Database } from "lucide-react";
import { usePublicPortfolio } from "@/hooks/use-portfolio";
import { PortfolioShowcase } from "@/components/portfolio/portfolio-showcase";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ThemeToggle } from "@/components/layout/theme-toggle";

export default function PublicPortfolioPage({
  params,
}: {
  params: Promise<{
    id: string;
  }>;
}) {
  const { id } = use(params);
  const { data: portfolio, isLoading, isError } = usePublicPortfolio(id);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Public Header */}
      <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between p-4">
          <Link href="/" className="flex items-center gap-2">
            <span className="font-heading text-lg font-bold tracking-tight text-primary">
              BuildFolio
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Button
              variant="outline"
              size="sm"
              render={<Link href="/login" />}
            >
              Sign In to BuildFolio
            </Button>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <main className="py-8">
        {isLoading && (
          <div className="mx-auto max-w-5xl space-y-6 p-6">
            <Skeleton className="h-44 w-full rounded-3xl" />
            <Skeleton className="h-28 w-full rounded-2xl" />
            <Skeleton className="h-64 w-full rounded-2xl" />
          </div>
        )}

        {isError && (
          <div className="mx-auto max-w-lg p-12 text-center">
            <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-muted">
              <Database className="size-5 text-muted-foreground" />
            </div>
            <h2 className="mt-4 text-xl font-semibold">Portfolio Unavailable</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              This portfolio is either private or does not exist.
            </p>
            <Button
              className="mt-6"
              variant="outline"
              render={<Link href="/" />}
            >
              <ArrowLeft data-icon="inline-start" />
              Go to Home
            </Button>
          </div>
        )}

        {portfolio && (
          <PortfolioShowcase
            isPublicView={true}
            initialPortfolio={portfolio}
          />
        )}
      </main>
    </div>
  );
}
