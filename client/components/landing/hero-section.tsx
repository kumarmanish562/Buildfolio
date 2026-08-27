"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Play,
  Sparkles,
} from "lucide-react";

import { getGithubLoginUrl } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { GitHubIcon } from "@/components/icons/github-icon";
import { TerminalDemo } from "@/components/landing/terminal-demo";

export function HeroSection() {
  return (
    <section className="relative min-h-screen overflow-hidden pt-28">
      {/* Background effects */}

      <div className="pointer-events-none absolute inset-0">
        <div
          className="
            absolute
            left-1/2
            top-80
            h-160
            w-160
            -translate-x-1/2
            rounded-full
            bg-primary/10
            blur-3xl
          "
        />

        <div
          className="
            absolute
            left-[10%]
            top-[30%]
            h-32
            w-32
            rounded-full
            bg-primary/5
            blur-3xl
          "
        />

        <div
          className="
            absolute
            right-[10%]
            top-[45%]
            h-40
            w-40
            rounded-full
            bg-primary/5
            blur-3xl
          "
        />

        <div className="landing-grid absolute inset-0 opacity-40" />
      </div>

      {/* Hero content */}

      <div className="relative mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">

          {/* Badge */}

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="
              mb-6
              inline-flex
              items-center
              gap-2
              rounded-full
              border
              border-dashed
              border-primary/30
              bg-primary/5
              px-3
              py-1.5
              text-xs
              font-medium
              text-primary
            "
          >
            <Sparkles className="size-3.5" />

            <span>AI-powered code intelligence</span>

            <ArrowRight className="size-3.5" />
          </motion.div>

          {/* Heading */}

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.05 }}
            className="
              font-heading
              text-5xl
              font-bold
              tracking-[-0.04em]
              sm:text-6xl
              lg:text-8xl
            "
          >
            Understand your

            <span
              className="
                block
                bg-linear-to-r
                from-primary
                via-primary/80
                to-foreground
                bg-clip-text
                text-transparent
              "
            >
              codebase with AI.
            </span>
          </motion.h1>

          {/* Description */}

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.12 }}
            className="
              mx-auto
              mt-7
              max-w-2xl
              text-base
              leading-7
              text-muted-foreground
              sm:text-lg
            "
          >
            Connect your GitHub repositories, index your source code, and ask
            intelligent questions about your architecture, files, APIs and
            workflows.
          </motion.p>

          {/* CTA buttons */}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.18 }}
            className="
              mt-9
              flex
              flex-col
              items-center
              justify-center
              gap-3
              sm:flex-row
            "
          >
            {/* GitHub Login */}

            <Button
              size="lg"
              className="
                h-12
                rounded-xl
                px-6
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
                    Connect GitHub
                  </span>
                </a>
              }
            />

            {/* Workflow */}

            <Button
              size="lg"
              variant="outline"
              className="
                h-12
                rounded-xl
                border-dashed
                px-6
              "
              render={
                <Link href="#workflow">
                  <Play data-icon="inline-start" />

                  <span>
                    See how it works
                  </span>
                </Link>
              }
            />
          </motion.div>

          {/* Terminal Demo */}

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.8,
              delay: 0.25,
            }}
            className="mt-20"
          >
            <TerminalDemo />
          </motion.div>

        </div>
      </div>
    </section>
  );
}