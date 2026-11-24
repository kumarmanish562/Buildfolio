package com.buildfolio.backend.audit.controller;

import com.buildfolio.backend.audit.dto.FixVulnerabilityRequest;
import com.buildfolio.backend.audit.dto.FixVulnerabilityResponse;
import com.buildfolio.backend.audit.dto.SecurityAuditResponse;
import com.buildfolio.backend.audit.service.SecurityAuditService;
import com.buildfolio.backend.common.security.CurrentUser;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/repos/{id}/audit")
public class SecurityAuditController {

    private final CurrentUser currentUser;
    private final SecurityAuditService auditService;

    @PostMapping("/run")
    public ResponseEntity<SecurityAuditResponse> runAudit(@PathVariable UUID id) {
        UUID userId = currentUser.require().getId();
        SecurityAuditResponse response = auditService.performAudit(id, userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public SecurityAuditResponse getLatestAudit(@PathVariable UUID id) {
        UUID userId = currentUser.require().getId();
        return auditService.getLatestAudit(id, userId);
    }

    @PostMapping("/fix")
    public FixVulnerabilityResponse fixVulnerability(
            @PathVariable UUID id,
            @Valid @RequestBody FixVulnerabilityRequest request
    ) {
        UUID userId = currentUser.require().getId();
        return auditService.generateAndApplyVulnerabilityFix(id, userId, request);
    }
}
