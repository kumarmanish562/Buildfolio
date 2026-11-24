package com.buildfolio.backend.portfolio.dto;

public record CreatePullRequestResponse(
        String pullRequestUrl,
        int pullRequestNumber,
        String branchName,
        String message
) {
}
