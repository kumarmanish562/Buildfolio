import { api } from "@/lib/api";

export function trackTelemetryEvent(
  eventName: string,
  category = "general",
  metadata?: string,
  durationMs?: number
) {
  api
    .trackTelemetry({ eventName, category, metadata, durationMs })
    .catch(() => {
      // Telemetry is best-effort and should never interrupt user flows
    });
}
