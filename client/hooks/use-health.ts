"use client";

import {
  useQuery,
} from "@tanstack/react-query";

import { api } from "@/lib/api";

export function useBackendHealth() {
  return useQuery({
    queryKey: [
      "system",
      "health",
    ],

    queryFn: () =>
      api.health(),

    staleTime:
      30_000,

    retry: 1,
  });
}