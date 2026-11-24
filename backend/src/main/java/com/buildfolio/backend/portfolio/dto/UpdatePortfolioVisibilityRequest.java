package com.buildfolio.backend.portfolio.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotNull;

public record UpdatePortfolioVisibilityRequest(
        @NotNull @JsonProperty("isPublic") Boolean isPublic
) {
}
