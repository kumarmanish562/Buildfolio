"use client";

import { motion } from "framer-motion";
import {
  Database,
  MessageSquare,
  Search,
} from "lucide-react";

import { GitHubIcon } from "@/components/icons/github-icon";

const steps = [
  {
    number: "01",
    icon: GitHubIcon,
    title: "Connect GitHub",
    description:
      "Authenticate securely with GitHub and select the repositories you want to understand.",
  },
  {
    number: "02",
    icon: Search,
    title: "Index your code",
    description:
      "BuildFolio reads your repository, creates meaningful chunks and generates searchable embeddings.",
  },
  {
    number: "03",
    icon: Database,
    title: "Build your knowledge layer",
    description:
      "Your indexed code is stored in a vector database for semantic retrieval.",
  },
  {
    number: "04",
    icon: MessageSquare,
    title: "Ask anything",
    description:
      "Ask natural-language questions and receive answers grounded in your actual source code.",
  },
];

export function WorkflowSection() {
  return (
    <section
      id="workflow"
      className="scroll-mt-24 border-y bg-muted/20 py-24 sm:py-32"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Section heading */}
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold text-primary">
            HOW IT WORKS
          </p>

          <h2 className="mt-3 font-heading text-3xl font-bold tracking-tight sm:text-4xl">
            From repository to answers in four steps.
          </h2>

          <p className="mt-4 text-muted-foreground">
            A simple workflow designed around how developers actually explore
            unfamiliar systems.
          </p>
        </div>

        {/* Steps */}
        <div className="relative mt-16 grid gap-5 md:grid-cols-2 lg:grid-cols-4">

          {/* Connection line */}
          <div
            className="
              pointer-events-none
              absolute
              left-[12%]
              right-[12%]
              top-12
              hidden
              border-t
              border-dashed
              border-primary/20
              lg:block
            "
          />

          {steps.map((step, index) => {
            const Icon = step.icon;

            return (
              <motion.div
                key={step.number}
                initial={{
                  opacity: 0,
                  y: 20,
                }}
                whileInView={{
                  opacity: 1,
                  y: 0,
                }}
                viewport={{
                  once: true,
                }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.08,
                }}
                className="
                  group
                  relative
                  rounded-2xl
                  border
                  bg-card
                  p-6
                  transition-all
                  duration-300
                  hover:-translate-y-1
                  hover:border-primary/30
                  hover:shadow-lg
                  hover:shadow-primary/5
                "
              >
                {/* Icon */}
                <div
                  className="
                    relative
                    z-10
                    flex
                    size-12
                    items-center
                    justify-center
                    rounded-xl
                    border
                    bg-background
                    text-primary
                    shadow-sm
                    transition-all
                    duration-300
                    group-hover:border-primary/30
                    group-hover:bg-primary/5
                  "
                >
                  <Icon
                    className="size-5"
                    aria-hidden="true"
                  />
                </div>

                {/* Number */}
                <span className="mt-6 block font-mono text-xs text-primary">
                  {step.number}
                </span>

                {/* Title */}
                <h3 className="mt-2 font-semibold">
                  {step.title}
                </h3>

                {/* Description */}
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {step.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}