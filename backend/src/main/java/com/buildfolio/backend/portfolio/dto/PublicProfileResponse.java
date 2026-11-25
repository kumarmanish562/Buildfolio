package com.buildfolio.backend.portfolio.dto;

import java.time.Instant;
import java.util.List;

public record PublicProfileResponse(
        String githubUsername,
        String displayName,
        String avatarUrl,
        String githubUrl,
        Instant memberSince,
        int publicProjectCount,
        Integer averageSecurityScore,
        List<String> aggregatedTechStack,
        List<PortfolioResponse> portfolios
) {
}
