package com.buildfolio.backend.portfolio.dto;

import java.util.List;

public record MicroserviceTopologyResponse(
        String username,
        int totalServices,
        List<ServiceNode> services,
        List<ServiceLink> connections
) {
    public record ServiceNode(
            String id,
            String name,
            String role, // "GATEWAY", "CORE_SERVICE", "DATA_STORE", "CLIENT_WEB", "EVENT_BUS"
            String language,
            String description,
            String repositoryUrl,
            List<String> protocols // e.g. ["HTTP/REST", "gRPC", "WebSocket", "Kafka"]
    ) {}

    public record ServiceLink(
            String source,
            String target,
            String protocol,
            String description
    ) {}
}
