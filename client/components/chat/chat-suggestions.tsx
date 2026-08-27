"use client";

import {
  ArrowUpRight,
  GitBranch,
  ShieldCheck,
  Workflow,
} from "lucide-react";

const suggestions = [
  {
    label: "Explain the architecture",
    icon: Workflow,
  },
  {
    label: "Where is authentication handled?",
    icon: ShieldCheck,
  },
  {
    label: "Explain the repository indexing flow",
    icon: GitBranch,
  },
];

export function ChatSuggestions({
  onSelect,
}: {
  onSelect: (
    value: string
  ) => void;
}) {
  return (
    <div className="mx-auto grid w-full max-w-3xl gap-2 sm:grid-cols-3">

      {suggestions.map(
        ({
          label,
          icon: Icon,
        }) => (
          <button
            key={label}
            type="button"
            onClick={() =>
              onSelect(label)
            }
            className="group flex items-center gap-3 rounded-xl border border-dashed bg-card/60 p-3 text-left text-sm transition-all hover:-translate-y-0.5 hover:border-foreground/20 hover:bg-card hover:shadow-md"
          >
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted">
              <Icon className="size-4 text-muted-foreground" />
            </span>

            <span className="min-w-0 flex-1">
              <span className="block truncate font-medium">
                {label}
              </span>
            </span>

            <ArrowUpRight className="size-3.5 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </button>
        )
      )}

    </div>
  );
}