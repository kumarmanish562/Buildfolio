package com.buildfolio.backend;

import com.buildfolio.backend.chat.entity.ChatMessage;
import com.buildfolio.backend.chat.entity.MessageRole;
import com.buildfolio.backend.chat.service.ai.ChatPromptBuilder;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

class ChatPromptBuilderTest {

    private ChatPromptBuilder promptBuilder;

    @BeforeEach
    void setUp() {
        promptBuilder = new ChatPromptBuilder();
    }

    @Test
    void testSystemPromptContainsRepoName() {
        String systemPrompt = promptBuilder.systemPrompt("octocat/Hello-World");
        assertNotNull(systemPrompt);
        assertTrue(systemPrompt.contains("octocat/Hello-World"));
        assertTrue(systemPrompt.contains("BuildFolio"));
    }

    @Test
    void testUserPromptWithEmptyHistory() {
        String prompt = promptBuilder.userPrompt("some code context", "What does main do?");
        assertNotNull(prompt);
        assertTrue(prompt.contains("<repository_context>"));
        assertTrue(prompt.contains("some code context"));
        assertTrue(prompt.contains("<user_question>"));
        assertTrue(prompt.contains("What does main do?"));
        assertFalse(prompt.contains("<conversation_history>"));
    }

    @Test
    void testUserPromptWithMultiTurnHistory() {
        ChatMessage msg1 = ChatMessage.builder()
                .id(UUID.randomUUID())
                .sessionId(UUID.randomUUID())
                .role(MessageRole.USER)
                .content("How do I start the app?")
                .createdAt(Instant.now())
                .build();

        ChatMessage msg2 = ChatMessage.builder()
                .id(UUID.randomUUID())
                .sessionId(UUID.randomUUID())
                .role(MessageRole.ASSISTANT)
                .content("Run mvn spring-boot:run to start the application.")
                .createdAt(Instant.now())
                .build();

        String prompt = promptBuilder.userPrompt(
                "public class Application { ... }",
                List.of(msg1, msg2),
                "Can I configure the port?"
        );

        assertNotNull(prompt);
        assertTrue(prompt.contains("<conversation_history>"));
        assertTrue(prompt.contains("USER: How do I start the app?"));
        assertTrue(prompt.contains("ASSISTANT: Run mvn spring-boot:run to start the application."));
        assertTrue(prompt.contains("Can I configure the port?"));
        assertTrue(prompt.contains("<repository_context>"));
    }
}
