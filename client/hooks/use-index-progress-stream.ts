"use client";

import { useEffect, useState } from "react";
import { getApiBaseUrl, IndexStatusResponse } from "@/lib/api";

export function useIndexProgressStream(repoId: string, enabled: boolean = true) {
  const [liveStatus, setLiveStatus] = useState<IndexStatusResponse | null>(null);

  useEffect(() => {
    if (!enabled || !repoId) return;

    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource(`${getApiBaseUrl()}/api/repos/${repoId}/index-stream`, {
        withCredentials: true,
      });

      eventSource.addEventListener("progress", (event) => {
        try {
          const data: IndexStatusResponse = JSON.parse(event.data);
          setLiveStatus(data);
          if (data.indexStatus === "READY" || data.indexStatus === "FAILED") {
            eventSource?.close();
          }
        } catch (e) {
          console.error("Failed to parse progress SSE event", e);
        }
      });

      eventSource.onerror = () => {
        eventSource?.close();
      };
    } catch (e) {
      console.error("Failed to initialize SSE EventSource", e);
    }

    return () => {
      eventSource?.close();
    };
  }, [repoId, enabled]);

  return liveStatus;
}
