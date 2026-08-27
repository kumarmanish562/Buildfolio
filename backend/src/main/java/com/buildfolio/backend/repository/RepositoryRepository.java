package com.buildfolio.backend.repository;

import com.buildfolio.backend.entity.Repository;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface RepositoryRepository
        extends JpaRepository<Repository, UUID> {

    List<Repository> findByUserIdOrderByFullNameAsc(UUID userId);

    Optional<Repository> findByIdAndUserId(
            UUID id,
            UUID userId
    );

    Optional<Repository> findByUserIdAndGithubRepoId(
            UUID userId,
            Long githubRepoId
    );

    boolean existsByIdAndUserId(
            UUID id,
            UUID userId
    );
}