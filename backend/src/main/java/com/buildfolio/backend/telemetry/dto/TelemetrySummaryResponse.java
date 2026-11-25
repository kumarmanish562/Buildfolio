package com.buildfolio.backend.telemetry.dto;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record TelemetrySummaryResponse(
        long totalEvents,
        List<EventCountDto> topEvents,
        List<DailyActivityDto> dailyActivity,
        List<RecentEventDto> recentEvents
) {
    public record EventCountDto(String eventName, long count) {}

    public record DailyActivityDto(String date, long count) {}

    public record RecentEventDto(
            UUID id,
            String eventName,
            String category,
            String metadata,
            Long durationMs,
            Instant createdAt
    ) {}
}
