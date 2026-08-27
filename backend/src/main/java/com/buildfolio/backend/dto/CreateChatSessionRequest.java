package com.buildfolio.backend.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.UUID;

public record CreateChatSessionRequest(

        @NotNull(
                message = "Repository ID is required"
        )
        UUID repositoryId,

        @Size(
                max = 200,
                message = "Title cannot exceed 200 characters"
        )
        String title
) {
}