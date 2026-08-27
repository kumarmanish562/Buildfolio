package com.buildfolio.backend.controllers;

import java.util.List;
import java.util.UUID;

import com.buildfolio.backend.dto.ChatMessageRequest;
import com.buildfolio.backend.dto.ChatMessageResponse;
import com.buildfolio.backend.dto.ChatSessionResponse;
import com.buildfolio.backend.dto.CreateChatSessionRequest;
import com.buildfolio.backend.security.CurrentUser;
import com.buildfolio.backend.services.ChatService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatController {

    private final CurrentUser currentUser;
    private final ChatService chatService;

    @PostMapping("/sessions")
    public ResponseEntity<ChatSessionResponse> createSession(
            @Valid @RequestBody CreateChatSessionRequest request) {

        UUID userId = currentUser.require().getId();

        return ResponseEntity.ok(
                chatService.createSession(userId, request)
        );
    }

    @GetMapping("/sessions")
    public List<ChatSessionResponse> listSessions(
            @RequestParam UUID repositoryId) {

        UUID userId = currentUser.require().getId();

        return chatService.listSessions(userId, repositoryId);
    }

    @GetMapping("/sessions/{id}")
    public List<ChatMessageResponse> getMessages(
            @PathVariable UUID id) {

        UUID userId = currentUser.require().getId();

        return chatService.getMessages(userId, id);
    }

    @PostMapping(
            value = "/sessions/{id}/messages",
            produces = MediaType.TEXT_EVENT_STREAM_VALUE
    )
    public SseEmitter sendMessage(
            @PathVariable UUID id,
            @Valid @RequestBody ChatMessageRequest request) {

        UUID userId = currentUser.require().getId();

        return chatService.streamReply(
                userId,
                id,
                request.content()
        );
    }
}