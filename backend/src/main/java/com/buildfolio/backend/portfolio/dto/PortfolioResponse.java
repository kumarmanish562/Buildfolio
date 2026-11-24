package com.buildfolio.backend.portfolio.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.Instant;
import java.util.UUID;

public record PortfolioResponse(
        UUID id,
        UUID repositoryId,
        String repositoryName,
        String repositoryFullName,
        String repositoryHtmlUrl,
        String title,
        String summary,
        String techStack,
        String architectureOverview,
        String mermaidDiagram,
        String keyFeatures,
        @JsonProperty("isPublic") boolean isPublic,
        Instant createdAt,
        Instant updatedAt
) {
}
