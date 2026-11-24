"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, Portfolio } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";

export function usePortfolio(repoId: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.portfolio.byRepo(repoId),
    queryFn: () => api.getPortfolio(repoId),
    enabled: !!repoId && enabled,
    retry: false,
  });
}

export function useGeneratePortfolio(repoId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => api.generatePortfolio(repoId),
    onSuccess: (data: Portfolio) => {
      queryClient.setQueryData(queryKeys.portfolio.byRepo(repoId), data);
      queryClient.invalidateQueries({
        queryKey: queryKeys.portfolio.byRepo(repoId),
      });
    },
  });
}

export function useUpdatePortfolioVisibility(repoId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (isPublic: boolean) =>
      api.updatePortfolioVisibility(repoId, isPublic),
    onSuccess: (data: Portfolio) => {
      queryClient.setQueryData(queryKeys.portfolio.byRepo(repoId), data);
      queryClient.invalidateQueries({
        queryKey: queryKeys.portfolio.byRepo(repoId),
      });
    },
  });
}

export function usePublicPortfolio(portfolioId: string) {
  return useQuery({
    queryKey: queryKeys.portfolio.public(portfolioId),
    queryFn: () => api.getPublicPortfolio(portfolioId),
    enabled: !!portfolioId,
    retry: false,
  });
}
