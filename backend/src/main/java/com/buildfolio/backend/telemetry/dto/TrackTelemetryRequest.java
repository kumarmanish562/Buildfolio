package com.buildfolio.backend.telemetry.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record TrackTelemetryRequest(
        @NotBlank @Size(max = 64) String eventName,
        @Size(max = 32) String category,
        String metadata,
        Long durationMs
) {
}
