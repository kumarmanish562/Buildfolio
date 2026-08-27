"use client";

import { motion } from "framer-motion";
import {
  Bot,
  Braces,
  GitPullRequest,
  Layers3,
  MessageSquareCode,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";

const features = [
  {
    icon: Bot,
    title: "AI code assistant",
    description:
      "Ask natural-language questions about your repository and receive contextual answers.",
  },
  {
    icon: MessageSquareCode,
    title: "Repository chat",
    description:
      "Maintain separate conversations for each repository and continue where you left off.",
  },
  {
    icon: GitPullRequest,
    title: "GitHub integration",
    description:
      "Connect directly to your GitHub account and synchronize your repositories.",
  },
  {
    icon: Layers3,
    title: "Semantic indexing",
    description:
      "Turn source code into meaningful searchable chunks instead of relying only on keywords.",
  },
  {
    icon: Braces,
    title: "Code-aware answers",
    description:
      "Responses understand files, classes, functions and relationships inside your project.",
  },
  {
    icon: Sparkles,
    title: "Streaming responses",
    description:
      "See AI responses arrive progressively instead of waiting for the entire answer.",
  },
  {
    icon: ShieldCheck,
    title: "Secure workspace",
    description:
      "GitHub authentication and protected backend APIs keep your workspace isolated.",
  },
  {
    icon: Zap,
    title: "Fast developer workflow",
    description:
      "Search, index and ask questions without leaving your development workflow.",
  },
];

export function FeatureGrid() {
  return (
    <section id="features" className="scroll-mt-24 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold text-primary">FEATURES</p>

          <h2 className="mt-3 font-heading text-3xl font-bold tracking-tight sm:text-4xl">
            Everything you need to understand a repository.
          </h2>

          <p className="mt-4 leading-7 text-muted-foreground">
            BuildFolio combines GitHub integration, repository indexing,
            semantic search and AI chat into one developer workspace.
          </p>
        </div>

        <div className="mt-14 grid gap-px overflow-hidden rounded-3xl border bg-border md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => {
            const Icon = feature.icon;

            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.04 }}
                className="bg-card p-6 transition-colors hover:bg-muted/50"
              >
                <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="size-5" />
                </div>

                <h3 className="mt-5 font-semibold">{feature.title}</h3>

                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}