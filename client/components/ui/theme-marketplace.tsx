"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Check, Palette } from "lucide-react";
import { cn } from "@/lib/utils";

export type ThemePreset = {
  id: string;
  name: string;
  description: string;
  swatches: [string, string, string];
  isDark: boolean;
};

export const THEME_PRESETS: ThemePreset[] = [
  {
    id: "light",
    name: "Crisp Light",
    description: "Clean daylight workspace",
    swatches: ["#ffffff", "#f4f4f5", "#be185d"],
    isDark: false,
  },
  {
    id: "dark",
    name: "Obsidian Dark",
    description: "High-contrast studio dark",
    swatches: ["#141418", "#232329", "#db2777"],
    isDark: true,
  },
  {
    id: "midnight",
    name: "Midnight Indigo",
    description: "Deep indigo developer palette",
    swatches: ["#0f1224", "#1b203d", "#6366f1"],
    isDark: true,
  },
  {
    id: "emerald",
    name: "Emerald Terminal",
    description: "Forest slate & mint accents",
    swatches: ["#0d1915", "#172b24", "#10b981"],
    isDark: true,
  },
  {
    id: "sunset",
    name: "Amber Sunset",
    description: "Warm ember & copper tones",
    swatches: ["#1a1210", "#291b17", "#f97316"],
    isDark: true,
  },
  {
    id: "pastel",
    name: "Soft Pastel",
    description: "Gentle lavender & sky light",
    swatches: ["#faf8ff", "#ede9fe", "#7c3aed"],
    isDark: false,
  },
];

const emptySubscribe = () => () => {};

export function ThemeMarketplace() {
  const { theme, setTheme } = useTheme();
  const mounted = React.useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  const activeTheme = mounted ? theme ?? "system" : "system";

  return (
    <div className="space-y-3" role="radiogroup" aria-label="Theme Marketplace">
      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
        <Palette className="size-3.5" aria-hidden="true" />
        <span>Theme Marketplace</span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {THEME_PRESETS.map((preset) => {
          const selected = activeTheme === preset.id;
          return (
            <button
              key={preset.id}
              type="button"
              role="radio"
              aria-checked={selected}
              aria-label={`Select ${preset.name} theme`}
              onClick={() => setTheme(preset.id)}
              className={cn(
                "group relative flex flex-col gap-2 rounded-xl border p-3 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                selected
                  ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                  : "border-border bg-card/60 hover:border-primary/40 hover:bg-muted/40"
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  {preset.swatches.map((hex, idx) => (
                    <span
                      key={idx}
                      className="size-3.5 rounded-full border border-foreground/15 shadow-xs"
                      style={{ backgroundColor: hex }}
                      aria-hidden="true"
                    />
                  ))}
                </div>
                {selected && (
                  <span className="flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <Check className="size-3" aria-hidden="true" />
                  </span>
                )}
              </div>

              <div>
                <p className="text-sm font-medium leading-tight">{preset.name}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {preset.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
