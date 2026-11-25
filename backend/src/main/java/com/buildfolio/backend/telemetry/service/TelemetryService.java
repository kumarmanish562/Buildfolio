package com.buildfolio.backend.telemetry.service;

import com.buildfolio.backend.telemetry.dto.TelemetrySummaryResponse;
import com.buildfolio.backend.telemetry.dto.TrackTelemetryRequest;
import com.buildfolio.backend.telemetry.entity.TelemetryEvent;
import com.buildfolio.backend.telemetry.repository.TelemetryEventRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TelemetryService {

    private final TelemetryEventRepository telemetryEventRepository;

    public TelemetryEvent track(UUID userId, TrackTelemetryRequest request) {
        TelemetryEvent event = TelemetryEvent.builder()
                .userId(userId)
                .eventName(request.eventName())
                .category(
                        request.category() != null && !request.category().isBlank()
                                ? request.category()
                                : "general"
                )
                .metadata(request.metadata())
                .durationMs(request.durationMs())
                .build();

        return telemetryEventRepository.save(event);
    }

    public TelemetrySummaryResponse getSummary(UUID userId) {
        long totalEvents = telemetryEventRepository.countByUserId(userId);
        List<TelemetryEvent> events = telemetryEventRepository
                .findTop100ByUserIdOrderByCreatedAtDesc(userId);

        Map<String, Long> countsByName = events.stream()
                .collect(Collectors.groupingBy(TelemetryEvent::getEventName, Collectors.counting()));

        List<TelemetrySummaryResponse.EventCountDto> topEvents = countsByName.entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                .limit(8)
                .map(e -> new TelemetrySummaryResponse.EventCountDto(e.getKey(), e.getValue()))
                .toList();

        LocalDate today = LocalDate.now(ZoneOffset.UTC);
        Map<String, Long> countsByDate = new LinkedHashMap<>();
        for (int i = 6; i >= 0; i--) {
            countsByDate.put(today.minusDays(i).toString(), 0L);
        }

        for (TelemetryEvent ev : events) {
            String day = ev.getCreatedAt().atZone(ZoneOffset.UTC).toLocalDate().toString();
            if (countsByDate.containsKey(day)) {
                countsByDate.put(day, countsByDate.get(day) + 1);
            }
        }

        List<TelemetrySummaryResponse.DailyActivityDto> dailyActivity = countsByDate.entrySet().stream()
                .map(e -> new TelemetrySummaryResponse.DailyActivityDto(e.getKey(), e.getValue()))
                .toList();

        List<TelemetrySummaryResponse.RecentEventDto> recentEvents = events.stream()
                .limit(15)
                .map(ev -> new TelemetrySummaryResponse.RecentEventDto(
                        ev.getId(),
                        ev.getEventName(),
                        ev.getCategory(),
                        ev.getMetadata(),
                        ev.getDurationMs(),
                        ev.getCreatedAt()
                ))
                .toList();

        return new TelemetrySummaryResponse(totalEvents, topEvents, dailyActivity, recentEvents);
    }
}
