"use client";

import { motion } from "framer-motion";
import {
  BrainCircuit,
  Database,
  Globe2,
  Server,
  Sparkles,
} from "lucide-react";

import { GitHubIcon } from "@/components/icons/github-icon";

const layers = [
  {
    icon: Globe2,
    title: "Next.js",
    description: "Developer-focused web interface",
  },
  {
    icon: GitHubIcon,
    title: "GitHub OAuth",
    description: "Secure repository access",
  },
  {
    icon: Server,
    title: "Spring Boot",
    description: "REST APIs and application services",
  },
  {
    icon: BrainCircuit,
    title: "RAG Pipeline",
    description: "Retrieval and AI orchestration",
  },
  {
    icon: Database,
    title: "PostgreSQL + PGVector",
    description: "Persistent data and vector search",
  },
];

export function ArchitectureSection() {
  return (
    <section
      id="architecture"
      className="scroll-mt-24 border-y bg-muted/20 py-24 sm:py-32"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Section heading */}

        <div className="mx-auto max-w-2xl text-center">

          <p className="text-sm font-semibold tracking-wider text-primary">
            ARCHITECTURE
          </p>

          <h2 className="mt-3 font-heading text-3xl font-bold tracking-tight sm:text-4xl">
            Built like a real developer platform.
          </h2>

          <p className="mt-4 leading-7 text-muted-foreground">
            A modern full-stack architecture designed around authentication,
            indexing, retrieval, and streaming AI responses.
          </p>

        </div>

        {/* Architecture layers */}

        <div className="relative mx-auto mt-16 max-w-4xl">

          {/* Center connection line */}

          <div
            className="
              pointer-events-none
              absolute
              bottom-0
              left-1/2
              top-0
              hidden
              w-px
              -translate-x-1/2
              bg-linear-to-b
              from-transparent
              via-primary/20
              to-transparent
              md:block
            "
          />

          <div className="space-y-4">

            {layers.map((layer, index) => {

              const Icon = layer.icon;

              return (
                <motion.div
                  key={layer.title}
                  initial={{
                    opacity: 0,
                    x: index % 2 === 0 ? -20 : 20,
                  }}
                  whileInView={{
                    opacity: 1,
                    x: 0,
                  }}
                  viewport={{
                    once: true,
                    amount: 0.2,
                  }}
                  transition={{
                    duration: 0.5,
                    delay: index * 0.08,
                    ease: "easeOut",
                  }}
                  className="
                    relative
                    z-10
                    flex
                    items-center
                    gap-4
                    rounded-2xl
                    border
                    bg-card
                    p-5
                    shadow-sm
                    transition-all
                    duration-300
                    hover:-translate-y-0.5
                    hover:border-primary/30
                    hover:shadow-md
                    md:mx-auto
                    md:max-w-2xl
                  "
                >

                  {/* Icon */}

                  <div
                    className="
                      flex
                      size-11
                      shrink-0
                      items-center
                      justify-center
                      rounded-xl
                      bg-primary/10
                      text-primary
                    "
                  >
                    <Icon className="size-5" />
                  </div>

                  {/* Content */}

                  <div className="min-w-0 flex-1">

                    <h3 className="font-semibold">
                      {layer.title}
                    </h3>

                    <p className="mt-1 text-sm text-muted-foreground">
                      {layer.description}
                    </p>

                  </div>

                  {/* Connector icon */}

                  {index < layers.length - 1 && (
                    <Sparkles
                      className="
                        hidden
                        size-4
                        shrink-0
                        text-primary/40
                        sm:block
                      "
                    />
                  )}

                </motion.div>
              );
            })}

          </div>
        </div>

      </div>
    </section>
  );
}