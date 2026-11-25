"use client";

import * as React from "react";
import { Check, Laptop, Moon, Palette, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { THEME_PRESETS } from "@/components/ui/theme-marketplace";

export function ModeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="outline"
            size="icon"
            aria-label="Toggle color theme"
          />
        }
      >
        <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        <span className="sr-only">Toggle theme</span>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel className="flex items-center gap-1.5 text-xs">
          <Palette className="size-3.5" aria-hidden="true" />
          Themes
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {THEME_PRESETS.map((preset) => (
          <DropdownMenuItem
            key={preset.id}
            onClick={() => setTheme(preset.id)}
            className="flex items-center justify-between gap-2"
          >
            <span className="flex items-center gap-2">
              <span
                className="size-3 rounded-full border border-foreground/20"
                style={{ backgroundColor: preset.swatches[2] }}
                aria-hidden="true"
              />
              <span>{preset.name}</span>
            </span>
            {theme === preset.id && <Check className="size-3.5 text-primary" />}
          </DropdownMenuItem>
        ))}

        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => setTheme("system")}
          className="flex items-center justify-between gap-2"
        >
          <span className="flex items-center gap-2">
            <Laptop className="size-3.5" aria-hidden="true" />
            <span>System</span>
          </span>
          {theme === "system" && <Check className="size-3.5 text-primary" />}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
