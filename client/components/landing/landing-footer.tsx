import Link from "next/link";

import { GitHubIcon } from "@/components/icons/github-icon";
import { BuildfolioLogo } from "@/components/icons/buildfolio-logo";
import { getGithubLoginUrl } from "@/lib/api";

export function LandingFooter() {
  return (
    <footer className="border-t">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">

          {/* Brand */}
          <div className="flex items-center gap-3">
            <BuildfolioLogo className="size-9 rounded-[11px]" />

            <div>
              <p className="font-heading text-sm font-semibold">
                BuildFolio
              </p>

              <p className="text-xs text-muted-foreground">
                Chat with your code.
              </p>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-muted-foreground">
            <Link
              href="#features"
              className="transition-colors hover:text-foreground"
            >
              Features
            </Link>

            <Link
              href="#workflow"
              className="transition-colors hover:text-foreground"
            >
              How it works
            </Link>

            <Link
              href="#architecture"
              className="transition-colors hover:text-foreground"
            >
              Architecture
            </Link>

            <Link
              href="#security"
              className="transition-colors hover:text-foreground"
            >
              Security
            </Link>

            {/* GitHub */}
            <a
              href={getGithubLoginUrl()}
              className="
                inline-flex
                items-center
                gap-1.5
                transition-colors
                hover:text-foreground
              "
            >
              <GitHubIcon
                className="size-4"
                aria-hidden="true"
              />

              <span>GitHub</span>
            </a>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 border-t pt-6 text-xs text-muted-foreground">
          © {new Date().getFullYear()} BuildFolio. Built for developers.
        </div>
      </div>
    </footer>
  );
}