package com.buildfolio.backend.portfolio.dto;

import java.util.List;

public record AntiPatternAuditResponse(
        String repositoryName,
        String debtRating,
        int healthScore,
        double estimatedRefactorHours,
        int totalViolations,
        String executiveSummary,
        List<AntiPatternItem> violations
) {
    public record AntiPatternItem(
            String id,
            String ruleName,
            String severity,
            String category,
            String componentPath,
            String description,
            String impactExplanation,
            String remediationSnippet
    ) {}
}
