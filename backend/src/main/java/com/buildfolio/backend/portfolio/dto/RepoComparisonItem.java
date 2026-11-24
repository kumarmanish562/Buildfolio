package com.buildfolio.backend.portfolio.dto;

import java.util.List;
import java.util.UUID;

public record RepoComparisonItem(
        UUID repositoryId,
        String name,
        String fullName,
        String language,
        String indexStatus,
        int filesCount,
        int chunkCount,
        String portfolioTitle,
        String architectureSummary,
        List<String> techStackCategories,
        Integer securityScore,
        String securityRiskLevel
) {
}
