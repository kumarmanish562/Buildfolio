package com.buildfolio.backend.audit.dto;

import java.time.Instant;
import java.util.UUID;

public record SecurityAuditResponse(
        UUID id,
        UUID repositoryId,
        int overallScore,
        String riskLevel,
        String summary,
        String vulnerabilities,
        String recommendations,
        Instant createdAt
) {
}
