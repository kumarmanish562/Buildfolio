package com.buildfolio.backend.portfolio.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record SimulateArchitectureRequest(
        @NotBlank(message = "Scenario prompt cannot be blank")
        @Size(max = 1000, message = "Scenario prompt cannot exceed 1000 characters")
        String scenarioPrompt
) {
}
