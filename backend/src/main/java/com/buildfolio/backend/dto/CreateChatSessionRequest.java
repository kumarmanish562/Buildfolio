package com.buildfolio.backend.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.UUID;

public record CreateChatSessionRequest(

        @NotNull
        UUID repositoryId,

        @Size(max = 200)
        String title

) {
}