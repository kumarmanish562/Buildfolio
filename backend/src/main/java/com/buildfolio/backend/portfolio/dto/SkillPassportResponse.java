package com.buildfolio.backend.portfolio.dto;

import java.util.List;

public record SkillPassportResponse(
        String username,
        String developerTitle,
        int overallScore,
        int totalReposAnalyzed,
        int verifiedSkillsCount,
        List<VerifiedSkillDto> skills,
        List<String> architecturalHighlights
) {
    public record VerifiedSkillDto(
            String name,
            String category,
            int proficiencyScore,
            String badgeLevel,
            String description,
            List<String> evidenceCitations
    ) {}
}
