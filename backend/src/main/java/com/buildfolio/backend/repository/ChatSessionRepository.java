package com.buildfolio.backend.repository;

import com.buildfolio.backend.entity.ChatSession;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ChatSessionRepository
        extends JpaRepository<ChatSession, UUID> {

    List<ChatSession>
    findByUserIdAndRepositoryIdOrderByCreatedAtDesc(
            UUID userId,
            UUID repositoryId
    );

    Optional<ChatSession> findByIdAndUserId(
            UUID id,
            UUID userId
    );

    boolean existsByIdAndUserId(
            UUID id,
            UUID userId
    );
}