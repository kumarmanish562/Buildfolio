"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, SecurityAudit, FixVulnerabilityRequest, FixVulnerabilityResponse } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";

export function useSecurityAudit(repoId: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.audit.byRepo(repoId),
    queryFn: () => api.getLatestSecurityAudit(repoId),
    enabled: !!repoId && enabled,
    retry: false,
  });
}

export function useRunSecurityAudit(repoId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => api.runSecurityAudit(repoId),
    onSuccess: (data: SecurityAudit) => {
      queryClient.setQueryData(queryKeys.audit.byRepo(repoId), data);
      queryClient.invalidateQueries({
        queryKey: queryKeys.audit.byRepo(repoId),
      });
    },
  });
}

export function useFixVulnerability(repoId: string) {
  return useMutation({
    mutationFn: (request: FixVulnerabilityRequest) =>
      api.fixVulnerability(repoId, request),
  });
}
