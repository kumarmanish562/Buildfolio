package com.buildfolio.backend.controllers;

import com.buildfolio.backend.dto.IndexStatusResponse;
import com.buildfolio.backend.dto.RepositoryResponse;
import com.buildfolio.backend.entity.Repository;
import com.buildfolio.backend.security.CurrentUser;
import com.buildfolio.backend.services.RepoService;
import com.buildfolio.backend.services.indexing.IndexingService;

import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/repos")
@RequiredArgsConstructor
public class RepoController {

    private final CurrentUser currentUser;
    private final RepoService repoService;
    private final IndexingService indexingService;

    @GetMapping
    public List<RepositoryResponse> list(
            @RequestParam(
                    name = "refresh",
                    defaultValue = "true"
            )
            boolean refresh
    ) {

        UUID userId =
                currentUser.require().getId();

        if (refresh) {
            return repoService.syncAndListRepos(userId);
        }

        return repoService.listStored(userId);
    }

    @GetMapping("/{id}")
    public RepositoryResponse get(
            @PathVariable UUID id
    ) {

        UUID userId =
                currentUser.require().getId();

        return repoService.toResponse(
                repoService.requireOwned(id, userId)
        );
    }

    @PostMapping("/{id}/index")
    public ResponseEntity<RepositoryResponse> index(
            @PathVariable UUID id
    ) {

        UUID userId =
                currentUser.require().getId();

        Repository repo =
                indexingService.startIndexing(
                        id,
                        userId
                );

        indexingService.indexAsync(
                id,
                userId
        );

        return ResponseEntity
                .status(HttpStatus.ACCEPTED)
                .body(
                        repoService.toResponse(repo)
                );
    }

    @GetMapping("/{id}/status")
    public IndexStatusResponse status(
            @PathVariable UUID id
    ) {

        UUID userId =
                currentUser.require().getId();

        return repoService.status(
                id,
                userId
        );
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(
            @PathVariable UUID id
    ) {

        UUID userId =
                currentUser.require().getId();

        repoService.deleteRepository(
                id,
                userId
        );
    }
}