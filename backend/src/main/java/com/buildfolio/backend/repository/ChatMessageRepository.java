package com.buildfolio.backend.repository;

import java.util.List;
import java.util.UUID;

import com.buildfolio.backend.entity.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;



public interface ChatMessageRepository extends JpaRepository<ChatMessage, UUID> {
    List<ChatMessage> findBySessionIdOrderByCreatedAtAsc(UUID sessionId);
}