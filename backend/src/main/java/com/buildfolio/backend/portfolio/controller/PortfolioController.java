package com.buildfolio.backend.portfolio.controller;

import com.buildfolio.backend.common.security.CurrentUser;
import com.buildfolio.backend.portfolio.dto.CreatePullRequestResponse;
import com.buildfolio.backend.portfolio.dto.PortfolioResponse;
import com.buildfolio.backend.portfolio.dto.UpdatePortfolioVisibilityRequest;
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
}
