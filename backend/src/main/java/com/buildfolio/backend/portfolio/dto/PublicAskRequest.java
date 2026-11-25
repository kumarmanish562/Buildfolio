package com.buildfolio.backend.portfolio.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record PublicAskRequest(
        @NotBlank(message = "Question cannot be blank")
        @Size(max = 1000, message = "Question cannot exceed 1000 characters")
        String question
) {
}
