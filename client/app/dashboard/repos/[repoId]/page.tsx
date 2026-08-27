"use client";

import { use } from "react";

import { RequireAuth } from "@/components/providers/require-auth";
import { RepositoryDetails } from "@/components/dashboard/repository-details";

export default function RepositoryPage({
  params,
}: {
  params: Promise<{
    repoId: string;
  }>;
}) {
  const { repoId } = use(params);

  return (
    <RequireAuth>
      <RepositoryDetails repoId={repoId} />
    </RequireAuth>
  );
}