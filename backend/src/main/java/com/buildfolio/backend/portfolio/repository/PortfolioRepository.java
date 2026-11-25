package com.buildfolio.backend.portfolio.repository;

import com.buildfolio.backend.portfolio.entity.Portfolio;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PortfolioRepository extends JpaRepository<Portfolio, UUID> {

    Optional<Portfolio> findByRepositoryId(UUID repositoryId);

    Optional<Portfolio> findByRepositoryIdAndUserId(UUID repositoryId, UUID userId);

    Optional<Portfolio> findByIdAndUserId(UUID id, UUID userId);

    Optional<Portfolio> findByIdAndIsPublicTrue(UUID id);

    List<Portfolio> findByUserIdAndIsPublicTrueOrderByUpdatedAtDesc(UUID userId);
}
