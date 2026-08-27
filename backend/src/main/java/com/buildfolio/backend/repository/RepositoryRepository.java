package com.buildfolio.backend.repository;

import com.buildfolio.backend.entity.Repository;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface RepositoryRepository extends JpaRepository<Repository, UUID> {

    // Get all repositories of a user, sorted alphabetically
    List<Repository> findByUserIdOrderByFullNameAsc(UUID userId);

    // Find a specific repository belonging to a specific user
    Optional<Repository> findByIdAndUserId(UUID id, UUID userId);

    // Find a repository using GitHub repository ID and Buildfolio user ID
    Optional<Repository> findByUserIdAndGithubRepoId(
            UUID userId,
            Long githubRepoId
    );
}