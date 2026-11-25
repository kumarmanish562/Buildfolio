"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const TOUR_STORAGE_KEY = "buildfolio:tour-completed:v1";
const TOUR_TRIGGER_EVENT = "buildfolio:start-tour";

export type TourStep = {
  id: string;
  selector: string;
  title: string;
  description: string;
};

const TOUR_STEPS: TourStep[] = [
  {
    id: "sidebar",
    selector: '[data-tour="sidebar-nav"]',
    title: "Your Workspace Navigation",
    description:
      "Switch effortlessly between Overview, Repositories, Multi-Repo Compare Matrix, Analytics, and Settings.",
  },
  {
    id: "profile-hub",
    selector: '[data-tour="user-profile"]',
    title: "Public Developer Profile Hub",
    description:
      "Access your unified public profile (/u/[username]) showcasing all your verified repositories, architecture diagrams, and security health badges.",
  },
  {
    id: "theme",
    selector: '[data-tour="theme-toggle"]',
    title: "Theme Marketplace & Modes",
    description:
      "Choose from Crisp Light, Obsidian Dark, Midnight Indigo, Emerald Terminal, Amber Sunset, or Soft Pastel.",
  },
  {
    id: "overview",
    selector: '[data-tour="overview-widgets"]',
    title: "Customizable Dashboard Widgets",
    description:
      "Reorder or toggle KPI cards, Language Distribution charts, and Recent Repositories in Overview.",
  },
  {
    id: "compare",
    selector: '[data-tour="nav-/dashboard/compare"]',
    title: "Compare Matrix",
    description:
      "Select 2 to 4 repositories to generate an AI architectural synergy matrix with Recharts comparisons.",
  },
  {
    id: "analytics",
    selector: '[data-tour="nav-/dashboard/analytics"]',
    title: "Analytics & Telemetry",
    description:
      "Monitor anonymized workspace activity, feature usage trends, and portfolio engagement.",
  },
];

export function triggerOnboardingTour() {
  if (typeof window !== "undefined") {
    localStorage.removeItem(TOUR_STORAGE_KEY);
    window.dispatchEvent(new CustomEvent(TOUR_TRIGGER_EVENT));
  }
}

export function OnboardingTour() {
  const [open, setOpen] = React.useState(false);
  const [stepIndex, setStepIndex] = React.useState(0);
  const [rect, setRect] = React.useState<DOMRect | null>(null);

  React.useEffect(() => {
    const completed = localStorage.getItem(TOUR_STORAGE_KEY);
    if (!completed) {
      const timer = setTimeout(() => setOpen(true), 700);
      return () => clearTimeout(timer);
    }
  }, []);

  React.useEffect(() => {
    const handleTrigger = () => {
      setStepIndex(0);
      setOpen(true);
    };
    window.addEventListener(TOUR_TRIGGER_EVENT, handleTrigger);
    return () => window.removeEventListener(TOUR_TRIGGER_EVENT, handleTrigger);
  }, []);

  const currentStep = TOUR_STEPS[stepIndex];

  React.useEffect(() => {
    if (!open || !currentStep) return;

    const updateRect = () => {
      const el = document.querySelector(currentStep.selector);
      if (el) {
        const r = el.getBoundingClientRect();
        if (r.width > 0 && r.height > 0) {
          setRect(r);
          return;
        }
      }
      setRect(null);
    };

    updateRect();
    window.addEventListener("resize", updateRect);
    window.addEventListener("scroll", updateRect, true);
    return () => {
      window.removeEventListener("resize", updateRect);
      window.removeEventListener("scroll", updateRect, true);
    };
  }, [open, currentStep]);

  const handleDismiss = React.useCallback(() => {
    localStorage.setItem(TOUR_STORAGE_KEY, "true");
    setOpen(false);
  }, []);

  React.useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleDismiss();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, handleDismiss]);

  const handleNext = () => {
    if (stepIndex < TOUR_STEPS.length - 1) {
      setStepIndex((i) => i + 1);
    } else {
      handleDismiss();
    }
  };

  const handlePrev = () => {
    if (stepIndex > 0) {
      setStepIndex((i) => i - 1);
    }
  };

  return (
    <AnimatePresence>
      {open && currentStep && (
        <div
          className="fixed inset-0 z-50 print:hidden"
          role="dialog"
          aria-modal="true"
          aria-labelledby="onboarding-tour-title"
        >
          {/* Dimmed backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/55 backdrop-blur-[2px]"
            onClick={handleDismiss}
          />

          {/* Target highlight ring */}
          {rect && (
            <motion.div
              layout
              transition={{ type: "spring", stiffness: 320, damping: 28 }}
              className="pointer-events-none fixed rounded-xl border-2 border-primary shadow-[0_0_0_9999px_rgba(0,0,0,0.35)]"
              style={{
                top: Math.max(4, rect.top - 6),
                left: Math.max(4, rect.left - 6),
                width: rect.width + 12,
                height: rect.height + 12,
              }}
            />
          )}

          {/* Tour popover card */}
          <motion.div
            key={currentStep.id}
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            className="fixed bottom-6 right-6 z-50 w-[min(24rem,calc(100vw-2rem))] rounded-2xl border bg-popover p-5 text-popover-foreground shadow-2xl"
          >
            <div className="flex items-start justify-between gap-3">
              <Badge variant="secondary" className="gap-1 text-xs">
                <Sparkles className="size-3 text-primary" aria-hidden="true" />
                Step {stepIndex + 1} of {TOUR_STEPS.length}
              </Badge>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={handleDismiss}
                aria-label="Close onboarding tour"
              >
                <X className="size-4" aria-hidden="true" />
              </Button>
            </div>

            <h2
              id="onboarding-tour-title"
              className="mt-3 font-heading text-base font-semibold"
            >
              {currentStep.title}
            </h2>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
              {currentStep.description}
            </p>

            <div className="mt-5 flex items-center justify-between gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDismiss}
                className="text-xs text-muted-foreground"
              >
                Skip tour
              </Button>

              <div className="flex items-center gap-2">
                {stepIndex > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePrev}
                    className="gap-1 text-xs"
                  >
                    <ArrowLeft className="size-3.5" aria-hidden="true" />
                    Back
                  </Button>
                )}
                <Button size="sm" onClick={handleNext} className="gap-1 text-xs">
                  {stepIndex === TOUR_STEPS.length - 1 ? "Finish" : "Next"}
                  {stepIndex < TOUR_STEPS.length - 1 && (
                    <ArrowRight className="size-3.5" aria-hidden="true" />
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
