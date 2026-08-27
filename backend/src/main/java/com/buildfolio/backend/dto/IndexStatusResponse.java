package com.buildfolio.backend.dto;


import com.buildfolio.backend.entity.IndexStatus;

import java.time.Instant;
import java.util.UUID;

public record IndexStatusResponse(
            UUID repositoryId,
            IndexStatus indexStatus,
            int filesTotal,
            int filesProcessed,
            int chunkCount,
            Instant indexedAt,
            String errorMessage) {
    }

