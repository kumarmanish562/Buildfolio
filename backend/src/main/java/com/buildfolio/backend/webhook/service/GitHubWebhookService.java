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
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
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

    @Value("${app.webhook.secret:}")
    private String defaultWebhookSecret;

    public boolean verifySignature(String payload, String signatureHeader) {
        if (defaultWebhookSecret == null || defaultWebhookSecret.isBlank()) {
            return true; // No secret configured, allow payload
        }
        if (signatureHeader == null || !signatureHeader.startsWith("sha256=")) {
            log.warn("Missing or invalid X-Hub-Signature-256 header when secret is configured");
            return false;
        }

        try {
            String expectedHash = signatureHeader.substring("sha256=".length()).trim();
            Mac mac = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKey = new SecretKeySpec(defaultWebhookSecret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            mac.init(secretKey);
            byte[] computedHash = mac.doFinal(payload.getBytes(StandardCharsets.UTF_8));

            StringBuilder hex = new StringBuilder();
            for (byte b : computedHash) {
                String h = Integer.toHexString(0xff & b);
                if (h.length() == 1) hex.append('0');
                hex.append(h);
            }

            return MessageDigest.isEqual(hex.toString().getBytes(StandardCharsets.UTF_8), expectedHash.getBytes(StandardCharsets.UTF_8));
        } catch (Exception e) {
            log.error("Failed to verify HMAC signature", e);
            return false;
        }
    }

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
