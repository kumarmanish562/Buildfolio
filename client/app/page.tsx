import { LandingNavbar } from "@/components/landing/landing-navbar";
import { HeroSection } from "@/components/landing/hero-section";
import { TrustedSection } from "@/components/landing/trusted-section";
import { ProblemSection } from "@/components/landing/problem-section";
import { WorkflowSection } from "@/components/landing/workflow-section";
import { FeatureGrid } from "@/components/landing/feature-grid";
import { ChatPreview } from "@/components/landing/chat-preview";
import { IndexingPreview } from "@/components/landing/indexing-preview";
import { ArchitectureSection } from "@/components/landing/architecture-section";
import { SecuritySection } from "@/components/landing/security-section";
import { CTASection } from "@/components/landing/cta-section";
import { LandingFooter } from "@/components/landing/landing-footer";

import "@/styles/landing.css";

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-hidden bg-background">
      <LandingNavbar />

      <HeroSection />

      <TrustedSection />

      <ProblemSection />

      <WorkflowSection />

      <FeatureGrid />

      <ChatPreview />

      <IndexingPreview />

      <ArchitectureSection />

      <SecuritySection />

      <CTASection />

      <LandingFooter />
    </main>
  );
}