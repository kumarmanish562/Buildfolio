"use client";

import { motion } from "framer-motion";
import {
  Bot,
  CheckCircle2,
  Code2,
  UserRound,
} from "lucide-react";

export function ChatPreview() {
  return (
    <section className="border-y bg-muted/20 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="text-sm font-semibold text-primary">AI CHAT</p>

            <h2 className="mt-3 font-heading text-3xl font-bold tracking-tight sm:text-4xl">
              Ask questions.
              <span className="block text-muted-foreground">
                Get code-grounded answers.
              </span>
            </h2>

            <p className="mt-5 max-w-lg leading-7 text-muted-foreground">
              Instead of guessing where functionality lives, ask BuildFolio
              directly. Responses are generated from the indexed repository
              context and include source citations.
            </p>

            <div className="mt-7 space-y-3">
              {[
                "Understand authentication flows",
                "Find API endpoints",
                "Explain architecture",
                "Locate database logic",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-2 text-sm"
                >
                  <CheckCircle2 className="size-4 text-primary" />
                  {item}
                </div>
              ))}
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="rounded-3xl border bg-card p-3 shadow-2xl shadow-foreground/10"
          >
            <div className="rounded-2xl border bg-background">
              <div className="flex items-center justify-between border-b px-4 py-3">
                <div>
                  <p className="text-sm font-medium">buildfolio</p>
                  <p className="text-xs text-muted-foreground">
                    AI repository assistant
                  </p>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-primary">
                  <span className="size-1.5 rounded-full bg-primary" />
                  Ready
                </div>
              </div>

              <div className="space-y-5 p-5">
                <div className="flex gap-3">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                    <UserRound className="size-4" />
                  </div>

                  <div className="rounded-2xl bg-muted px-4 py-3 text-sm">
                    Where is authentication handled?
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Bot className="size-4" />
                  </div>

                  <div className="min-w-0 flex-1 space-y-3">
                    <p className="text-sm leading-6 text-muted-foreground">
                      Authentication is handled through the security layer.
                      The main configuration defines protected routes and
                      authentication behavior.
                    </p>

                    <div className="rounded-xl border bg-muted/40 p-3 font-mono text-xs">
                      <div className="flex items-center gap-2 text-primary">
                        <Code2 className="size-3.5" />
                        SecurityConfig.java
                      </div>

                      <div className="mt-2 text-muted-foreground">
                        configure(HttpSecurity http)
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <span className="rounded-full border px-2.5 py-1 text-[11px] text-muted-foreground">
                        src/security/
                      </span>

                      <span className="rounded-full border px-2.5 py-1 text-[11px] text-muted-foreground">
                        Line 42
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t p-3">
                <div className="flex items-center rounded-xl border bg-card px-3 py-2.5 text-sm text-muted-foreground">
                  Ask about your codebase...
                  <span className="ml-auto text-xs">Enter ↵</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}