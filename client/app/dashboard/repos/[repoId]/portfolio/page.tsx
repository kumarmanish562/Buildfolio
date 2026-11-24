"use client";

import { use } from "react";
import { RequireAuth } from "@/components/providers/require-auth";
import { AppShell } from "@/components/layout/app-shell";
import { PortfolioShowcase } from "@/components/portfolio/portfolio-showcase";

export default function RepositoryPortfolioPage({
  params,
}: {
  params: Promise<{
    repoId: string;
  }>;
}) {
  const { repoId } = use(params);

  return (
    <RequireAuth>
      <AppShell
        title="Technical Portfolio"
        description="AI-generated architecture showcase and engineering portfolio"
      >
        <PortfolioShowcase repoId={repoId} />
      </AppShell>
    </RequireAuth>
  );
}
