"use client";

import { ArrowRight, Sparkles } from "lucide-react";

import { GitHubIcon } from "@/components/icons/github-icon";
import { Button } from "@/components/ui/button";
import { getGithubLoginUrl } from "@/lib/api";

export function CTASection() {
  return (
    <section className="relative overflow-hidden border-t py-24 sm:py-32">
      {/* Background glow */}

      <div className="pointer-events-none absolute inset-0 bg-primary/3" />

      <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">

        {/* Icon */}

        <div
          className="
            mx-auto
            flex
            size-12
            items-center
            justify-center
            rounded-2xl
            bg-primary/10
            text-primary
          "
        >
          <Sparkles className="size-6" />
        </div>

        {/* Heading */}

        <h2
          className="
            mt-6
            font-heading
            text-4xl
            font-bold
            tracking-tight
            sm:text-5xl
          "
        >
          Stop searching.

          <span className="block text-primary">
            Start understanding.
          </span>
        </h2>

        {/* Description */}

        <p
          className="
            mx-auto
            mt-5
            max-w-xl
            leading-7
            text-muted-foreground
          "
        >
          Connect your GitHub account and turn your repositories into an
          intelligent development workspace.
        </p>

        {/* CTA */}

        <div className="mt-8">
          <Button
            size="lg"
            className="
              h-12
              rounded-xl
              px-7
              shadow-lg
              shadow-primary/20
            "
            render={
              <a href={getGithubLoginUrl()}>
                <GitHubIcon
                  className="size-5"
                  aria-hidden="true"
                />

                <span>
                  Start with GitHub
                </span>

                <ArrowRight
                  data-icon="inline-end"
                  className="size-4"
                />
              </a>
            }
          />
        </div>

      </div>
    </section>
  );
}