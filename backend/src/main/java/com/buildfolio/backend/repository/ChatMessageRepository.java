package com.buildfolio.backend.repository;

import com.buildfolio.backend.entity.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ChatMessageRepository
        extends JpaRepository<ChatMessage, UUID> {

    List<ChatMessage>
    findBySessionIdOrderByCreatedAtAsc(
            UUID sessionId
    );

    void deleteBySessionId(UUID sessionId);
}