package com.buildfolio.backend.webhook.dto;

public record GitHubWebhookResponse(
        String status,
        String repository,
        int filesAffected,
        String message
) {
}
