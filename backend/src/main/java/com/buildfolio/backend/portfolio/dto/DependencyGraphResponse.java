package com.buildfolio.backend.portfolio.dto;

import java.util.List;

public record DependencyGraphResponse(
        List<GraphNode> nodes,
        List<GraphLink> links,
        GraphMetrics metrics
) {
    public record GraphNode(
            String id,
            String name,
            String path,
            String type,
            int size
    ) {}

    public record GraphLink(
            String source,
            String target,
            String type
    ) {}

    public record GraphMetrics(
            int totalNodes,
            int totalLinks,
            int controllerCount,
            int serviceCount,
            int repositoryCount,
            int entityCount
    ) {}
}
