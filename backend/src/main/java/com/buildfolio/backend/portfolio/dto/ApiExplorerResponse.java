package com.buildfolio.backend.portfolio.dto;

import java.util.List;

public record ApiExplorerResponse(
        String repositoryName,
        String basePackage,
        int totalEndpoints,
        List<ApiEndpointItem> endpoints
) {
    public record ApiEndpointItem(
            String method,
            String path,
            String controller,
            String summary,
            String authRequirement,
            String requestBodyJson,
            String responseBodyJson
    ) {}
}
