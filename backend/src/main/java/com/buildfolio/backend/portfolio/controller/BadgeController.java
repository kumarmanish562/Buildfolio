package com.buildfolio.backend.portfolio.controller;

import com.buildfolio.backend.audit.entity.SecurityAudit;
import com.buildfolio.backend.audit.repository.SecurityAuditRepository;
import com.buildfolio.backend.common.exception.NotFoundException;
import com.buildfolio.backend.portfolio.entity.Portfolio;
import com.buildfolio.backend.portfolio.repository.PortfolioRepository;
import com.buildfolio.backend.repo.entity.Repository;
import com.buildfolio.backend.repo.repository.RepositoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.nio.charset.StandardCharsets;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/public")
@RequiredArgsConstructor
public class BadgeController {

    private final RepositoryRepository repositoryRepository;
    private final PortfolioRepository portfolioRepository;
    private final SecurityAuditRepository securityAuditRepository;

    @GetMapping(value = "/repos/{id}/badge/security", produces = "image/svg+xml")
    public ResponseEntity<byte[]> getSecurityBadge(@PathVariable UUID id) {
        Repository repo = repositoryRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Repository not found"));

        Optional<SecurityAudit> auditOpt = securityAuditRepository.findTopByRepositoryIdOrderByCreatedAtDesc(repo.getId());

        int score = auditOpt.map(SecurityAudit::getOverallScore).orElse(100);
        String label = "security health";
        String value;
        String color;

        if (score >= 90) {
            value = score + "/100 A+";
            color = "#10b981"; // emerald
        } else if (score >= 75) {
            value = score + "/100 B";
            color = "#3b82f6"; // blue
        } else if (score >= 60) {
            value = score + "/100 C";
            color = "#f59e0b"; // amber
        } else {
            value = score + "/100 D";
            color = "#ef4444"; // red
        }

        String svg = generateShieldSvg(label, value, color);
        return badgeResponse(svg);
    }

    @GetMapping(value = "/repos/{id}/badge/architecture", produces = "image/svg+xml")
    public ResponseEntity<byte[]> getArchitectureBadge(@PathVariable UUID id) {
        Repository repo = repositoryRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Repository not found"));

        Optional<Portfolio> portfolioOpt = portfolioRepository.findByRepositoryId(repo.getId());

        String label = "buildfolio";
        String value = portfolioOpt.isPresent() ? "architecture verified" : "indexing";
        String color = portfolioOpt.isPresent() ? "#6366f1" : "#a855f7";

        String svg = generateShieldSvg(label, value, color);
        return badgeResponse(svg);
    }

    @GetMapping(value = "/repos/{id}/badge/stack", produces = "image/svg+xml")
    public ResponseEntity<byte[]> getStackBadge(@PathVariable UUID id) {
        Repository repo = repositoryRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Repository not found"));

        String label = "codebase";
        String value = repo.getLanguage() != null && !repo.getLanguage().isBlank()
                ? repo.getLanguage()
                : "polyglot";
        String color = "#0ea5e9";

        String svg = generateShieldSvg(label, value, color);
        return badgeResponse(svg);
    }

    private ResponseEntity<byte[]> badgeResponse(String svg) {
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_TYPE, "image/svg+xml;charset=utf-8")
                .header(HttpHeaders.CACHE_CONTROL, "no-cache, max-age=120, s-maxage=300")
                .body(svg.getBytes(StandardCharsets.UTF_8));
    }

    private String generateShieldSvg(String leftText, String rightText, String rightColor) {
        int leftWidth = 14 + (leftText.length() * 7);
        int rightWidth = 14 + (rightText.length() * 7);
        int totalWidth = leftWidth + rightWidth;

        int leftTextX = leftWidth / 2;
        int rightTextX = leftWidth + (rightWidth / 2);

        return """
                <svg xmlns="http://www.w3.org/2000/svg" width="%d" height="20" role="img" aria-label="%s: %s">
                  <linearGradient id="b" x2="0" y2="100%%">
                    <stop offset="0" stop-color="#bbb" stop-opacity=".1"/>
                    <stop offset="1" stop-opacity=".1"/>
                  </linearGradient>
                  <clipPath id="a">
                    <rect width="%d" height="20" rx="4" fill="#fff"/>
                  </clipPath>
                  <g clip-path="url(#a)">
                    <rect width="%d" height="20" fill="#18181b"/>
                    <rect x="%d" width="%d" height="20" fill="%s"/>
                    <rect width="%d" height="20" fill="url(#b)"/>
                  </g>
                  <g fill="#fff" text-anchor="middle" font-family="-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif" text-rendering="geometricPrecision" font-size="110">
                    <text aria-hidden="true" x="%d0" y="150" fill="#010101" fill-opacity=".3" transform="scale(.1)">%s</text>
                    <text x="%d0" y="140" transform="scale(.1)" fill="#fff">%s</text>
                    <text aria-hidden="true" x="%d0" y="150" fill="#010101" fill-opacity=".3" transform="scale(.1)">%s</text>
                    <text x="%d0" y="140" transform="scale(.1)" fill="#fff">%s</text>
                  </g>
                </svg>
                """.formatted(
                totalWidth, leftText, rightText,
                totalWidth,
                leftWidth,
                leftWidth, rightWidth, rightColor,
                totalWidth,
                leftTextX, leftText,
                leftTextX, leftText,
                rightTextX, rightText,
                rightTextX, rightText
        );
    }
}
