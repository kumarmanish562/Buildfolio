package com.buildfolio.backend.audit.repository;

import com.buildfolio.backend.audit.entity.SecurityAudit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface SecurityAuditRepository extends JpaRepository<SecurityAudit, UUID> {
    Optional<SecurityAudit> findTopByRepositoryIdOrderByCreatedAtDesc(UUID repositoryId);
}
