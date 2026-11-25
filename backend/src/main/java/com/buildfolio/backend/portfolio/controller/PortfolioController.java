package com.buildfolio.backend.portfolio.controller;

import com.buildfolio.backend.common.security.CurrentUser;
import com.buildfolio.backend.portfolio.dto.*;
import com.buildfolio.backend.portfolio.service.PortfolioService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequiredArgsConstructor
public class PortfolioController {

    private final CurrentUser currentUser;
    private final PortfolioService portfolioService;

    @PostMapping("/api/repos/{id}/portfolio/generate")
    public ResponseEntity<PortfolioResponse> generate(@PathVariable UUID id) {
        UUID userId = currentUser.require().getId();
        PortfolioResponse response = portfolioService.generatePortfolio(id, userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/api/repos/{id}/portfolio")
    public PortfolioResponse get(@PathVariable UUID id) {
        UUID userId = currentUser.require().getId();
        return portfolioService.getPortfolio(id, userId);
    }

    @PatchMapping("/api/repos/{id}/portfolio/visibility")
    public PortfolioResponse updateVisibility(
            @PathVariable UUID id,
            @Valid @RequestBody UpdatePortfolioVisibilityRequest request
    ) {
        UUID userId = currentUser.require().getId();
        return portfolioService.updateVisibility(id, userId, request.isPublic());
    }

    @DeleteMapping("/api/repos/{id}/portfolio")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable UUID id) {
        UUID userId = currentUser.require().getId();
        portfolioService.deletePortfolio(id, userId);
    }

    @PostMapping("/api/repos/{id}/portfolio/export-pr")
    public CreatePullRequestResponse exportPullRequest(@PathVariable UUID id) {
        UUID userId = currentUser.require().getId();
        return portfolioService.createArchitecturePullRequest(id, userId);
    }

    @GetMapping("/api/public/portfolios/{id}")
    public PortfolioResponse getPublic(@PathVariable UUID id) {
        return portfolioService.getPublicPortfolio(id);
    }

    @GetMapping("/api/public/profiles/{username}")
    public PublicProfileResponse getPublicProfile(@PathVariable String username) {
        return portfolioService.getPublicProfile(username);
    }

    @GetMapping("/api/public/profiles/{username}/passport")
    public SkillPassportResponse getSkillPassport(@PathVariable String username) {
        return portfolioService.getSkillPassport(username);
    }

    @PostMapping("/api/repos/compare")
    public RepoComparisonResponse compareRepositories(
            @RequestBody java.util.List<UUID> repositoryIds
    ) {
        UUID userId = currentUser.require().getId();
        return portfolioService.compareRepositories(repositoryIds, userId);
    }

    @PostMapping("/api/public/portfolios/{id}/ask")
    public PublicAskResponse askPublicPortfolio(
            @PathVariable UUID id,
            @Valid @RequestBody PublicAskRequest request
    ) {
        return portfolioService.askPublicPortfolio(id, request);
    }

    @GetMapping(value = "/api/public/portfolios/{id}/ask/stream", produces = org.springframework.http.MediaType.TEXT_EVENT_STREAM_VALUE)
    public org.springframework.web.servlet.mvc.method.annotation.SseEmitter streamAskPublicPortfolio(
            @PathVariable UUID id,
            @RequestParam String question
    ) {
        return portfolioService.streamAskPublicPortfolio(id, question);
    }

    @PostMapping("/api/repos/{id}/architecture/simulate")
    public SimulateArchitectureResponse simulateArchitecture(
            @PathVariable UUID id,
            @Valid @RequestBody SimulateArchitectureRequest request
    ) {
        UUID userId = currentUser.require().getId();
        return portfolioService.simulateArchitecture(id, userId, request);
    }

    @GetMapping("/api/repos/{id}/dependency-graph")
    public DependencyGraphResponse getDependencyGraph(@PathVariable UUID id) {
        UUID userId = currentUser.require().getId();
        return portfolioService.getDependencyGraph(id, userId);
    }

    @GetMapping("/api/public/portfolios/{id}/dependency-graph")
    public DependencyGraphResponse getPublicDependencyGraph(@PathVariable UUID id) {
        return portfolioService.getPublicDependencyGraph(id);
    }

    @GetMapping("/api/public/portfolios/{id}/api-spec")
    public ApiExplorerResponse getApiExplorer(@PathVariable UUID id) {
        return portfolioService.getApiExplorer(id);
    }

    @GetMapping("/api/public/profiles/{username}/topology")
    public MicroserviceTopologyResponse getMicroserviceTopology(@PathVariable String username) {
        return portfolioService.getMicroserviceTopology(username);
    }

    @GetMapping("/api/public/portfolios/{id}/anti-patterns")
    public AntiPatternAuditResponse getPublicAntiPatterns(@PathVariable UUID id) {
        return portfolioService.auditAntiPatterns(id);
    }

    @GetMapping("/api/repos/{id}/anti-patterns")
    public AntiPatternAuditResponse getRepoAntiPatterns(@PathVariable UUID id) {
        UUID userId = currentUser.require().getId();
        return portfolioService.auditAntiPatternsForRepo(id, userId);
    }
}
