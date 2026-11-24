package com.buildfolio.backend.chat.service.ai;

import com.buildfolio.backend.chat.dto.CitationDto;

import java.util.List;

public record RetrievedContext(
        List<CitationDto> citations,
        String contextText
) {
}
