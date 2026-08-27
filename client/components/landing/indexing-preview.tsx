"use client";

import { motion } from "framer-motion";
import {
  CheckCircle2,
  FileCode2,
  Database,
  Search,
} from "lucide-react";

export function IndexingPreview() {
  return (
    <section className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="order-2 lg:order-1"
          >
            <div className="rounded-3xl border bg-card p-5 shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold">Repository indexing</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    buildfolio/backend
                  </p>
                </div>

                <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                  Processing
                </span>
              </div>

              <div className="mt-7">
                <div className="mb-2 flex justify-between text-xs">
                  <span className="text-muted-foreground">
                    Files processed
                  </span>

                  <span className="font-medium">142 / 180</span>
                </div>

                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: "79%" }}
                    viewport={{ once: true }}
                    transition={{ duration: 1 }}
                    className="h-full rounded-full bg-primary"
                  />
                </div>
              </div>

              <div className="mt-7 grid gap-3 sm:grid-cols-3">
                <IndexStat
                  icon={FileCode2}
                  label="Files"
                  value="142"
                />

                <IndexStat
                  icon={Search}
                  label="Chunks"
                  value="1,284"
                />

                <IndexStat
                  icon={Database}
                  label="Vectors"
                  value="1,284"
                />
              </div>

              <div className="mt-6 space-y-2">
                {[
                  "src/security/SecurityConfig.java",
                  "src/services/ChatService.java",
                  "src/repository/RepoRepository.java",
                  "src/controller/ChatController.java",
                ].map((file) => (
                  <div
                    key={file}
                    className="flex items-center gap-2 rounded-lg border px-3 py-2 text-xs"
                  >
                    <CheckCircle2 className="size-3.5 text-primary" />
                    <span className="truncate font-mono text-muted-foreground">
                      {file}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          <div className="order-1 lg:order-2">
            <p className="text-sm font-semibold text-primary">
              CODE INDEXING
            </p>

            <h2 className="mt-3 font-heading text-3xl font-bold tracking-tight sm:text-4xl">
              Turn thousands of lines into searchable knowledge.
            </h2>

            <p className="mt-5 max-w-lg leading-7 text-muted-foreground">
              BuildFolio processes your repository into meaningful chunks and
              creates vector representations that allow semantic retrieval.
            </p>

            <div className="mt-8 space-y-4">
              <IndexPoint
                title="Repository-aware"
                description="Understands your actual project structure."
              />

              <IndexPoint
                title="Semantic retrieval"
                description="Finds relevant code even when your question doesn't use exact keywords."
              />

              <IndexPoint
                title="Citation-ready"
                description="Connect answers back to the files and lines that support them."
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function IndexStat({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof FileCode2;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border bg-muted/30 p-3">
      <Icon className="size-4 text-primary" />
      <p className="mt-3 text-lg font-semibold">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

function IndexPoint({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-3">
      <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-primary" />

      <div>
        <h3 className="text-sm font-semibold">{title}</h3>

        <p className="mt-1 text-sm leading-6 text-muted-foreground">
          {description}
        </p>
      </div>
    </div>
  );
}