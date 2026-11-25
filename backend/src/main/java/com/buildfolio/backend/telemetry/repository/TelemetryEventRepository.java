package com.buildfolio.backend.telemetry.repository;

import com.buildfolio.backend.telemetry.entity.TelemetryEvent;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface TelemetryEventRepository extends JpaRepository<TelemetryEvent, UUID> {

    List<TelemetryEvent> findTop100ByUserIdOrderByCreatedAtDesc(UUID userId);

    long countByUserId(UUID userId);
}
