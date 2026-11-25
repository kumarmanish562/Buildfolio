package com.buildfolio.backend.portfolio.dto;

import java.util.List;

public record SimulateArchitectureResponse(
        String scenario,
        String proposedMermaid,
        String tradeOffAnalysis,
        List<String> architecturalImpacts,
        String estimatedComplexity,
        String migrationStrategy
) {
}
