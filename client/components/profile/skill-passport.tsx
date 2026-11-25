"use client";

import React, { useState } from "react";
import {
  ShieldCheck,
  Award,
  CheckCircle2,
  Share2,
  FileCode,
  ChevronDown,
  ChevronUp,
  Sparkles,
} from "lucide-react";
import { SkillPassport as SkillPassportType } from "@/lib/api";
import { toast } from "@/components/ui/toast";

interface SkillPassportProps {
  passport: SkillPassportType;
  username: string;
}

export function SkillPassport({ passport, username }: SkillPassportProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [expandedSkill, setExpandedSkill] = useState<string | null>(null);

  const categories = ["ALL", ...Array.from(new Set(passport.skills.map((s) => s.category)))];

  const filteredSkills =
    selectedCategory === "ALL"
      ? passport.skills
      : passport.skills.filter((s) => s.category === selectedCategory);

  const handleCopyLink = () => {
    const url = `${window.location.origin}/u/${username}#skill-passport`;
    navigator.clipboard.writeText(url);
    toast.add({
      title: "Passport Link Copied!",
      description: "Share your verified skill passport with recruiters or colleagues.",
      type: "success",
    });
  };

  return (
    <div
      id="skill-passport"
      className="relative overflow-hidden rounded-2xl border border-border/80 bg-gradient-to-br from-card via-card/90 to-card/50 p-6 md:p-8 shadow-xl backdrop-blur-sm transition-all"
    >
      {/* Decorative ambient background glows */}
      <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -left-20 -bottom-20 h-72 w-72 rounded-full bg-indigo-500/10 blur-3xl" />

      {/* Top Banner Header */}
      <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-border/60">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
            <ShieldCheck className="h-4 w-4" />
            <span>AI Verified Skill Passport</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">
            {passport.developerTitle}
          </h2>
          <p className="text-sm text-muted-foreground max-w-xl">
            Heuristics-verified engineering competency and architectural patterns derived from indexed codebase analysis across{" "}
            <span className="font-semibold text-foreground">{passport.totalReposAnalyzed} public repositories</span>.
          </p>
        </div>

        {/* Overall Score Badge & Share */}
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-center justify-center rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 min-w-[110px] text-center shadow-inner">
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
                {passport.overallScore}
              </span>
              <span className="text-xs font-medium text-emerald-600/70 dark:text-emerald-400/70">/100</span>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
              Audit Score
            </span>
          </div>

          <button
            onClick={handleCopyLink}
            aria-label="Share Verified Passport"
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-background/80 px-4 py-2.5 text-xs font-semibold text-foreground shadow-sm hover:bg-accent hover:text-accent-foreground transition-all active:scale-95"
          >
            <Share2 className="h-3.5 w-3.5" />
            <span>Share Passport</span>
          </button>
        </div>
      </div>

      {/* Architectural Highlights */}
      {passport.architecturalHighlights && passport.architecturalHighlights.length > 0 && (
        <div className="mt-6 rounded-xl border border-border/50 bg-accent/20 p-4">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            <span>Architectural Highlights</span>
          </div>
          <ul className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {passport.architecturalHighlights.map((highlight, idx) => (
              <li key={idx} className="flex items-start gap-2 text-xs text-muted-foreground">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 mt-0.5 shrink-0" />
                <span>{highlight}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Category Tabs */}
      <div className="mt-6 flex flex-wrap gap-2 pb-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
              selectedCategory === cat
                ? "bg-primary text-primary-foreground shadow"
                : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Verified Skills Grid */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredSkills.map((skill) => {
          const isExpanded = expandedSkill === skill.name;
          return (
            <div
              key={skill.name}
              className="group relative flex flex-col justify-between rounded-xl border border-border/70 bg-card/60 p-4 transition-all hover:border-border hover:shadow-md"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      {skill.category}
                    </span>
                    <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5 mt-0.5">
                      <Award className="h-4 w-4 text-emerald-500 shrink-0" />
                      {skill.name}
                    </h4>
                  </div>
                  <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    {skill.proficiencyScore}%
                  </span>
                </div>

                <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                  {skill.description}
                </p>

                {/* Score progress bar */}
                <div className="mt-3 h-1.5 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500"
                    style={{ width: `${skill.proficiencyScore}%` }}
                  />
                </div>
              </div>

              {/* Evidence citations toggle */}
              {skill.evidenceCitations && skill.evidenceCitations.length > 0 && (
                <div className="mt-3 pt-3 border-t border-border/40">
                  <button
                    onClick={() => setExpandedSkill(isExpanded ? null : skill.name)}
                    className="flex items-center justify-between w-full text-[11px] font-semibold text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <span className="flex items-center gap-1.5">
                      <FileCode className="h-3 w-3 text-emerald-500" />
                      {skill.evidenceCitations.length} Verified Evidence Snippets
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="h-3.5 w-3.5" />
                    ) : (
                      <ChevronDown className="h-3.5 w-3.5" />
                    )}
                  </button>

                  {isExpanded && (
                    <div className="mt-2 space-y-1.5 pl-2 border-l-2 border-emerald-500/40">
                      {skill.evidenceCitations.map((citation, cIdx) => (
                        <div
                          key={cIdx}
                          className="flex items-center gap-1.5 text-[11px] font-mono text-muted-foreground"
                        >
                          <span className="h-1 w-1 rounded-full bg-emerald-500" />
                          <span>{citation}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
