package com.buildfolio.backend.webhook.service;

import com.buildfolio.backend.indexing.service.IndexingService;
import com.buildfolio.backend.repo.entity.Repository;
import com.buildfolio.backend.repo.repository.RepositoryRepository;
import com.buildfolio.backend.telemetry.dto.TrackTelemetryRequest;
import com.buildfolio.backend.telemetry.service.TelemetryService;
import com.buildfolio.backend.webhook.dto.GitHubWebhookResponse;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.Optional;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Slf4j
public class GitHubWebhookService {

    private final RepositoryRepository repositoryRepository;
    private final IndexingService indexingService;
    private final TelemetryService telemetryService;
    private final ObjectMapper objectMapper;

    public GitHubWebhookResponse processPushEvent(String payloadJson) {
        try {
            JsonNode root = objectMapper.readTree(payloadJson);
            JsonNode repoNode = root.path("repository");
            String fullName = repoNode.path("full_name").asText();
            String ref = root.path("ref").asText();

            log.info("Received GitHub push webhook for repository: {}, ref: {}", fullName, ref);

            if (fullName == null || fullName.isBlank()) {
                return new GitHubWebhookResponse("IGNORED", "unknown", 0, "No repository full_name in payload");
            }

            Optional<Repository> repoOpt = repositoryRepository.findByFullName(fullName);
            if (repoOpt.isEmpty()) {
                log.info("Repository {} not currently tracked in BuildFolio. Skipping.", fullName);
                return new GitHubWebhookResponse("IGNORED", fullName, 0, "Repository not tracked in BuildFolio");
            }

            Repository repo = repoOpt.get();

            // Extract modified/added file count from commits
            Set<String> affectedFiles = new HashSet<>();
            JsonNode commits = root.path("commits");
            if (commits.isArray()) {
                for (JsonNode commit : commits) {
                    commit.path("added").forEach(f -> affectedFiles.add(f.asText()));
                    commit.path("modified").forEach(f -> affectedFiles.add(f.asText()));
                    commit.path("removed").forEach(f -> affectedFiles.add(f.asText()));
                }
            }

            // Trigger re-indexing
            triggerAsyncSync(repo);

            telemetryService.track(
                    repo.getUserId(),
                    new TrackTelemetryRequest(
                            "webhook_sync_triggered",
                            "webhook",
                            "Push to " + fullName + " (" + affectedFiles.size() + " files)",
                            null
                    )
            );

            return new GitHubWebhookResponse(
                    "ACCEPTED",
                    fullName,
                    affectedFiles.size(),
                    "Triggered automatic codebase synchronization for " + fullName
            );

        } catch (Exception e) {
            log.error("Failed to parse GitHub push webhook payload", e);
            return new GitHubWebhookResponse("ERROR", "unknown", 0, "Payload parsing error: " + e.getMessage());
        }
    }

    @Async
    public void triggerAsyncSync(Repository repo) {
        try {
            indexingService.startIndexing(repo.getId(), repo.getUserId());
        } catch (Exception e) {
            log.error("Failed to start re-indexing from webhook for repo {}", repo.getFullName(), e);
        }
    }
}
