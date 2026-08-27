package com.buildfolio.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ChatMessageRequest(

        @NotBlank(
                message = "Message cannot be empty"
        )
        @Size(
                max = 10000,
                message = "Message cannot exceed 10000 characters"
        )
        String content
) {
}