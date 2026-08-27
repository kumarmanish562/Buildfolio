package com.buildfolio.backend.services.github;

public class GithubApiException
        extends RuntimeException {

    private final int statusCode;

    public GithubApiException(
            int statusCode,
            String message
    ) {

        super(message);

        this.statusCode = statusCode;
    }

    public int getStatusCode() {
        return statusCode;
    }
}