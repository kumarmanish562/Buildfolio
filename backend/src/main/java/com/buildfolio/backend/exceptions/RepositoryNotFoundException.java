package com.buildfolio.backend.exceptions;

public class RepositoryNotFoundException
        extends RuntimeException {

    public RepositoryNotFoundException(
            String message
    ) {
        super(message);
    }
}