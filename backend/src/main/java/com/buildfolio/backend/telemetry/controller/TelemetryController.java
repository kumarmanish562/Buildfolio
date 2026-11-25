package com.buildfolio.backend.telemetry.controller;

import com.buildfolio.backend.common.security.CurrentUser;
import com.buildfolio.backend.telemetry.dto.TelemetrySummaryResponse;
import com.buildfolio.backend.telemetry.dto.TrackTelemetryRequest;
import com.buildfolio.backend.telemetry.service.TelemetryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/telemetry")
@RequiredArgsConstructor
public class TelemetryController {

    private final CurrentUser currentUser;
    private final TelemetryService telemetryService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public void track(@Valid @RequestBody TrackTelemetryRequest request) {
        UUID userId = currentUser.require().getId();
        telemetryService.track(userId, request);
    }

    @GetMapping("/summary")
    public TelemetrySummaryResponse getSummary() {
        UUID userId = currentUser.require().getId();
        return telemetryService.getSummary(userId);
    }
}
