package com.buildfolio.backend.portfolio.dto;

import com.buildfolio.backend.chat.dto.CitationDto;

import java.util.List;

public record PublicAskResponse(
        String answer,
        List<CitationDto> citations
) {
}
