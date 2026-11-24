package com.buildfolio.backend.portfolio.dto;

import java.util.List;

public record RepoComparisonResponse(
        List<RepoComparisonItem> repositories,
        String crossArchitectureSummary
) {
}
