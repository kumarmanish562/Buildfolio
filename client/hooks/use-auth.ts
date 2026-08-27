"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { api } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";

export const AUTH_COOKIE = "buildfolio_auth";

/* ============================================================
   AUTH COOKIE
============================================================ */

export function setAuthCookie(authed: boolean) {
  if (typeof document === "undefined") {
    return;
  }

  if (authed) {
    document.cookie = [
      `${AUTH_COOKIE}=1`,
      "path=/",
      `max-age=${60 * 60 * 24 * 7}`,
      "SameSite=Lax",
    ].join("; ");
  } else {
    document.cookie = [
      `${AUTH_COOKIE}=`,
      "path=/",
      "max-age=0",
      "SameSite=Lax",
    ].join("; ");
  }
}

/* ============================================================
   CURRENT USER
============================================================ */

export function useCurrentUser() {
  return useQuery({
    queryKey: queryKeys.auth.me(),

    queryFn: async () => {
      try {
        const user = await api.me();

        // User is authenticated
        setAuthCookie(true);

        return user;
      } catch (error) {
        // User is not authenticated
        setAuthCookie(false);

        throw error;
      }
    },

    // Don't request /me on every render
    staleTime: 5 * 60 * 1000,

    // Authentication failure should not repeatedly retry
    retry: false,
  });
}

/* ============================================================
   LOGOUT
============================================================ */

export function useLogout() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: () => api.logout(),

    onSettled: async () => {
      // Remove frontend auth cookie
      setAuthCookie(false);

      // Clear current user immediately
      queryClient.setQueryData(
        queryKeys.auth.me(),
        null
      );

      // Invalidate auth-related queries
      await queryClient.invalidateQueries({
        queryKey: queryKeys.auth.all,
      });

      // Redirect to login
      router.replace("/login");
    },
  });
}