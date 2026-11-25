package com.buildfolio.backend.webhook.controller;

import com.buildfolio.backend.webhook.dto.GitHubWebhookResponse;
import com.buildfolio.backend.webhook.service.GitHubWebhookService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/webhooks")
@RequiredArgsConstructor
public class GitHubWebhookController {

    private final GitHubWebhookService gitHubWebhookService;

    @PostMapping("/github")
    public ResponseEntity<GitHubWebhookResponse> handleGitHubWebhook(
            @RequestHeader(value = "X-GitHub-Event", defaultValue = "push") String eventType,
            @RequestBody String payload
    ) {
        if (!"push".equalsIgnoreCase(eventType)) {
            return ResponseEntity.ok(new GitHubWebhookResponse(
                    "IGNORED",
                    "N/A",
                    0,
                    "Event type '" + eventType + "' ignored. Only 'push' triggers sync."
            ));
        }

        GitHubWebhookResponse response = gitHubWebhookService.processPushEvent(payload);
        return ResponseEntity.ok(response);
    }
}
