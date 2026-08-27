package com.buildfolio.backend.services.ai;

import com.buildfolio.backend.dto.CitationDto;

import java.util.List;

public record RetrievedContext(
        List<CitationDto> citations,
        String contextText) {
}