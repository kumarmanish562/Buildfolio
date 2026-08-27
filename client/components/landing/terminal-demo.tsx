"use client";

import { motion } from "framer-motion";
import {
  CheckCircle2,
  ChevronRight,
  Circle,
  Terminal,
} from "lucide-react";

const lines = [
  {
    command: "connect github",
    result: "GitHub account connected",
  },
  {
    command: "index buildfolio",
    result: "142 files · 1,284 chunks indexed",
  },
  {
    command: 'ask "Where is authentication handled?"',
    result: "Found 8 relevant files",
  },
];

export function TerminalDemo() {
  return (
    <div className="mx-auto max-w-4xl text-left">
      <div className="overflow-hidden rounded-2xl border border-border/70 bg-card/90 shadow-2xl shadow-foreground/10 backdrop-blur-xl">
        <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
          <div className="flex items-center gap-1.5">
            <Circle className="size-2.5 fill-current text-muted-foreground/40" />
            <Circle className="size-2.5 fill-current text-muted-foreground/40" />
            <Circle className="size-2.5 fill-current text-muted-foreground/40" />
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Terminal className="size-3.5" />
            buildfolio
          </div>

          <div className="w-10" />
        </div>

        <div className="bg-[#0b0f0f] p-5 font-mono text-xs leading-7 text-white/80 sm:p-7 sm:text-sm">
          <div className="mb-6 flex items-center gap-2 text-white">
            <ChevronRight className="size-4 text-primary" />
            <span>buildfolio</span>
            <span className="text-primary">~</span>
            <span>$</span>
          </div>

          <div className="space-y-5">
            {lines.map((line, index) => (
              <motion.div
                key={line.command}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.4,
                  delay: index * 0.15,
                }}
              >
                <div className="flex gap-2">
                  <span className="text-primary">$</span>
                  <span className="text-white">{line.command}</span>
                </div>

                <div className="mt-1 flex items-center gap-2 pl-4 text-white/50">
                  <CheckCircle2 className="size-3.5 text-primary" />
                  {line.result}
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-7 flex items-center gap-2 border-t border-white/10 pt-5 text-white/40">
            <span className="text-primary">$</span>

            <span className="inline-block h-4 w-2 animate-pulse bg-white/60" />
          </div>
        </div>
      </div>
    </div>
  );
}