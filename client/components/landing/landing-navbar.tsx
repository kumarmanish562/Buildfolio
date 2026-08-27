"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useState } from "react";

import { BuildfolioLogo } from "@/components/icons/buildfolio-logo";
import { GitHubIcon } from "@/components/icons/github-icon";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { Button } from "@/components/ui/button";
import { getGithubLoginUrl } from "@/lib/api";
import { cn } from "@/lib/utils";

const links = [
  {
    label: "Features",
    href: "#features",
  },
  {
    label: "How it works",
    href: "#workflow",
  },
  {
    label: "Architecture",
    href: "#architecture",
  },
  {
    label: "Security",
    href: "#security",
  },
];

export function LandingNavbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div className="mx-auto max-w-7xl px-4 pt-4 sm:px-6 lg:px-8">
        <nav
          className={cn(
            "relative flex h-14 items-center justify-between rounded-2xl",
            "border border-border/60 bg-background/75 px-3",
            "shadow-lg shadow-foreground/3 backdrop-blur-xl"
          )}
        >
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2.5"
            onClick={() => setOpen(false)}
          >
            <BuildfolioLogo className="size-8 rounded-[10px]" />

            <div className="flex flex-col">
              <span className="font-heading text-sm font-bold tracking-tight">
                BuildFolio
              </span>

              <span className="hidden text-[10px] leading-none text-muted-foreground sm:block">
                Chat with your code
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden items-center gap-1 md:flex">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="
                  rounded-lg
                  px-3
                  py-2
                  text-sm
                  text-muted-foreground
                  transition-colors
                  hover:bg-muted
                  hover:text-foreground
                "
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden items-center gap-2 md:flex">
            <ModeToggle />

            <Button
              size="sm"
              className="rounded-xl"
              render={
                <a href={getGithubLoginUrl()}>
                  <GitHubIcon
                    className="size-4"
                    aria-hidden="true"
                  />

                  <span>Connect GitHub</span>
                </a>
              }
            />
          </div>

          {/* Mobile Actions */}
          <div className="flex items-center gap-1 md:hidden">
            <ModeToggle />

            <Button
              size="icon"
              variant="ghost"
              onClick={() => setOpen((value) => !value)}
              aria-label={
                open ? "Close navigation" : "Open navigation"
              }
              aria-expanded={open}
            >
              {open ? (
                <X className="size-5" />
              ) : (
                <Menu className="size-5" />
              )}
            </Button>
          </div>

          {/* Mobile Navigation */}
          {open && (
            <div
              className="
                absolute
                inset-x-0
                top-[calc(100%+0.5rem)]
                rounded-2xl
                border
                bg-background/95
                p-3
                shadow-xl
                backdrop-blur-xl
                md:hidden
              "
            >
              <div className="flex flex-col gap-1">
                {links.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="
                      rounded-xl
                      px-4
                      py-3
                      text-sm
                      text-muted-foreground
                      transition-colors
                      hover:bg-muted
                      hover:text-foreground
                    "
                  >
                    {link.label}
                  </a>
                ))}

                <div className="my-2 h-px bg-border" />

                {/* Mobile GitHub Button */}
                <Button
                  className="w-full rounded-xl"
                  render={
                    <a href={getGithubLoginUrl()}>
                      <GitHubIcon
                        className="size-4"
                        aria-hidden="true"
                      />

                      <span>Connect GitHub</span>
                    </a>
                  }
                />
              </div>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}