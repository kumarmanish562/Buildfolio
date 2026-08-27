package com.buildfolio.backend.exceptions;

import com.buildfolio.backend.services.github.GithubApiException;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(NotFoundException.class)
    ResponseEntity<Map<String, Object>> handleNotFound(
            NotFoundException ex
    ) {

        return error(
                HttpStatus.NOT_FOUND,
                ex.getMessage()
        );
    }

    @ExceptionHandler(BadRequestException.class)
    ResponseEntity<Map<String, Object>> handleBadRequest(
            BadRequestException ex
    ) {

        return error(
                HttpStatus.BAD_REQUEST,
                ex.getMessage()
        );
    }

    @ExceptionHandler(UnauthorizedException.class)
    ResponseEntity<Map<String, Object>> handleUnauthorized(
            UnauthorizedException ex
    ) {

        return error(
                HttpStatus.UNAUTHORIZED,
                ex.getMessage()
        );
    }

    @ExceptionHandler(GithubApiException.class)
    ResponseEntity<Map<String, Object>> handleGithub(
            GithubApiException ex
    ) {

        HttpStatus status;

        switch (ex.getStatusCode()) {

            case 401 ->
                    status = HttpStatus.UNAUTHORIZED;

            case 403 ->
                    status = HttpStatus.FORBIDDEN;

            case 404 ->
                    status = HttpStatus.NOT_FOUND;

            default ->
                    status = HttpStatus.BAD_GATEWAY;
        }

        return error(
                status,
                ex.getMessage()
        );
    }

    @ExceptionHandler(
            MethodArgumentNotValidException.class
    )
    ResponseEntity<Map<String, Object>> handleValidation(
            MethodArgumentNotValidException ex
    ) {

        String message =
                ex.getBindingResult()
                        .getFieldErrors()
                        .stream()
                        .findFirst()
                        .map(error ->
                                error.getField()
                                        + ": "
                                        + error.getDefaultMessage()
                        )
                        .orElse("Validation failed");

        return error(
                HttpStatus.BAD_REQUEST,
                message
        );
    }

    @ExceptionHandler(Exception.class)
    ResponseEntity<Map<String, Object>> handleGeneric(
            Exception ex
    ) {

        return error(
                HttpStatus.INTERNAL_SERVER_ERROR,
                ex.getMessage() != null
                        ? ex.getMessage()
                        : "Unexpected error"
        );
    }

    private ResponseEntity<Map<String, Object>> error(
            HttpStatus status,
            String message
    ) {

        return ResponseEntity
                .status(status)
                .body(
                        Map.of(
                                "status",
                                status.value(),

                                "error",
                                status.getReasonPhrase(),

                                "message",
                                message,

                                "timestamp",
                                Instant.now().toString()
                        )
                );
    }
}