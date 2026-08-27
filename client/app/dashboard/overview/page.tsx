"use client";

import { RequireAuth } from "@/components/providers/require-auth";
import { AppShell } from "@/components/layout/app-shell";
import { OverviewDashboard } from "@/components/dashboard/overview-dashboard";

export default function OverviewPage() {
  return (
    <RequireAuth>
      <AppShell
        title="Overview"
        description="Workspace stats and repository activity"
      >
        <OverviewDashboard />
      </AppShell>
    </RequireAuth>
  );
}