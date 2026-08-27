"use client";

import { motion } from "framer-motion";
import {
  Brain,
  FileSearch,
  GitBranch,
  MessageSquareText,
} from "lucide-react";

const problems = [
  {
    icon: FileSearch,
    title: "Too much code to read",
    description:
      "Large repositories make it difficult to quickly understand where important functionality lives.",
  },
  {
    icon: GitBranch,
    title: "Complex architecture",
    description:
      "Following dependencies, services and data flows manually takes valuable development time.",
  },
  {
    icon: MessageSquareText,
    title: "Knowledge gets lost",
    description:
      "Understanding a codebase often depends on tribal knowledge that is difficult to transfer.",
  },
  {
    icon: Brain,
    title: "Generic AI isn't enough",
    description:
      "General AI assistants don't automatically understand your repository's actual implementation.",
  },
];

export function ProblemSection() {
  return (
    <section className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          <div className="lg:sticky lg:top-32">
            <p className="text-sm font-semibold text-primary">
              THE PROBLEM
            </p>

            <h2 className="mt-3 font-heading text-3xl font-bold tracking-tight sm:text-4xl">
              Your codebase should not feel like a maze.
            </h2>

            <p className="mt-5 max-w-md leading-7 text-muted-foreground">
              BuildFolio turns your repositories into an intelligent,
              searchable workspace so you can understand unfamiliar code
              without spending hours navigating files manually.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {problems.map((item, index) => {
              const Icon = item.icon;

              return (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.4, delay: index * 0.08 }}
                  className="rounded-2xl border border-dashed bg-card p-6 transition-all hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
                >
                  <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="size-5" />
                  </div>

                  <h3 className="mt-5 font-semibold">{item.title}</h3>

                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {item.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}