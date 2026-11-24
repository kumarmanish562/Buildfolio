package com.buildfolio.backend.chat.service.ai;

import com.buildfolio.backend.chat.entity.ChatMessage;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.ai.chat.prompt.SystemPromptTemplate;
import org.springframework.ai.chat.messages.Message;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.ai.document.Document;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;

@Component
public class ChatPromptBuilder {

    private static final String SYSTEM_TEMPLATE = """
            You are an expert AI software architect and codebase assistant for Buildfolio.
            Answer developer queries accurately using ONLY the provided code snippets and conversation history whenever possible.
            If the answer cannot be determined from the provided context, state that clearly instead of hallucinating.
            Always refer to specific files, classes, and methods when relevant. Format code cleanly with markdown syntax highlighting.

            Code Context:
            {context}
            """;

    public Prompt buildPrompt(String userMessage, List<Document> contextDocuments) {
        return buildPrompt(userMessage, contextDocuments, Collections.emptyList());
    }

    public Prompt buildPrompt(String userMessage, List<Document> contextDocuments, List<ChatMessage> conversationHistory) {
        StringBuilder contextBuilder = new StringBuilder();
        if (contextDocuments == null || contextDocuments.isEmpty()) {
            contextBuilder.append("No directly matching indexed code snippets were found.");
        } else {
            for (Document doc : contextDocuments) {
                String filePath = String.valueOf(doc.getMetadata().getOrDefault("file_path", "unknown"));
                Object startLine = doc.getMetadata().getOrDefault("start_line", 1);
                Object endLine = doc.getMetadata().getOrDefault("end_line", 1);

                contextBuilder.append("\n--- File: ").append(filePath)
                        .append(" (lines ").append(startLine).append("-").append(endLine).append(") ---\n")
                        .append(doc.getText())
                        .append("\n");
            }
        }

        SystemPromptTemplate systemPromptTemplate = new SystemPromptTemplate(SYSTEM_TEMPLATE);
        Message systemMessage = systemPromptTemplate.createMessage(Map.of("context", contextBuilder.toString()));

        List<Message> messages = new ArrayList<>();
        messages.add(systemMessage);

        if (conversationHistory != null && !conversationHistory.isEmpty()) {
            for (ChatMessage past : conversationHistory) {
                if (past.getRole() == com.buildfolio.backend.chat.entity.MessageRole.USER) {
                    messages.add(new UserMessage(past.getContent()));
                } else if (past.getRole() == com.buildfolio.backend.chat.entity.MessageRole.ASSISTANT) {
                    messages.add(new org.springframework.ai.chat.messages.AssistantMessage(past.getContent()));
                }
            }
        }

        messages.add(new UserMessage(userMessage));

        return new Prompt(messages);
    }
}
